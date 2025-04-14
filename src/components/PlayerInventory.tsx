
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameCard from '@/components/GameCard';
import { Card as GameCardType } from '@/types/game';
import { Package } from 'lucide-react';

interface PlayerInventoryProps {
  playerCards: GameCardType[];
  onClose: () => void;
  onSelectDeck: () => void;
}

const PlayerInventory: React.FC<PlayerInventoryProps> = ({ playerCards, onClose, onSelectDeck }) => {
  return (
    <Card className="glassmorphism border-emerald-500/30 w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2 text-emerald-400" />
          <span className="text-white">My Card Collection</span>
        </CardTitle>
        <CardDescription>Manage your MONAD blockchain cards</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {playerCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playerCards.map((card) => (
                <div key={card.id} className="transform hover:-translate-y-2 transition-transform">
                  <GameCard card={card} showDetails={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Cards Yet</h3>
              <p className="text-sm text-gray-400 text-center max-w-sm">
                Your collection is empty. Win battles to earn shards and redeem them for new cards!
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-gradient-to-r from-emerald-400 to-teal-500" onClick={onSelectDeck}>
          Select Cards & Return
        </Button>
        <Button variant="outline" className="w-full ml-2" onClick={onClose}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlayerInventory;
