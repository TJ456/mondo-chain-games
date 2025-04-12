import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from "@/components/ui/card";
import GameCard from '@/components/GameCard';
import MonadStatus from '@/components/MonadStatus';
import ShardManager from '@/components/ShardManager';
import MonadBoostMechanic from '@/components/MonadBoostMechanic';
import GameRoomSelector from '@/components/GameRoomSelector';
import PlayerInventory from '@/components/PlayerInventory';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";
import { cards, currentPlayer, monadGameState } from '@/data/gameData';
import { Card as GameCardType, MonadGameMove, CardType, AIDifficultyTier, TierRequirement, Player as PlayerType } from '@/types/game';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package } from 'lucide-react';

// Constants for local storage keys
const STORAGE_KEY_SHARDS = "monad_game_shards";
const STORAGE_KEY_LAST_REDEMPTION = "monad_game_last_redemption";
const STORAGE_KEY_DAILY_TRIALS = "monad_game_daily_trials";
const STORAGE_KEY_PLAYER_CARDS = "monad_game_player_cards";

const Game = () => {
  const { toast: uiToast } = useToast();
  const [playerDeck, setPlayerDeck] = useState<GameCardType[]>(currentPlayer.cards);
  const [opponentCards, setOpponentCards] = useState<GameCardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<GameCardType | null>(null);
  const [gameStatus, setGameStatus] = useState<'room_select' | 'inventory' | 'waiting' | 'playing' | 'end'>('room_select');
  const [playerMana, setPlayerMana] = useState(10);
  const [opponentMana, setOpponentMana] = useState(10);
  const [playerHealth, setPlayerHealth] = useState(20);
  const [opponentHealth, setOpponentHealth] = useState(20);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [pendingMoves, setPendingMoves] = useState<MonadGameMove[]>([]);
  const [isOnChain, setIsOnChain] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [fatigueDamage, setFatigueDamage] = useState(1);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [playerData, setPlayerData] = useState<PlayerType>({
    ...currentPlayer,
    shards: 0, // Will be loaded from localStorage
    dailyTrialsRemaining: 3,
    lastTrialTime: 0
  });
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficultyTier>(AIDifficultyTier.NOVICE);
  const [playerMonadBalance, setPlayerMonadBalance] = useState(1000);
  const [boostActive, setBoostActive] = useState(false);
  const [boostDetails, setBoostDetails] = useState<{effect: number, remainingTurns: number} | null>(null);
  const [allPlayerCards, setAllPlayerCards] = useState<GameCardType[]>(currentPlayer.cards);

  // Load player data from localStorage on component mount
  useEffect(() => {
    // Load shards
    const savedShards = localStorage.getItem(STORAGE_KEY_SHARDS);
    const parsedShards = savedShards ? parseInt(savedShards, 10) : 0;
    
    // Load last redemption time
    const savedLastRedemption = localStorage.getItem(STORAGE_KEY_LAST_REDEMPTION);
    const parsedLastRedemption = savedLastRedemption ? parseInt(savedLastRedemption, 10) : 0;
    
    // Load daily trials remaining
    const savedDailyTrials = localStorage.getItem(STORAGE_KEY_DAILY_TRIALS);
    const parsedDailyTrials = savedDailyTrials ? parseInt(savedDailyTrials, 10) : 3;
    
    // Load player cards from localStorage
    const savedPlayerCards = localStorage.getItem(STORAGE_KEY_PLAYER_CARDS);
    const parsedPlayerCards = savedPlayerCards ? JSON.parse(savedPlayerCards) : currentPlayer.cards;
    
    // Reset daily trials if it's a new day
    const lastRedemptionDate = new Date(parsedLastRedemption);
    const currentDate = new Date();
    const isNewDay = lastRedemptionDate.getDate() !== currentDate.getDate() || 
                     lastRedemptionDate.getMonth() !== currentDate.getMonth() ||
                     lastRedemptionDate.getFullYear() !== currentDate.getFullYear();
    
    const dailyTrialsToSet = isNewDay ? 3 : parsedDailyTrials;
    
    // Update player data with saved values
    setPlayerData(prev => ({
      ...prev,
      shards: parsedShards,
      lastTrialTime: parsedLastRedemption,
      dailyTrialsRemaining: dailyTrialsToSet
    }));
    
    setAllPlayerCards(parsedPlayerCards);
    
    setIsOnChain(monadGameState.isOnChain && monadGameState.networkStatus === 'connected');
  }, []);
  
  // Save player data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHARDS, playerData.shards.toString());
    if (playerData.lastTrialTime) {
      localStorage.setItem(STORAGE_KEY_LAST_REDEMPTION, playerData.lastTrialTime.toString());
    }
    localStorage.setItem(STORAGE_KEY_DAILY_TRIALS, playerData.dailyTrialsRemaining.toString());
  }, [playerData.shards, playerData.lastTrialTime, playerData.dailyTrialsRemaining]);
  
  // Save player cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYER_CARDS, JSON.stringify(allPlayerCards));
  }, [allPlayerCards]);

  const getPlayableCards = useCallback((cards: GameCardType[], mana: number) => {
    return cards.filter(card => card.mana <= mana);
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    if (currentTurn === 'player') {
      const playableCards = getPlayableCards(playerDeck, playerMana);
      if (playableCards.length === 0 && playerDeck.length > 0) {
        handleNoPlayableCards('player', 'No playable cards available. Turn passed to opponent.');
      } else if (playerDeck.length === 0) {
        handleFatigue('player');
      }
    }
  }, [currentTurn, playerDeck, playerMana, gameStatus, getPlayableCards]);

  const handleSelectDifficulty = (difficulty: AIDifficultyTier) => {
    setAiDifficulty(difficulty);
    
    // Set up opponent cards based on difficulty
    let opponentCardPool: GameCardType[];
    
    switch (difficulty) {
      case AIDifficultyTier.NOVICE:
        // Basic cards with lower stats
        opponentCardPool = cards
          .filter(card => card.rarity !== 'epic' && card.rarity !== 'legendary')
          .map(card => ({
            ...card,
            attack: card.attack ? Math.max(1, Math.floor(card.attack * 0.8)) : undefined,
            defense: card.defense ? Math.max(1, Math.floor(card.defense * 0.8)) : undefined
          }));
        break;
        
      case AIDifficultyTier.VETERAN:
        // Regular cards with normal stats
        opponentCardPool = cards.filter(card => card.rarity !== 'legendary');
        break;
        
      case AIDifficultyTier.LEGEND:
        // Enhanced cards with higher stats
        opponentCardPool = cards.map(card => ({
          ...card,
          attack: card.attack ? Math.floor(card.attack * 1.2) : undefined,
          defense: card.defense ? Math.floor(card.defense * 1.2) : undefined
        }));
        break;
        
      default:
        opponentCardPool = cards;
    }
    
    // Select 3 random cards from the pool
    const randomCards: GameCardType[] = [];
    while (randomCards.length < 3 && opponentCardPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponentCardPool.length);
      randomCards.push(opponentCardPool[randomIndex]);
      opponentCardPool.splice(randomIndex, 1);
    }
    
    setOpponentCards(randomCards);
    setGameStatus('waiting');
    
    // Show toast based on difficulty
    let difficultyName = '';
    let description = '';
    
    switch (difficulty) {
      case AIDifficultyTier.NOVICE:
        difficultyName = 'Novice';
        description = 'Perfect for beginners. Learn the basics of Monad battles.';
        break;
      case AIDifficultyTier.VETERAN:
        difficultyName = 'Veteran';
        description = 'For experienced players. Face smarter opponents.';
        break;
      case AIDifficultyTier.LEGEND:
        difficultyName = 'Legend';
        description = 'For masters only. Face the ultimate challenge.';
        break;
    }
    
    toast.success(`Entered ${difficultyName} Room`, {
      description: description
    });
  };
  
  const openInventory = () => {
    setGameStatus('inventory');
  };
  
  const closeInventory = () => {
    setGameStatus('waiting');
  };

  const selectDeckCards = () => {
    // For now, just select the first 3 cards from the player's collection
    // In a more complex version, this would let players choose their deck
    const selectedCards = allPlayerCards.slice(0, 3);
    setPlayerDeck(selectedCards);
    setGameStatus('waiting');
  };

  const startGame = () => {
    resetGame();
    setGameStatus('playing');
    setCurrentTurn('player');
    setBattleLog(['Battle has begun on the MONAD blockchain! Your turn.']);
    
    uiToast({
      title: "Game Started",
      description: "The battle has begun! Play your first card.",
    });
    
    toast.success("Connected to MONAD blockchain", {
      description: `Current block: ${monadGameState.currentBlockHeight}`,
      duration: 3000,
    });
  };

  const handleBoostActivation = (amount: number, boostEffect: number, duration: number) => {
    setPlayerDeck(prevCards =>
      prevCards.map(card => ({
        ...card,
        originalAttack: card.attack,
        originalDefense: card.defense,
        originalSpecial: card.special,
        attack: card.attack ? Math.floor(card.attack * (1 + boostEffect / 100)) : undefined,
        defense: card.defense ? Math.floor(card.defense * (1 + boostEffect / 100)) : undefined,
        special: card.special ? Math.floor(card.special * (1 + boostEffect / 100)) : undefined,
        boosted: true,
      }))
    );
    setBoostActive(true);
    setBoostDetails({ effect: boostEffect, remainingTurns: duration });
    setPlayerMonadBalance(prev => prev - amount);
    
    setBattleLog(prev => [...prev, `MONAD Boost activated! +${boostEffect}% power for ${duration} turns`]);
    
    toast.success("Card Boost Activated!", {
      description: `All cards powered up by ${boostEffect}% for ${duration} turns`,
    });
  };

  const endTurn = useCallback((nextPlayer: 'player' | 'opponent') => {
    if (boostActive && boostDetails) {
      const newTurnsLeft = boostDetails.remainingTurns - 1;
      
      if (newTurnsLeft <= 0) {
        setPlayerDeck(prevCards =>
          prevCards.map(card => ({
            ...card,
            attack: card.originalAttack,
            defense: card.originalDefense,
            special: card.originalSpecial,
            boosted: false,
          }))
        );
        setBoostActive(false);
        setBoostDetails(null);
        setBattleLog(prev => [...prev, "MONAD Boost expired - cards returned to normal"]);
      } else {
        setBoostDetails(prev => ({
          ...prev!,
          remainingTurns: newTurnsLeft
        }));
        if (newTurnsLeft === 1) {
          setBattleLog(prev => [...prev, "MONAD Boost will expire next turn!"]);
        }
      }
    }

    setCurrentTurn(nextPlayer);
    
    if (nextPlayer === 'player') {
      setPlayerMana(prev => Math.min(10, prev + 1));
    } else {
      setOpponentMana(prev => Math.min(10, prev + 1));
    }

    setSelectedCard(null);
    
    if (nextPlayer === 'opponent') {
      setTimeout(handleOpponentTurn, 1000);
    }
  }, [boostActive, boostDetails]);

  const handleNoPlayableCards = (player: 'player' | 'opponent', message: string) => {
    const newLogs = [...battleLog, message];
    setBattleLog(newLogs);
    
    if (player === 'player') {
      endTurn('opponent');
    } else {
      endTurn('player');
    }
  };

  const handleFatigue = (target: 'player' | 'opponent') => {
    const damage = fatigueDamage;
    const message = `${target === 'player' ? 'You take' : 'Opponent takes'} ${damage} fatigue damage.`;
    
    if (target === 'player') {
      setPlayerHealth(prev => Math.max(0, prev - damage));
      if (playerHealth - damage <= 0) {
        endGame(false);
        return;
      }
    } else {
      setOpponentHealth(prev => Math.max(0, prev - damage));
      if (opponentHealth - damage <= 0) {
        endGame(true);
        return;
      }
    }

    setBattleLog(prev => [...prev, message]);
    setFatigueDamage(prev => prev + 1);
    setConsecutiveSkips(prev => prev + 1);

    // Only end in a tie if there are multiple skips in a row
    if (consecutiveSkips >= 3) {
      endGame(null);
      return;
    }

    endTurn(target === 'player' ? 'opponent' : 'player');
  };

  const handleOpponentTurn = useCallback(() => {
    if (gameStatus !== 'playing') return;

    const playableCards = getPlayableCards(opponentCards, opponentMana);

    if (playableCards.length > 0) {
      // Enhanced AI logic based on difficulty level
      let cardToPlay: GameCardType;
      
      switch (aiDifficulty) {
        case AIDifficultyTier.NOVICE:
          // Novice AI: Randomly selects any playable card
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          break;
          
        case AIDifficultyTier.VETERAN:
          // Veteran AI: Makes smarter choices based on game state
          if (opponentHealth < 8) {
            // Prioritize defense when low health
            const defenseCards = playableCards.filter(c => c.defense && c.defense > 0);
            cardToPlay = defenseCards.length > 0 
              ? defenseCards.reduce((best, current) => (current.defense! > best.defense!) ? current : best, defenseCards[0]) 
              : playableCards[Math.floor(Math.random() * playableCards.length)];
          } else if (playerHealth < 10) {
            // Prioritize attack when player is low health
            const attackCards = playableCards.filter(c => c.attack && c.attack > 0);
            cardToPlay = attackCards.length > 0 
              ? attackCards.reduce((best, current) => (current.attack! > best.attack!) ? current : best, attackCards[0]) 
              : playableCards[Math.floor(Math.random() * playableCards.length)];
          } else {
            // Otherwise play the highest value card
            cardToPlay = playableCards.reduce((best, current) => {
              const currentValue = (current.attack || 0) + (current.defense || 0);
              const bestValue = (best.attack || 0) + (best.defense || 0);
              return currentValue > bestValue ? current : best;
            }, playableCards[0]);
          }
          break;
          
        case AIDifficultyTier.LEGEND:
          // Legend AI: Uses advanced strategy with lookahead
          // Calculate best move considering current state and potential future states
          const scoredCards = playableCards.map(card => {
            let score = 0;
            
            // Base score is the card's combined attack/defense value
            score += (card.attack || 0) * 1.2; // Value attack slightly higher
            score += (card.defense || 0);
            
            // Strategic modifiers
            if (playerHealth <= card.attack!) {
              // Lethal play gets highest priority
              score += 100;
            } else if (opponentHealth < 8) {
              // When low on health, healing is valuable
              score += (card.defense || 0) * 2;
            } else if (playerMana > 8) {
              // If player has lots of mana, prioritize attack to put pressure
              score += (card.attack || 0) * 0.5;
            }
            
            // Consider mana efficiency
            score = score / card.mana;
            
            return { card, score };
          });
          
          // Pick the highest scoring card
          cardToPlay = scoredCards.reduce((best, current) => 
            current.score > best.score ? current : best, scoredCards[0]
          ).card;
          break;
          
        default:
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
      }

      setOpponentMana(prev => prev - cardToPlay.mana);
      setOpponentCards(prev => prev.filter(c => c.id !== cardToPlay.id));

      let logEntry = `Opponent played ${cardToPlay.name}.`;
      let newPlayerHealth = playerHealth;
      let newOpponentHealth = opponentHealth;

      if (cardToPlay.attack) {
        newPlayerHealth = Math.max(0, playerHealth - cardToPlay.attack);
        logEntry += ` Dealt ${cardToPlay.attack} damage.`;
      }

      if (cardToPlay.defense) {
        newOpponentHealth = Math.min(30, opponentHealth + cardToPlay.defense);
        logEntry += ` Gained ${cardToPlay.defense} health.`;
      }

      if (cardToPlay.specialEffect) {
        logEntry += ` ${cardToPlay.specialEffect.description}`;
        // Apply special effects based on difficulty level
        switch (aiDifficulty) {
          case AIDifficultyTier.VETERAN:
            // Veteran AI gets a 20% boost to special effects
            if (cardToPlay.specialEffect.type === 'damage') {
              const extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.2);
              newPlayerHealth = Math.max(0, newPlayerHealth - extraDamage);
              logEntry += ` +${extraDamage} bonus damage!`;
            } else if (cardToPlay.specialEffect.type === 'heal') {
              const extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.2);
              newOpponentHealth = Math.min(30, newOpponentHealth + extraHeal);
              logEntry += ` +${extraHeal} bonus healing!`;
            }
            break;
            
          case AIDifficultyTier.LEGEND:
            // Legend AI gets a 50% boost to special effects
            if (cardToPlay.specialEffect.type === 'damage') {
              const extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.5);
              newPlayerHealth = Math.max(0, newPlayerHealth - extraDamage);
              logEntry += ` +${extraDamage} bonus damage!`;
            } else if (cardToPlay.specialEffect.type === 'heal') {
              const extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.5);
              newOpponentHealth = Math.min(30, newOpponentHealth + extraHeal);
              logEntry += ` +${extraHeal} bonus healing!`;
            }
            break;
        }
      }

      setPlayerHealth(newPlayerHealth);
      setOpponentHealth(newOpponentHealth);
      setBattleLog(prev => [...prev, logEntry]);

      // Reset consecutive skips counter since a card was played
      setConsecutiveSkips(0);

      if (newPlayerHealth <= 0) {
        endGame(false);
        return;
      }

      endTurn('player');

      const playerCanPlay = getPlayableCards(playerDeck, playerMana + 1).length > 0;
      if (!playerCanPlay) {
        if (playerDeck.length === 0) {
          setTimeout(() => handleFatigue('player'), 1000);
        } else {
          setTimeout(() => {
            setBattleLog(prev => [...prev, "No playable cards - turn passed."]);
            endTurn('opponent');
          }, 1000);
        }
      }

    } else if (opponentCards.length === 0) {
      handleFatigue('opponent');
    } else {
      setBattleLog(prev => [...prev, "Opponent passes (no playable cards)"]);
      endTurn('player');
    }
  }, [gameStatus, opponentCards, opponentMana, playerDeck, playerMana, opponentHealth, playerHealth, endTurn, getPlayableCards, aiDifficulty]);

  const playCard = (card: GameCardType) => {
    if (gameStatus !== 'playing' || currentTurn !== 'player') {
      toast.warning("Not your turn!");
      return;
    }

    if (playerMana < card.mana) {
      toast.warning(`Not enough mana (Need ${card.mana}, have ${playerMana})`);
      return;
    }

    const newMove: MonadGameMove = {
      moveId: `move-${Date.now()}`,
      playerAddress: currentPlayer.monadAddress,
      cardId: card.id,
      moveType: card.type.toLowerCase() as 'attack' | 'defend' | 'special',
      timestamp: Date.now(),
      verified: false
    };

    setPlayerMana(prev => prev - card.mana);
    setPlayerDeck(prev => prev.filter(c => c.id !== card.id));
    setSelectedCard(card);

    let logEntry = `You played ${card.name}.`;
    let opponentNewHealth = opponentHealth;
    let playerNewHealth = playerHealth;

    if (card.attack) {
      opponentNewHealth = Math.max(0, opponentHealth - card.attack);
      logEntry += ` Dealt ${card.attack} damage.`;
    }

    if (card.defense) {
      playerNewHealth = Math.min(30, playerHealth + card.defense);
      logEntry += ` Gained ${card.defense} health.`;
    }

    if (card.specialEffect) {
      logEntry += ` ${card.specialEffect.description}`;
      // Implement special effects logic here
      if (card.specialEffect.type === 'damage') {
        opponentNewHealth = Math.max(0, opponentNewHealth - card.specialEffect.value);
        logEntry += ` (${card.specialEffect.value} extra damage)`;
      } else if (card.specialEffect.type === 'heal') {
        playerNewHealth = Math.min(30, playerNewHealth + card.specialEffect.value);
        logEntry += ` (${card.specialEffect.value} extra healing)`;
      }
    }

    setOpponentHealth(opponentNewHealth);
    setPlayerHealth(playerNewHealth);
    setBattleLog(prev => [...prev, logEntry]);
    setPendingMoves(prev => [...prev, newMove]);
    
    // Reset consecutive skips counter since a card was played
    setConsecutiveSkips(0);
    
    toast.loading("Submitting move to MONAD blockchain...", {
      id: newMove.moveId,
      duration: 2000,
    });

    setTimeout(() => {
      setPendingMoves(prev => 
        prev.map(m => m.moveId === newMove.moveId ? { 
          ...m, 
          verified: true,
          onChainSignature: `0x${Math.random().toString(16).slice(2, 10)}` 
        } : m)
      );
      
      toast.success("Move confirmed on-chain", {
        id: newMove.moveId,
        description: `Block: ${monadGameState.currentBlockHeight! + 1}`,
      });

      if (opponentNewHealth <= 0) {
        endGame(true);
        return;
      }

      endTurn('opponent');
    }, isOnChain ? 2000 : 500);
  };

  const getShardReward = () => {
    switch (aiDifficulty) {
      case AIDifficultyTier.NOVICE:
        return 1;
      case AIDifficultyTier.VETERAN:
        return 3;
      case AIDifficultyTier.LEGEND:
        return 5;
      default:
        return 1;
    }
  };

  // Enhanced shard redemption with NFT acquisition simulation
  const handleShardRedemption = () => {
    // Check if player has enough shards
    if (playerData.shards < 10) {
      toast.error("Not enough shards", {
        description: `You need 10 shards to redeem an NFT card.`
      });
      return;
    }
    
    // Check if player has daily trials remaining
    if (playerData.dailyTrialsRemaining <= 0) {
      toast.error("Daily limit reached", {
        description: `Maximum ${3} NFT trials per day.`
      });
      return;
    }
    
    // Check if cooldown has passed
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (playerData.lastTrialTime && (Date.now() - playerData.lastTrialTime < cooldownPeriod)) {
      const timeRemaining = playerData.lastTrialTime + cooldownPeriod - Date.now();
      const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      
      toast.error("Cooldown active", {
        description: `Try again in ${hours}h ${minutes}m.`
      });
      return;
    }
    
    // Simulate blockchain transaction
    toast.loading("Processing NFT redemption on MONAD chain...");
    
    setTimeout(() => {
      // Deduct shards and update player data
      setPlayerData(prev => ({
        ...prev,
        shards: prev.shards - 10,
        dailyTrialsRemaining: prev.dailyTrialsRemaining - 1,
        lastTrialTime: Date.now()
      }));

      // Select a random new card
      const newCardIndex = Math.floor(Math.random() * cards.length);
      const newCard = cards[newCardIndex];
      
      // Add the new card to player's deck and collection
      setPlayerDeck(prev => [...prev, newCard]);
      setAllPlayerCards(prev => [...prev, newCard]);
      
      // Update battle log
      setBattleLog(prev => [
        ...prev, 
        `You redeemed 10 shards and received a new ${newCard.rarity} card: ${newCard.name}!`
      ]);
      
      // Show success notification
      toast.success("NFT Redeemed!", { 
        description: `Your new ${newCard.rarity} card "${newCard.name}" has been added to your collection.`
      });
      
      // Show additional notification about cooldown
      setTimeout(() => {
        toast.info("Redemption cooldown active", {
          description: "You can redeem another NFT in 24 hours."
        });
      }, 1500);
    }, 2000);
  };

  const endGame = (playerWon: boolean | null) => {
    setGameStatus('end');
    
    toast.loading("Recording game result on MONAD blockchain...", { 
      id: "game-result",
      duration: 3000,
    });
    
    setTimeout(() => {
      toast.success("Game result recorded on-chain", {
        id: "game-result",
        description: `Block: ${monadGameState.currentBlockHeight! + 2}`,
      });
      
      let resultMessage = "";
      if (playerWon === true) {
        const shardReward = getShardReward();
        
        // Update player data with new shards
        setPlayerData(prev => ({
          ...prev,
          shards: prev.shards + shardReward,
          wins: prev.wins + 1
        }));
        
        resultMessage = `Victory! You've won the battle. ${shardReward} Shards awarded and recorded on-chain.`;
        uiToast({
          title: "Victory!",
          description: `You've won the battle and earned ${shardReward} Shards!`,
        });
      } else if (playerWon === false) {
        setPlayerData(prev => ({
          ...prev,
          losses: prev.losses + 1
        }));
        
        resultMessage = "Defeat! Better luck next time. Battle result recorded on MONAD blockchain.";
        uiToast({
          title: "Defeat!",
          description: "You've lost the battle. Try again with a different strategy.",
          variant: "destructive",
        });
      } else {
        resultMessage = "Draw! Both players exhausted. The game ends in a tie.";
        uiToast({
          title: "Draw!",
          description: "The game ended in a tie. No winner declared.",
        });
      }
      
      setBattleLog(prev => [...prev, resultMessage]);
    }, 3000);
  };

  const resetGame = () => {
    // Set deck based on a subset of all player cards
    setPlayerDeck(allPlayerCards.slice(0, 3));
    
    // Generate opponent cards based on difficulty (handled in handleSelectDifficulty)
    setSelectedCard(null);
    setPlayerMana(10);
    setOpponentMana(10);
    setPlayerHealth(20);
    setOpponentHealth(20);
    setBattleLog([]);
    setPendingMoves([]);
    setCurrentTurn('player');
    setFatigueDamage(1);
    setConsecutiveSkips(0);
    setBoostActive(false);
    setBoostDetails(null);
  };

  const backToRoomSelection = () => {
    setGameStatus('room_select');
    setBattleLog([]);
  };

  const renderGameContent = () => {
    switch (gameStatus) {
      case 'room_select':
        return <GameRoomSelector onSelectDifficulty={handleSelectDifficulty} />;
        
      case 'inventory':
        return <PlayerInventory playerCards={allPlayerCards} onClose={closeInventory} />;
        
      case 'waiting':
        return (
          <Card className="glassmorphism border-emerald-500/30 h-[600px] flex flex-col">
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-16 h-16 mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle on MONAD?</h2>
              <p className="text-gray-300 mb-8 text-center max-w-md">
                Challenge an opponent on the MONAD blockchain. All game moves are recorded as on-chain transactions, giving you true ownership of your battle history and rewards.
              </p>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full max-w-md">
