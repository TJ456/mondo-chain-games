
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from "@/components/ui/card";
import GameCard from '@/components/GameCard';
import MonadStatus from '@/components/MonadStatus';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { toast } from "sonner";
import { cards, currentPlayer, monadGameState } from '@/data/gameData';
import { Card as GameCardType, MonadGameMove } from '@/types/game';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Game = () => {
  const { toast: uiToast } = useToast();
  const [playerDeck, setPlayerDeck] = useState<GameCardType[]>(currentPlayer.cards);
  const [opponentCards, setOpponentCards] = useState<GameCardType[]>(
    cards.filter(card => !currentPlayer.cards.includes(card)).slice(0, 3)
  );
  const [selectedCard, setSelectedCard] = useState<GameCardType | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'end'>('waiting');
  const [playerMana, setPlayerMana] = useState(10);
  const [opponentMana, setOpponentMana] = useState(10);
  const [playerHealth, setPlayerHealth] = useState(20);
  const [opponentHealth, setOpponentHealth] = useState(20);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [pendingMoves, setPendingMoves] = useState<MonadGameMove[]>([]);
  const [isOnChain, setIsOnChain] = useState(false);
  
  // Update on-chain status based on Monad network status
  useEffect(() => {
    setIsOnChain(monadGameState.isOnChain && monadGameState.networkStatus === 'connected');
  }, []);
  
  const startGame = () => {
    setGameStatus('playing');
    setBattleLog([...battleLog, 'Battle has begun on the MONAD blockchain! Your turn.']);
    
    uiToast({
      title: "Game Started",
      description: "The battle has begun! Play your first card.",
    });
    
    toast.success("Connected to MONAD blockchain", {
      description: `Current block: ${monadGameState.currentBlockHeight}`,
      duration: 3000,
    });
  };
  
  const playCard = (card: GameCardType) => {
    if (gameStatus !== 'playing') return;
    if (playerMana < card.mana) {
      uiToast({
        title: "Not enough mana",
        description: `You need ${card.mana} mana to play this card.`,
        variant: "destructive",
      });
      return;
    }
    
    // Create on-chain move
    const newMove: MonadGameMove = {
      moveId: `move-${Date.now()}`,
      playerAddress: currentPlayer.monadAddress,
      cardId: card.id,
      moveType: card.type === 'ATTACK' ? 'attack' : (card.type === 'DEFENSE' ? 'defend' : 'special'),
      timestamp: Date.now(),
      verified: false
    };
    
    // Add to pending moves
    setPendingMoves(prev => [...prev, newMove]);
    
    // Show on-chain transaction toast
    toast.loading("Submitting move to MONAD blockchain...", {
      id: newMove.moveId,
      duration: 2000,
    });
    
    setSelectedCard(card);
    setPlayerMana(prev => prev - card.mana);
    
    // Apply card effects
    let logEntry = `You played ${card.name}.`;
    
    if (card.attack) {
      const damage = card.attack;
      setOpponentHealth(prev => Math.max(0, prev - damage));
      logEntry += ` Dealt ${damage} damage to opponent.`;
    }
    
    if (card.defense) {
      setPlayerHealth(prev => Math.min(30, prev + card.defense));
      logEntry += ` Gained ${card.defense} health.`;
    }
    
    // Remove card from deck
    setPlayerDeck(prev => prev.filter(c => c.id !== card.id));
    
    setBattleLog([...battleLog, logEntry]);
    
    // Simulate blockchain confirmation
    setTimeout(() => {
      // Update move status to verified
      setPendingMoves(prev => 
        prev.map(move => 
          move.moveId === newMove.moveId 
            ? { ...move, verified: true, onChainSignature: `0x${Math.random().toString(16).slice(2, 10)}` } 
            : move
        )
      );
      
      toast.success("Move confirmed on-chain", {
        id: newMove.moveId,
        description: `Block: ${monadGameState.currentBlockHeight! + 1}`,
      });
      
      // Opponent's turn
      if (opponentHealth <= 0) {
        endGame(true);
        return;
      }
      
      // Simple AI - play a random card if possible
      const playableCards = opponentCards.filter(c => c.mana <= opponentMana);
      
      if (playableCards.length > 0) {
        const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        setOpponentMana(prev => prev - randomCard.mana);
        
        let oppLogEntry = `Opponent played ${randomCard.name}.`;
        
        if (randomCard.attack) {
          const damage = randomCard.attack;
          setPlayerHealth(prev => Math.max(0, prev - damage));
          oppLogEntry += ` Dealt ${damage} damage to you.`;
        }
        
        if (randomCard.defense) {
          setOpponentHealth(prev => Math.min(30, prev + randomCard.defense));
          oppLogEntry += ` Opponent gained ${randomCard.defense} health.`;
        }
        
        setOpponentCards(prev => prev.filter(c => c.id !== randomCard.id));
        setBattleLog([...battleLog, logEntry, oppLogEntry]);
        
        if (playerHealth <= 0) {
          endGame(false);
        }
      } else {
        setBattleLog([...battleLog, logEntry, "Opponent has no playable cards. Your turn."]);
      }
      
      setSelectedCard(null);
    }, 2000);
  };
  
  const endGame = (playerWon: boolean) => {
    setGameStatus('end');
    
    // Finalize game result on blockchain
    toast.loading("Recording game result on MONAD blockchain...", { 
      id: "game-result",
      duration: 3000,
    });
    
    setTimeout(() => {
      toast.success("Game result recorded on-chain", {
        id: "game-result",
        description: `Block: ${monadGameState.currentBlockHeight! + 2}`,
      });
      
      if (playerWon) {
        setBattleLog([...battleLog, "Victory! You've won the battle. 50 MONAD tokens awarded and recorded on-chain."]);
        uiToast({
          title: "Victory!",
          description: "You've won the battle and earned 50 MONAD tokens!",
        });
      } else {
        setBattleLog([...battleLog, "Defeat! Better luck next time. Battle result recorded on MONAD blockchain."]);
        uiToast({
          title: "Defeat!",
          description: "You've lost the battle. Try again with a different strategy.",
          variant: "destructive",
        });
      }
    }, 3000);
  };
  
  const resetGame = () => {
    setPlayerDeck(currentPlayer.cards);
    setOpponentCards(cards.filter(card => !currentPlayer.cards.includes(card)).slice(0, 3));
    setSelectedCard(null);
    setGameStatus('waiting');
    setPlayerMana(10);
    setOpponentMana(10);
    setPlayerHealth(20);
    setOpponentHealth(20);
    setBattleLog([]);
    setPendingMoves([]);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4 md:px-0 pb-16">
        <h1 className="text-4xl font-bold text-white mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            MONAD Chain Battle
          </span>
          {isOnChain && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              On-Chain
            </span>
          )}
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="md:col-span-2">
            <Card className="glassmorphism border-emerald-500/30 h-[600px] flex flex-col">
              {gameStatus === 'waiting' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle on MONAD?</h2>
                  <p className="text-gray-300 mb-8 text-center max-w-md">
                    Challenge an opponent on the MONAD blockchain. All game moves are recorded as on-chain transactions, giving you true ownership of your battle history and rewards.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                    onClick={startGame}
                  >
                    <span className="mr-2">Start On-Chain Battle</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col h-full p-6">
                  {/* Opponent Info */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-lg font-bold text-white">Opponent</div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <div className="text-red-400 font-bold">{opponentHealth} / 20</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Mana</div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <div className="text-blue-400 font-bold">{opponentMana} / 10</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Opponent Cards */}
                  <div className="flex justify-center space-x-4 mb-8">
                    {opponentCards.map(card => (
                      <div key={card.id} className="transform hover:-translate-y-2 transition-transform">
                        <Card className="w-20 h-28 bg-gray-800 border-gray-700">
                          <div className="h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                  
                  {/* Battle Area */}
                  <div className="flex-1 relative bg-black/30 rounded-lg mb-8 border border-emerald-500/30 flex items-center justify-center">
                    {selectedCard ? (
                      <div className="animate-float">
                        <GameCard card={selectedCard} className="scale-110" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg text-gray-400 mb-2">MONAD Blockchain Battle Arena</div>
                        <div className="text-sm text-gray-500">Select a card to play - moves are recorded on-chain</div>
                      </div>
                    )}
                    
                    {/* Pending Transaction Indicator */}
                    {pendingMoves.length > 0 && pendingMoves.some(move => !move.verified) && (
                      <div className="absolute top-4 right-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-emerald-900/50 px-3 py-1 rounded-full flex items-center">
                                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-xs text-emerald-400">Pending</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/80 border-emerald-500/50">
                              <p className="text-xs text-emerald-400">Transaction being processed on MONAD blockchain</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                  
                  {/* Player Cards */}
                  <div className="flex justify-center space-x-4 mb-4">
                    {playerDeck.map(card => (
                      <div key={card.id} className="transform hover:-translate-y-2 transition-transform">
                        <div onClick={() => gameStatus === 'playing' && playCard(card)}>
                          <GameCard card={card} className="w-20 h-28" showDetails={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-white flex items-center">
                        You
                        <span className="ml-2 text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                          {currentPlayer.monadAddress.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <div className="text-red-400 font-bold">{playerHealth} / 20</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Mana</div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <div className="text-blue-400 font-bold">{playerMana} / 10</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* Battle Log & Blockchain Status */}
          <div className="space-y-8">
            {/* Monad Network Status */}
            <MonadStatus />
            
            {/* Battle Log */}
            <Card className="glassmorphism border-emerald-500/30 h-[320px] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Battle Log</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {battleLog.length > 0 ? (
                  <div className="space-y-2">
                    {battleLog.map((log, index) => (
                      <div 
                        key={index} 
                        className="text-sm text-gray-300 p-2 rounded bg-black/20 border border-white/5"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Battle events will appear here
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/10">
                {gameStatus === 'end' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                    onClick={resetGame}
                  >
                    Play Again
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
