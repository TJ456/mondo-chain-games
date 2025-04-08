
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import GameCard from './GameCard';
import { Card as GameCardType, CardRarity } from '@/types/game';

// Sample cards for the demo
const sampleCard1: GameCardType = {
  id: "burn-1",
  name: "Flame Wisp",
  description: "A small elemental entity",
  image: "/flame-wisp.png",
  rarity: CardRarity.COMMON,
  type: "attack" as any,
  mana: 2,
  attack: 2,
  monadId: "0xBURN001"
};

const sampleCard2: GameCardType = {
  id: "burn-2",
  name: "Ember Sprite",
  description: "A mischievous fire sprite",
  image: "/ember-sprite.png",
  rarity: CardRarity.COMMON,
  type: "attack" as any,
  mana: 2,
  attack: 3,
  monadId: "0xBURN002"
};

// The evolved card
const evolvedCard: GameCardType = {
  id: "evolved-1",
  name: "Phoenix Guardian",
  description: "Born from the ashes of sacrifice",
  image: "/phoenix-guardian.png",
  rarity: CardRarity.RARE,
  type: "attack" as any,
  mana: 3,
  attack: 6,
  monadId: "0xEVOLVE001",
  onChainMetadata: {
    creator: "0xBurnToEvolve",
    creationBlock: 1420999,
    evolutionStage: 2,
    battleHistory: []
  }
};

const BurnToEvolve: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBurn = () => {
    setIsProcessing(true);
    
    toast.loading("Burning cards on Monad blockchain...", {
      id: "burn-evolve"
    });
    
    setTimeout(() => {
      toast.success("Cards burned successfully!", {
        id: "burn-evolve",
        description: "Creating new evolved card..."
      });
      
      setTimeout(() => {
        setStep(2);
        setIsProcessing(false);
      }, 1000);
    }, 2000);
  };
  
  const handleClaim = () => {
    setIsProcessing(true);
    
    toast.loading("Minting new card on Monad blockchain...", {
      id: "claim-evolve"
    });
    
    setTimeout(() => {
      toast.success("New card claimed!", {
        id: "claim-evolve",
        description: "Phoenix Guardian added to your collection"
      });
      
      setStep(3);
      setIsProcessing(false);
    }, 2000);
  };
  
  return (
    <Card className="glassmorphism border-orange-500/30 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-orange-500/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Burn-to-Evolve</h3>
          <p className="text-gray-400">Sacrifice cards to create more powerful ones</p>
        </div>
        <Badge className="ml-auto bg-orange-600 text-white">Deflationary</Badge>
      </div>
      
      {step === 1 && (
        <>
          <div className="text-center mb-6">
            <h4 className="text-white font-medium">Select Cards to Burn</h4>
            <p className="text-sm text-gray-400">Sacrifice two cards to mint a more powerful one</p>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div>
              <GameCard card={sampleCard1} showDetails={false} />
              <div className="mt-2 text-center">
                <span className="text-sm text-gray-400">Common</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-orange-400 text-2xl">+</span>
            </div>
            
            <div>
              <GameCard card={sampleCard2} showDetails={false} />
              <div className="mt-2 text-center">
                <span className="text-sm text-gray-400">Common</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Success Rate</span>
              <span className="text-orange-400 font-bold">100%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">New Card Rarity</span>
              <span className="text-blue-400 font-bold">Rare</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Burn Transaction Fee</span>
              <span className="text-orange-400 font-bold">0.001 MONAD</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            onClick={handleBurn}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Burn Cards"}
          </Button>
        </>
      )}
      
      {step === 2 && (
        <>
          <div className="text-center mb-6">
            <h4 className="text-white font-medium">Evolution Complete!</h4>
            <p className="text-sm text-gray-400">Your new card has been forged from the flames</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="transform hover:scale-105 transition-all duration-500">
              <GameCard card={evolvedCard} />
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Rarity</span>
              <span className="text-blue-400 font-bold">Rare</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Power Increase</span>
              <span className="text-green-400 font-bold">+120%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Permanent NFT</span>
              <span className="text-orange-400 font-bold">Yes</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            onClick={handleClaim}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Claim New Card"}
          </Button>
        </>
      )}
      
      {step === 3 && (
        <>
          <div className="text-center mb-6">
            <h4 className="text-white font-medium">Evolution Complete!</h4>
            <p className="text-sm text-gray-400">Card added to your collection</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="animate-pulse-subtle">
              <GameCard card={evolvedCard} />
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20 mb-6">
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-green-500/30 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-green-400">Successfully minted on Monad blockchain</span>
            </div>
            <div className="mt-2 text-xs font-mono text-gray-500">
              Transaction: 0xf762d9e7f4a3e6b9b719e5c422f4c2afc580ef59...
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            onClick={() => setStep(1)}
          >
            Evolve More Cards
          </Button>
        </>
      )}
      
      <div className="mt-4 text-center text-xs text-gray-500">
        Powered by Monad's deflationary NFT mechanics
      </div>
    </Card>
  );
};

export default BurnToEvolve;
