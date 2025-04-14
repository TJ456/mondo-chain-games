
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Card as GameCardType } from '@/types/game';
import { Shield, Zap, Sparkles, Sword } from 'lucide-react';

interface GameCardProps {
  card: GameCardType;
  showDetails?: boolean;
  onClick?: () => void;
  boosted?: boolean;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ card, showDetails = false, onClick, boosted = false, className = '' }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };
  
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-200 
        ${onClick ? 'cursor-pointer hover:scale-105' : ''} 
        ${boosted ? 'border-amber-500' : ''}
        ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-3 flex flex-col items-start">
        <div className="flex justify-between w-full items-center mb-2">
          <h3 className="text-sm font-semibold">{card.name}</h3>
          <Badge variant="secondary">{card.rarity}</Badge>
        </div>
        
        {showDetails && (
          <>
            <p className="text-xs text-muted-foreground mb-2">{card.description}</p>
            
            <div className="flex items-center space-x-2 mb-2">
              {card.attack && (
                <div className="flex items-center text-xs">
                  <Sword className="h-3 w-3 mr-1 text-red-500" />
                  <span>{card.attack}</span>
                </div>
              )}
              {card.defense && (
                <div className="flex items-center text-xs">
                  <Shield className="h-3 w-3 mr-1 text-blue-500" />
                  <span>{card.defense}</span>
                </div>
              )}
              <div className="flex items-center text-xs">
                <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                <span>{card.mana}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {boosted && (
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-transparent"></div>
          <Sparkles className="absolute top-1 right-1 text-amber-400 h-4 w-4" />
        </div>
      )}
    </Card>
  );
};

export default GameCard;
