import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card as UICard } from "@/components/ui/card";
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
import { Package, Shield, Sword, Zap, Sparkles, Clock } from 'lucide-react';

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
    shards: 0,
    dailyTrialsRemaining: 3,
    lastTrialTime: 0
  });
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficultyTier>(AIDifficultyTier.NOVICE);
  const [playerMonadBalance, setPlayerMonadBalance] = useState(1000);
  const [boostActive, setBoostActive] = useState(false);
  const [boostDetails, setBoostDetails] = useState<{effect: number, remainingTurns: number} | null>(null);
  const [allPlayerCards, setAllPlayerCards] = useState<GameCardType[]>(currentPlayer.cards);

  useEffect(() => {
    const savedShards = localStorage.getItem(STORAGE_KEY_SHARDS);
    const parsedShards = savedShards ? parseInt(savedShards, 10) : 0;
    
    const savedLastRedemption = localStorage.getItem(STORAGE_KEY_LAST_REDEMPTION);
    const parsedLastRedemption = savedLastRedemption ? parseInt(savedLastRedemption, 10) : 0;
    
    const savedDailyTrials = localStorage.getItem(STORAGE_KEY_DAILY_TRIALS);
    const parsedDailyTrials = savedDailyTrials ? parseInt(savedDailyTrials, 10) : 3;
    
    const savedPlayerCards = localStorage.getItem(STORAGE_KEY_PLAYER_CARDS);
    const parsedPlayerCards = savedPlayerCards ? JSON.parse(savedPlayerCards) : currentPlayer.cards;
    
    const isNewDay = new Date(parsedLastRedemption).getDate() !== new Date().getDate() || 
                     new Date(parsedLastRedemption).getMonth() !== new Date().getMonth() ||
                     new Date(parsedLastRedemption).getFullYear() !== new Date().getFullYear();
    
    const dailyTrialsToSet = isNewDay ? 3 : parsedDailyTrials;
    
    setPlayerData(prev => ({
      ...prev,
      shards: parsedShards,
      lastTrialTime: parsedLastRedemption,
      dailyTrialsRemaining: dailyTrialsToSet
    }));
    
    setAllPlayerCards(parsedPlayerCards);
    
    setIsOnChain(monadGameState.isOnChain && monadGameState.networkStatus === 'connected');
  }, []);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHARDS, playerData.shards.toString());
    if (playerData.lastTrialTime) {
      localStorage.setItem(STORAGE_KEY_LAST_REDEMPTION, playerData.lastTrialTime.toString());
    }
    localStorage.setItem(STORAGE_KEY_DAILY_TRIALS, playerData.dailyTrialsRemaining.toString());
  }, [playerData.shards, playerData.lastTrialTime, playerData.dailyTrialsRemaining]);
  
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
    
    let opponentCardPool: GameCardType[];
    
    switch (difficulty) {
      case AIDifficultyTier.NOVICE:
        opponentCardPool = cards
          .filter(card => card.rarity !== 'epic' && card.rarity !== 'legendary')
          .map(card => ({
            ...card,
            attack: card.attack ? Math.max(1, Math.floor(card.attack * 0.8)) : undefined,
            defense: card.defense ? Math.max(1, Math.floor(card.defense * 0.8)) : undefined
          }));
        break;
        
      case AIDifficultyTier.VETERAN:
        opponentCardPool = cards.filter(card => card.rarity !== 'legendary');
        break;
        
      case AIDifficultyTier.LEGEND:
        opponentCardPool = cards.map(card => ({
          ...card,
          attack: card.attack ? Math.floor(card.attack * 1.2) : undefined,
          defense: card.defense ? Math.floor(card.defense * 1.2) : undefined
        }));
        break;
        
      default:
        opponentCardPool = cards;
    }
    
    const randomCards: GameCardType[] = [];
    while (randomCards.length < 3 && opponentCardPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponentCardPool.length);
      randomCards.push(opponentCardPool[randomIndex]);
      opponentCardPool.splice(randomIndex, 1);
    }
    
    setOpponentCards(randomCards);
    setGameStatus('waiting');
    
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
    const selectedCards = allPlayerCards.slice(0, 3);
    setPlayerDeck(selectedCards);
    setGameStatus('waiting');
  };

  const startGame = () => {
    resetGame();
    setGameStatus('playing');
    setCurrentTurn('player');
    setBattleLog(['Battle has begun on the MONAD blockchain! Your turn.']);
    
    let difficultyMessage = "";
    switch (aiDifficulty) {
      case AIDifficultyTier.NOVICE:
        difficultyMessage = "Novice training battle begins. Perfect your strategy!";
        break;
      case AIDifficultyTier.VETERAN:
        difficultyMessage = "Veteran AI activated. This opponent has advanced tactics!";
        break;
      case AIDifficultyTier.LEGEND:
        difficultyMessage = "LEGENDARY AI ENGAGED! Prepare for the ultimate challenge!";
        break;
    }
    
    setBattleLog(prev => [...prev, difficultyMessage]);
    
    uiToast({
      title: "Game Started",
      description: "The battle has begun! Play your first card.",
    });
    
    toast.success("Connected to MONAD blockchain", {
      description: `Current block: ${monadGameState.currentBlockHeight}`,
      duration: 3000,
    });
    
    console.log("Game started. Initial state:", {
      playerDeck,
      opponentCards,
      playerMana,
      opponentMana,
      currentTurn
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
    console.log(`Ending turn. Current: ${currentTurn}, Next: ${nextPlayer}`);
    
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
      setBattleLog(prev => [...prev, "Your turn begins!"]);
    } else {
      setOpponentMana(prev => Math.min(10, prev + 1));
      setBattleLog(prev => [...prev, "Opponent's turn begins..."]);
    }

    setSelectedCard(null);
    
    if (nextPlayer === 'opponent') {
      console.log("Opponent's turn, triggering handleOpponentTurn in 1 second");
      toast.info("Opponent is thinking...", {
        position: "bottom-center",
        duration: 1500,
      });
      setTimeout(() => {
        handleOpponentTurn();
      }, 1500);
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

    if (consecutiveSkips >= 3) {
      endGame(null);
      return;
    }

    endTurn(target === 'player' ? 'opponent' : 'player');
  };

  const handleOpponentTurn = useCallback(() => {
    console.log("handleOpponentTurn triggered. Current game status:", gameStatus, "Current turn:", currentTurn);
    
    if (gameStatus !== 'playing') {
      console.log("Game is not in playing state, skipping opponent turn");
      return;
    }
    
    if (currentTurn !== 'opponent') {
      console.log("Not opponent's turn, skipping opponent turn logic");
      return;
    }

    console.log("AI Turn started. AI difficulty:", aiDifficulty);
    console.log("AI has mana:", opponentMana);
    console.log("AI cards:", opponentCards);

    const playableCards = getPlayableCards(opponentCards, opponentMana);
    console.log("AI playable cards:", playableCards);

    if (playableCards.length > 0) {
      let cardToPlay: GameCardType;
      let aiThinkingDelay = 1500; // Increased default thinking time for better UX
      
      switch (aiDifficulty) {
        case AIDifficultyTier.NOVICE:
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          aiThinkingDelay = 1800;
          
          setBattleLog(prev => [...prev, "The novice opponent considers their move..."]);
          break;
          
        case AIDifficultyTier.VETERAN:
          aiThinkingDelay = 2200; // Veteran takes more time to "think"
          
          setBattleLog(prev => [...prev, "The veteran opponent calculates their strategy..."]);
          
          if (opponentHealth < 8) {
            const defenseCards = playableCards.filter(c => c.defense && c.defense > 0);
            cardToPlay = defenseCards.length > 0 
              ? defenseCards.reduce((best, current) => (current.defense! > best.defense!) ? current : best, defenseCards[0]) 
              : playableCards[Math.floor(Math.random() * playableCards.length)];
          } else if (playerHealth < 10) {
            const attackCards = playableCards.filter(c => c.attack && c.attack > 0);
            cardToPlay = attackCards.length > 0 
              ? attackCards.reduce((best, current) => (current.attack! > best.attack!) ? current : best, attackCards[0]) 
              : playableCards[Math.floor(Math.random() * playableCards.length)];
          } else {
            cardToPlay = playableCards.reduce((best, current) => {
              const currentValue = (current.attack || 0) + (current.defense || 0);
              const bestValue = (best.attack || 0) + (best.defense || 0);
              return currentValue > bestValue ? current : best;
            }, playableCards[0]);
          }
          break;
          
        case AIDifficultyTier.LEGEND:
          aiThinkingDelay = 2500; // Legend takes even more time to "think"
          
          setBattleLog(prev => [...prev, "The legendary opponent unleashes advanced battle algorithms..."]);
          
          const scoredCards = playableCards.map(card => {
            let score = 0;
            
            score += (card.attack || 0) * 1.2;
            score += (card.defense || 0);
            
            if (playerHealth <= card.attack!) {
              score += 100;
            } else if (opponentHealth < 8) {
              score += (card.defense || 0) * 2;
            } else if (playerMana > 8) {
              score += (card.attack || 0) * 0.5;
            }
            
            score = score / card.mana;
            
            return { card, score };
          });
          
          cardToPlay = scoredCards.reduce((best, current) => 
            current.score > best.score ? current : best, scoredCards[0]
          ).card;
          break;
          
        default:
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
      }

      // Show "thinking" animation
      toast.loading("Opponent is planning their move...", {
        id: "ai-thinking",
        duration: aiThinkingDelay,
      });

      setTimeout(() => {
        console.log("AI playing card:", cardToPlay);
        
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
          if (cardToPlay.specialEffect.type === 'damage' && cardToPlay.specialEffect.value) {
            let extraDamage = 0;
            
            switch (aiDifficulty) {
              case AIDifficultyTier.NOVICE:
                extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.1);
                break;
              case AIDifficultyTier.VETERAN:
                extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.2);
                break;
              case AIDifficultyTier.LEGEND:
                extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.5);
                break;
            }
            
            if (extraDamage > 0) {
              newPlayerHealth = Math.max(0, newPlayerHealth - extraDamage);
              logEntry += ` +${extraDamage} bonus damage!`;
            }
          } else if (cardToPlay.specialEffect.type === 'heal' && cardToPlay.specialEffect.value) {
            let extraHeal = 0;
            
            switch (aiDifficulty) {
              case AIDifficultyTier.NOVICE:
                extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.1);
                break;
              case AIDifficultyTier.VETERAN:
                extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.2);
                break;
              case AIDifficultyTier.LEGEND:
                extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.5);
                break;
            }
            
            if (extraHeal > 0) {
              newOpponentHealth = Math.min(30, newOpponentHealth + extraHeal);
              logEntry += ` +${extraHeal} bonus healing!`;
            }
          }
        }

        setPlayerHealth(newPlayerHealth);
        setOpponentHealth(newOpponentHealth);
        setBattleLog(prev => [...prev, logEntry]);

        toast.dismiss("ai-thinking");
        toast.success(`Opponent played ${cardToPlay.name}`, {
          position: "bottom-center",
          duration: 2000,
        });

        setConsecutiveSkips(0);
        
        if (newPlayerHealth <= 0) {
          endGame(false);
          return;
        }

        // Clear AI delay
        setTimeout(() => {
          console.log("AI turn complete, switching to player turn");
          endTurn('player');
        }, 1000);

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
      }, aiThinkingDelay);

    } else if (opponentCards.length === 0) {
      handleFatigue('opponent');
    } else {
      setBattleLog(prev => [...prev, "Opponent passes (no playable cards)"]);
      setTimeout(() => {
        endTurn('player');
      }, 1000);
    }
  }, [gameStatus, opponentCards, opponentMana, playerDeck, playerMana, opponentHealth, playerHealth, aiDifficulty, handleFatigue, getPlayableCards, currentTurn]);

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
      if (card.specialEffect.type === 'damage' && card.specialEffect.value) {
        opponentNewHealth = Math.max(0, opponentNewHealth - card.specialEffect.value);
        logEntry += ` (${card.specialEffect.value} extra damage)`;
      } else if (card.specialEffect.type === 'heal' && card.specialEffect.value) {
        playerNewHealth = Math.min(30, playerNewHealth + card.specialEffect.value);
        logEntry += ` (${card.specialEffect.value} extra healing)`;
      }
    }

    setOpponentHealth(opponentNewHealth);
    setPlayerHealth(playerNewHealth);
    setBattleLog(prev => [...prev, logEntry]);
    setPendingMoves(prev => [...prev, newMove]);
    
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

      console.log("Player's move complete, ending turn and handing to opponent");
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

  const handleShardRedemption = () => {
    if (playerData.shards < 10) {
      toast.error("Not enough shards", {
        description: `You need 10 shards to redeem an NFT card.`
      });
      return;
    }
    
    if (playerData.dailyTrialsRemaining <= 0) {
      toast.error("Daily limit reached", {
        description: `Maximum ${3} NFT trials per day.`
      });
      return;
    }
    
    const cooldownPeriod = 24 * 60 * 60 * 1000;
    if (playerData.lastTrialTime && (Date.now() - playerData.lastTrialTime < cooldownPeriod)) {
      const timeRemaining = playerData.lastTrialTime + cooldownPeriod - Date.now();
      const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      
      toast.error("Cooldown active", {
        description: `Try again in ${hours}h ${minutes}m.`
      });
      return;
    }
    
    toast.loading("Processing NFT redemption on MONAD chain...");
    
    setTimeout(() => {
      setPlayerData(prev => ({
        ...prev,
        shards: prev.shards - 10,
        dailyTrialsRemaining: prev.dailyTrialsRemaining - 1,
        lastTrialTime: Date.now()
      }));

      const newCardIndex = Math.floor(Math.random() * cards.length);
      const newCard = cards[newCardIndex];
      
      setPlayerDeck(prev => [...prev, newCard]);
      setAllPlayerCards(prev => [...prev, newCard]);
      
      setBattleLog(prev => [
        ...prev, 
        `You redeemed 10 shards and received a new ${newCard.rarity} card: ${newCard.name}!`
      ]);
      
      toast.success("NFT Redeemed!", { 
        description: `Your new ${newCard.rarity} card "${newCard.name}" has been added to your collection.`
      });
      
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
        
        setPlayerData(prev => {
          const updatedData = {
            ...prev,
            shards: prev.shards + shardReward,
            wins: prev.wins + 1
          };
          
          localStorage.setItem(STORAGE_KEY_SHARDS, updatedData.shards.toString());
          
          return updatedData;
        });
        
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
    setPlayerDeck(allPlayerCards.slice(0, 3));
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

  const renderManaExplanation = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center cursor-help">
            <Zap className="h-4 w-4 mr-1 text-amber-400" />
            <span>Mana</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Mana is the energy required to play cards. It replenishes +1 each turn.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      
      <div className="flex flex-col gap-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">MONAD Game Arena</h1>
            <p className="text-muted-foreground">Battle with blockchain-powered cards</p>
          </div>
          
          <MonadStatus 
            playerMonadBalance={playerMonadBalance}
            isOnChain={isOnChain}
          />
        </div>
        
        {gameStatus === 'room_select' && (
          <GameRoomSelector 
            onSelectDifficulty={handleSelectDifficulty}
            onOpenInventory={openInventory}
          />
        )}
        
        {gameStatus === 'inventory' && (
          <PlayerInventory
            playerCards={allPlayerCards}
            onClose={closeInventory}
            onSelectDeck={selectDeckCards}
          />
        )}
        
        {gameStatus === 'waiting' && (
          <div className="bg-card border rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-6">Ready to Battle?</h2>
            <p className="text-center text-muted-foreground mb-6">
              Your deck is ready. Challenge the AI in a battle of strategy and skill on the MONAD blockchain.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={backToRoomSelection}>
                Back
              </Button>
              <Button onClick={startGame}>
                Start Battle
              </Button>
            </div>
          </div>
        )}
        
        {gameStatus === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg shadow p-4 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span>Opponent</span>
                {currentTurn === 'opponent' && (
                  <span className="ml-2 inline-flex items-center bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded animate-pulse">
                    <Clock size={12} className="mr-1" /> Playing
                  </span>
                )}
              </h2>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{opponentHealth}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderManaExplanation()}
                  <span className="text-amber-400 font-medium">{opponentMana}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Cards: {opponentCards.length}</h3>
                {opponentCards.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {opponentCards.map((card, index) => (
                      <div 
                        key={`opponent-card-${index}`} 
                        className={`bg-blue-900/50 rounded-md h-16 flex items-center justify-center border border-blue-800 transition-all ${
                          currentTurn === 'opponent' ? 'shadow-lg shadow-blue-900/20 animate-pulse' : ''
                        }`}
                      >
                        <span className="text-2xl opacity-70">?</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No cards</p>
                )}
              </div>
            </div>
            
            <div className="bg-card border rounded-lg shadow p-4">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Battle Arena</h2>
                <div className={`text-sm px-3 py-1 rounded-full ${
                  currentTurn === 'player' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {currentTurn === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                </div>
              </div>
              
              <div className="bg-muted/20 rounded-md p-3 h-48 overflow-y-auto mb-4 border border-muted/30">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Sparkles size={14} className="mr-1 text-amber-400" />
                  Battle Log
                </h3>
                <div className="space-y-1">
                  {battleLog.map((log, index) => (
                    <p key={index} className={`text-xs ${
                      index === battleLog.length - 1 ? 'text-white' : 'text-white/70'
                    }`}>{log}</p>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  disabled={currentTurn !== 'player'} 
                  onClick={() => currentTurn === 'player' && endTurn('opponent')}
                  className={`transition-all ${
                    currentTurn === 'player' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' 
                      : ''
                  }`}
                >
                  End Turn
                </Button>
              </div>
              
              <div className="mt-4">
                <MonadBoostMechanic 
                  playerMonadBalance={playerMonadBalance}
                  onBoostActivate={handleBoostActivation}
                  remainingTurns={boostDetails?.remainingTurns}
                  boostPercentage={boostDetails?.effect}
                  isActive={boostActive}
                />
              </div>
            </div>
            
            <div className="bg-card border rounded-lg shadow p-4 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span>Your Cards</span>
                {currentTurn === 'player' && (
                  <span className="ml-2 inline-flex items-center bg-emerald-500/20 text-emerald-500 text-xs px-2 py-1 rounded animate-pulse">
                    <Clock size={12} className="mr-1" /> Your Turn
                  </span>
                )}
              </h2>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{playerHealth}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderManaExplanation()}
                  <span className="text-amber-400 font-medium">{playerMana}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Your Hand:</h3>
                {playerDeck.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {playerDeck.map(card => (
                      <div key={card.id} className={`transition-all duration-300 ${
                        currentTurn === 'player' && card.mana <= playerMana 
                          ? 'hover:-translate-y-2 hover:shadow-lg' 
                          : 'opacity-90'
                      }`}>
                        <GameCard
                          key={card.id}
                          card={card}
                          onClick={() => currentTurn === 'player' && playCard(card)}
                          boosted={card.boosted}
                          showDetails={true}
                        />
                        {currentTurn === 'player' && card.mana <= playerMana && (
                          <div className="text-center text-xs text-emerald-500 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                            Click to play
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No cards in hand</p>
                )}
              </div>
              
              <div className="mt-6">
                <ShardManager
                  player={playerData}
                  onRedeemShards={handleShardRedemption}
                />
              </div>
            </div>
          </div>
        )}
        
        {gameStatus === 'end' && (
          <div className="bg-card border rounded-lg shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">
              {playerHealth > 0 ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              {playerHealth > 0 
                ? `You've won the battle and earned ${getShardReward()} shards!` 
                : 'Better luck next time.'}
            </p>
            <div className="bg-muted/20 rounded-md p-4 mb-6 w-full max-w-md">
              <h3 className="font-semibold mb-2">Battle Results</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your Health:</span>
                  <span>{playerHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opponent Health:</span>
                  <span>{opponentHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span>{aiDifficulty}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={backToRoomSelection}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
