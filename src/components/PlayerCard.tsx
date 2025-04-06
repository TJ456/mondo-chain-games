
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Player } from "@/types/game";
import { generateAvatarImage } from '@/utils/placeholderImages';
import { Progress } from '@/components/ui/progress';

interface PlayerCardProps {
  player: Player;
  rank?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, rank }) => {
  const avatarUrl = player.avatar.startsWith('/') 
    ? generateAvatarImage(player.username)
    : player.avatar;

  const experienceToNextLevel = player.level * 100;
  const progressPercentage = Math.min(100, (player.experience % experienceToNextLevel) / experienceToNextLevel * 100);
  
  return (
    <Card className="glassmorphism border-mondo-purple/30 overflow-hidden transition-all duration-300 hover:border-mondo-purple/70">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Rank number if provided */}
          {rank !== undefined && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mondo-purple/20 flex items-center justify-center text-mondo-purple font-bold">
              {rank + 1}
            </div>
          )}
          
          {/* Avatar */}
          <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-mondo-blue">
            <img 
              src={avatarUrl} 
              alt={`${player.username}'s avatar`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-medium text-center">
              Lvl {player.level}
            </div>
          </div>
          
          {/* Player info */}
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">{player.username}</h3>
              <div className="text-sm text-mondo-cyan font-medium">{player.tokens} MONDO</div>
            </div>
            
            <div className="mt-1 flex items-center text-xs text-gray-400">
              <span className="truncate">{player.address}</span>
            </div>
            
            {/* Stats */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-green-400 text-sm">
                  <span className="font-semibold">{player.wins}</span> 
                  <span className="text-xs ml-1">Wins</span>
                </div>
                
                <div className="text-red-400 text-sm">
                  <span className="font-semibold">{player.losses}</span>
                  <span className="text-xs ml-1">Losses</span>
                </div>
                
                <div className="text-yellow-400 text-sm">
                  <span className="font-semibold">{player.cards.length}</span>
                  <span className="text-xs ml-1">Cards</span>
                </div>
              </div>
              
              {/* Win rate */}
              <div className="text-xs text-gray-300">
                Win Rate: 
                <span className="ml-1 font-semibold">
                  {player.wins + player.losses > 0 
                    ? Math.round((player.wins / (player.wins + player.losses)) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
            
            {/* Experience bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Level {player.level}</span>
                <span>Level {player.level + 1}</span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
