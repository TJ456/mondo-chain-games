
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface MonadBoostMechanicProps {
  playerMonad: number;
  onBoost?: (amount: number) => void;
}

const MonadBoostMechanic: React.FC<MonadBoostMechanicProps> = ({ 
  playerMonad = 1000,
  onBoost = () => {} 
}) => {
  const [boostAmount, setBoostAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBoost = () => {
    if (boostAmount > playerMonad) {
      toast.error("Insufficient MONAD tokens");
      return;
    }
    
    setIsProcessing(true);
    
    toast.loading("Staking MONAD tokens for power boost...", {
      id: "boost-tx"
    });
    
    // Simulate transaction processing
    setTimeout(() => {
      toast.success("Boost activated!", {
        id: "boost-tx",
        description: `+${boostAmount * 2}% power to all cards for next 3 turns`
      });
      
      onBoost(boostAmount);
      setIsProcessing(false);
    }, 1000);
  };
  
  const boostEffect = Math.round(boostAmount * 2);
  
  return (
    <Card className="glassmorphism border-indigo-500/30 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-md font-bold text-white">MONAD Boost</h3>
          <p className="text-xs text-gray-400">Stake tokens to amplify card power</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Boost Amount</span>
          <span className="text-indigo-400 font-bold">{boostAmount} MONAD</span>
        </div>
        
        <Slider
          value={[boostAmount]}
          min={1}
          max={Math.min(100, playerMonad)}
          step={1}
          onValueChange={(value) => setBoostAmount(value[0])}
        />
        
        <div className="bg-black/30 p-3 rounded-lg border border-indigo-500/20">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Effect</span>
            <span className="text-indigo-400 font-bold">+{boostEffect}% Power</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Duration</span>
            <span className="text-indigo-400 font-bold">3 Turns</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
          disabled={isProcessing || boostAmount > playerMonad}
          onClick={handleBoost}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>Activate Boost</>
          )}
        </Button>
        
        <div className="text-center text-xs text-gray-500">
          Powered by Monad's sub-second finality
        </div>
      </div>
    </Card>
  );
};

export default MonadBoostMechanic;
