
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from "@/components/ui/card";
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cards, currentPlayer } from '@/data/gameData';
import { Card as GameCardType } from '@/types/game';

const Game = () => {
  const { toast } = useToast();
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
  
  const startGame = () => {
    setGameStatus('playing');
    setBattleLog([...battleLog, 'Battle has begun! Your turn.']);
    toast({
      title: "Game Started",
      description: "The battle has begun! Play your first card.",
    });
  };
  
  const playCard = (card: GameCardType) => {
    if (gameStatus !== 'playing') return;
    if (playerMana < card.mana) {
      toast({
        title: "Not enough mana",
        description: `You need ${card.mana} mana to play this card.`,
        variant: "destructive",
      });
      return;
    }
    
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
    
    // Opponent's turn
    setTimeout(() => {
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
    }, 1500);
  };
  
  const endGame = (playerWon: boolean) => {
    setGameStatus('end');
    if (playerWon) {
      setBattleLog([...battleLog, "Victory! You've won the battle."]);
      toast({
        title: "Victory!",
        description: "You've won the battle and earned 50 MONDO tokens!",
      });
    } else {
      setBattleLog([...battleLog, "Defeat! Better luck next time."]);
      toast({
        title: "Defeat!",
        description: "You've lost the battle. Try again with a different strategy.",
        variant: "destructive",
      });
    }
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
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4 md:px-0 pb-16">
        <h1 className="text-4xl font-bold text-white mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-purple to-mondo-blue">
            MONDO Chain Battle
          </span>
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="md:col-span-2">
            <Card className="glassmorphism border-mondo-purple/30 h-[600px] flex flex-col">
              {gameStatus === 'waiting' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle?</h2>
                  <p className="text-gray-300 mb-8 text-center max-w-md">
                    Challenge an opponent on the MONDO blockchain. Win to earn tokens and climb the leaderboard!
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-mondo-purple to-mondo-blue text-white"
                    onClick={startGame}
                  >
                    Start Battle
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
                  <div className="flex-1 relative bg-black/30 rounded-lg mb-8 border border-mondo-blue/30 flex items-center justify-center">
                    {selectedCard ? (
                      <div className="animate-float">
                        <GameCard card={selectedCard} className="scale-110" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg text-gray-400 mb-2">Battle Area</div>
                        <div className="text-sm text-gray-500">Select a card to play</div>
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
                      <div className="text-lg font-bold text-white">You</div>
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
          
          {/* Battle Log */}
          <div>
            <Card className="glassmorphism border-mondo-purple/30 h-[600px] flex flex-col">
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
                    className="w-full bg-gradient-to-r from-mondo-purple to-mondo-blue text-white"
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
