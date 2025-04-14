import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AIDifficultyTier } from '@/types/game';
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldAlert, Skull, Users } from 'lucide-react';

interface GameRoomSelectorProps {
  onSelectDifficulty: (difficulty: AIDifficultyTier) => void;
  onOpenInventory: () => void;
}

const GameRoomSelector: React.FC<GameRoomSelectorProps> = ({ onSelectDifficulty, onOpenInventory }) => {
  return (
    <Card className="glassmorphism border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-emerald-400" />
          <span className="text-white">Select Game Room</span>
        </CardTitle>
        <CardDescription>Choose your AI opponent difficulty</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/20 border-white/10 hover:bg-emerald-900/20 transition-colors cursor-pointer" onClick={() => onSelectDifficulty(AIDifficultyTier.NOVICE)}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-emerald-400" />
                Novice
              </CardTitle>
              <CardDescription className="text-gray-400">Easy mode for beginners</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">Perfect for learning the basics of MONAD battles.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-white/10 hover:bg-emerald-900/20 transition-colors cursor-pointer" onClick={() => onSelectDifficulty(AIDifficultyTier.VETERAN)}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2 text-amber-400" />
                Veteran
              </CardTitle>
              <CardDescription className="text-gray-400">Medium difficulty for experienced players</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">For experienced players. Face smarter opponents.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-white/10 hover:bg-emerald-900/20 transition-colors cursor-pointer" onClick={() => onSelectDifficulty(AIDifficultyTier.LEGEND)}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Skull className="h-4 w-4 mr-2 text-red-400" />
                Legend
              </CardTitle>
              <CardDescription className="text-gray-400">Hard mode for advanced players</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">For masters only. Face the ultimate challenge.</p>
            </CardContent>
          </Card>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-emerald-400 to-teal-500" onClick={onOpenInventory}>
          Manage Card Collection
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameRoomSelector;
