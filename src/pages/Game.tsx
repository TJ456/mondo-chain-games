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
import { Package } from 'lucide-react';

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
      let cardToPlay: GameCardType;
      
      switch (aiDifficulty) {
        case AIDifficultyTier.NOVICE:
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          break;
          
        case AIDifficultyTier.VETERAN:
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
        if (cardToPlay.specialEffect.type === 'damage') {
          const extraDamage = Math.floor(cardToPlay.specialEffect.value * 0.2);
          newPlayerHealth = Math.max(0, newPlayerHealth - extraDamage);
          logEntry += ` +${extraDamage} bonus damage!`;
        } else if (cardToPlay.specialEffect.type === 'heal') {
          const extraHeal = Math.floor(cardToPlay.specialEffect.value * 0.2);
          newOpponentHealth = Math.min(30, newOpponentHealth + extraHeal);
          logEntry += ` +${extraHeal} bonus healing!`;
        }
      }

      setPlayerHealth(newPlayerHealth);
      setOpponentHealth(newOpponentHealth);
      setBattleLog(prev => [...prev, logEntry]);

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

  const renderGameContent = () => {
    switch (gameStatus) {
      case 'room_select':
        return <GameRoomSelector onSelectDifficulty={handleSelectDifficulty} />;
        
      case 'inventory':
        return <PlayerInventory playerCards={allPlayerCards} onClose={closeInventory} />;
        
      case 'waiting':
        return (
          <UICard className="glassmorphism border-emerald-500/30 h-[600px] flex flex-col">
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
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600" 
                  onClick={startGame}
                >
                  Start Battle
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  onClick={openInventory}
                >
                  View Inventory
                </Button>
              </div>
              
              <div className="mt-8 p-3 rounded-md bg-emerald-900/20 border border-emerald-500/30">
                <h3 className="text-sm font-semibold text-emerald-300 mb-2">Game Setup:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-300">Difficulty:</div>
                  <div className="text-emerald-400 font-semibold capitalize">{aiDifficulty}</div>
                  <div className="text-gray-300">Your Deck:</div>
                  <div className="text-emerald-400 font-semibold">{playerDeck.length} Cards Ready</div>
                  <div className="text-gray-300">Opponent:</div>
                  <div className="text-emerald-400 font-semibold">{opponentCards.length} Cards Ready</div>
                  <div className="text-gray-300">Shard Reward:</div>
                  <div className="text-emerald-400 font-semibold">{getShardReward()} Shards</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="ghost" 
                  className="text-xs text-gray-400 hover:text-white"
                  onClick={backToRoomSelection}
                >
                  Return to Room Selection
                </Button>
              </div>
            </div>
          </UICard>
        );
      
      case 'playing':
        return (
          <UICard className="glassmorphism border-emerald-500/30">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">MONAD Battle</h2>
                  <p className="text-gray-400 text-sm">Difficulty: <span className="text-emerald-400 capitalize">{aiDifficulty}</span></p>
                </div>
                <ShardManager 
                  player={playerData}
                  onRedeemShards={handleShardRedemption}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <UICard className="bg-black/30 border-emerald-500/20">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-emerald-400 text-sm mb-1">Your Health</div>
                          <div className="h-4 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{ width: `${(playerHealth / 20) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-white">{playerHealth}</span>
                            <span className="text-xs text-gray-500">20</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-red-400 text-sm mb-1 text-right">Opponent Health</div>
                          <div className="h-4 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                              style={{ width: `${(opponentHealth / 20) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-white">{opponentHealth}</span>
                            <span className="text-xs text-gray-500">20</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-blue-400 text-sm mb-1">Your Mana</div>
                          <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${(playerMana / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-white mt-1">{playerMana}/10</div>
                        </div>
                        <div>
                          <div className="text-purple-400 text-sm mb-1 text-right">Opponent Mana</div>
                          <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                              style={{ width: `${(opponentMana / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-white mt-1 text-right">{opponentMana}/10</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-white text-sm mb-2">Battle Log</h3>
                        <div className="bg-black/40 rounded-md p-2 h-40 overflow-y-auto border border-white/10">
                          {battleLog.map((log, index) => (
                            <p key={index} className="text-xs text-gray-300 mb-1">{log}</p>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white text-sm mb-2">Your Cards</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {playerDeck.map(card => (
                            <div key={card.id} onClick={() => playCard(card)} className={`cursor-pointer transform hover:-translate-y-1 transition-transform ${currentTurn !== 'player' || playerMana < card.mana ? 'opacity-50' : ''}`}>
                              <GameCard card={card} showDetails={false} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </UICard>
                </div>
                
                <div>
                  <MonadBoostMechanic 
                    playerBalance={playerMonadBalance}
                    onActivateBoost={handleBoostActivation}
                    boostActive={boostActive}
                    boostDetails={boostDetails}
                  />
                  
                  <UICard className="bg-black/30 border-emerald-500/20 mt-4">
                    <div className="p-4">
                      <h3 className="text-white text-sm mb-2">Game Stats</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Turn:</span>
                          <span className="text-xs text-emerald-400 capitalize">{currentTurn}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Cards Left:</span>
                          <span className="text-xs text-white">You: {playerDeck.length} | Opponent: {opponentCards.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Fatigue:</span>
                          <span className="text-xs text-amber-400">{fatigueDamage} Damage</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Shards:</span>
                          <span className="text-xs text-emerald-400">{playerData.shards}</span>
                        </div>
                      </div>
                    </div>
                  </UICard>
                </div>
              </div>
            </div>
          </UICard>
        );
        
      case 'end':
        return (
          <UICard className="glassmorphism border-emerald-500/30 h-[600px] flex flex-col">
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-16 h-16 mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Battle Complete</h2>
              <div className="bg-black/30 rounded-md p-4 mb-6 w-full max-w-md">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-400 mb-1">Final Result</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {playerHealth <= 0 ? 'Defeat' : opponentHealth <= 0 ? 'Victory!' : 'Draw'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your Health</div>
                    <div className="text-lg font-bold">{playerHealth}/20</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Opponent Health</div>
                    <div className="text-lg font-bold">{opponentHealth}/20</div>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-400 mb-1">Total Shards</div>
                  <div className="text-3xl font-bold text-amber-400">{playerData.shards}</div>
                </div>
                <div className="bg-black/30 rounded p-3">
                  <div className="text-sm text-gray-400 mb-1">Battle Log</div>
                  <div className="max-h-32 overflow-y-auto text-xs text-gray-300">
                    {battleLog.map((log, index) => (
                      <p key={index} className="mb-1">{log}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 w-full max-w-md">
                <Button onClick={backToRoomSelection} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500">
                  New Battle
                </Button>
                <Button onClick={openInventory} className="w-full bg-gradient-to-r from-amber-500 to-amber-600">
                  View Inventory
                </Button>
              </div>
            </div>
          </UICard>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {renderGameContent()}
    </div>
  );
};

export default Game;
