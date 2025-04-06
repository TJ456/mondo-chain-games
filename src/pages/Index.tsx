
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { cards, players } from '@/data/gameData';
import GameCard from '@/components/GameCard';

const Index = () => {
  const navigate = useNavigate();
  
  // Select some featured cards for display
  const featuredCards = [cards[5], cards[3], cards[7]];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:px-0 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-mondo-purple/20 text-mondo-purple border border-mondo-purple/30 text-sm font-medium">
                Powered by MONDO Blockchain
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Play, <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-purple to-mondo-blue">Collect</span>, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-blue to-mondo-cyan">Trade</span> on the Blockchain
              </h1>
              <p className="text-lg text-gray-300 max-w-xl">
                MONDO Chain Games brings the power of blockchain to competitive card gaming. 
                Collect unique NFT cards, build powerful decks, and battle players from around the world.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-gradient-to-r from-mondo-purple to-mondo-blue text-white text-lg px-8 py-6"
                  onClick={() => navigate('/game')}
                >
                  Start Playing
                </Button>
                <Button 
                  variant="outline"
                  className="border-mondo-blue text-mondo-blue hover:bg-mondo-blue/20 text-lg px-8 py-6"
                  onClick={() => navigate('/marketplace')}
                >
                  Explore Marketplace
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 flex justify-center">
                {featuredCards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className="transform"
                    style={{
                      transform: `rotate(${(index - 1) * 15}deg)`,
                      zIndex: 3 - Math.abs(index - 1)
                    }}
                  >
                    <GameCard 
                      card={card} 
                      className="shadow-2xl" 
                      showDetails={false}
                      onClick={() => navigate('/marketplace')}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-mondo-purple/30 to-mondo-blue/30 rounded-full blur-3xl opacity-30" />
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 grid-pattern opacity-10" />
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:px-0">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-purple to-mondo-blue">
              Why Play MONDO Chain Games?
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="techno-border p-6 rounded-lg bg-black/30 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-mondo-purple/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mondo-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">True Ownership</h3>
              <p className="text-gray-400">
                All cards are NFTs stored on the MONDO blockchain. You truly own your cards and can trade them anytime.
              </p>
            </div>
            
            <div className="techno-border p-6 rounded-lg bg-black/30 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-mondo-blue/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mondo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Play-to-Earn</h3>
              <p className="text-gray-400">
                Win matches, complete quests, and participate in tournaments to earn MONDO tokens and rare cards.
              </p>
            </div>
            
            <div className="techno-border p-6 rounded-lg bg-black/30 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-mondo-cyan/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mondo-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Transparent</h3>
              <p className="text-gray-400">
                Game mechanics and card rarities are verified on-chain. No hidden algorithms or unfair advantages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-16 px-4 md:px-0 bg-gradient-to-b from-transparent to-black/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">How to Play</h2>
          <p className="text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Getting started with MONDO Chain Games is easy. Follow these steps to begin your blockchain gaming journey.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-mondo-purple/20 text-mondo-purple flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your MONDO-compatible wallet to start playing and managing your assets.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-mondo-blue/20 text-mondo-blue flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-bold text-white mb-2">Collect Cards</h3>
              <p className="text-gray-400 text-sm">
                Build your collection by purchasing card packs or individual cards from the marketplace.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-mondo-cyan/20 text-mondo-cyan flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-bold text-white mb-2">Build Your Deck</h3>
              <p className="text-gray-400 text-sm">
                Create powerful deck combinations using your collected cards to maximize your strategy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-mondo-pink/20 text-mondo-pink flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-bold text-white mb-2">Battle & Earn</h3>
              <p className="text-gray-400 text-sm">
                Challenge other players, climb the ranks, and earn rewards for your victories.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              className="bg-gradient-to-r from-mondo-purple to-mondo-blue text-white"
              onClick={() => navigate('/game')}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-white/10 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold text-white">
                MONDO<span className="text-mondo-blue">Chain</span>Games
              </div>
              <div className="text-sm text-gray-400 mt-1">
                © 2025 MONDO Chain Games. All rights reserved.
              </div>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
