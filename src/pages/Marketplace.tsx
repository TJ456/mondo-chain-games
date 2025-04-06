
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameCard from '@/components/GameCard';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cards, marketListings, currentPlayer } from '@/data/gameData';
import { CardRarity, CardType } from '@/types/game';

const Marketplace = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all');
  
  // Filter cards based on search and filters
  const filteredCards = marketListings.filter(listing => {
    const matchesSearch = listing.card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          listing.card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || listing.card.rarity === rarityFilter;
    const matchesType = typeFilter === 'all' || listing.card.type === typeFilter;
    
    return matchesSearch && matchesRarity && matchesType;
  });
  
  const handleBuy = (listingId: string, price: number) => {
    if (currentPlayer.tokens < price) {
      toast({
        title: "Insufficient funds",
        description: `You need ${price} MONDO tokens to purchase this card.`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Purchase successful!",
      description: `You've purchased a new card for ${price} MONDO tokens.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4 md:px-0 pb-16">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-purple to-mondo-blue">
            NFT Marketplace
          </span>
        </h1>
        <p className="text-gray-400 mb-8">
          Browse, buy, and sell unique blockchain cards
        </p>
        
        <Tabs defaultValue="buy" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="buy">Buy Cards</TabsTrigger>
            <TabsTrigger value="sell">Sell Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy">
            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div>
                <Input 
                  placeholder="Search cards..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <select 
                  className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as CardRarity | 'all')}
                >
                  <option value="all">All Rarities</option>
                  <option value={CardRarity.COMMON}>Common</option>
                  <option value={CardRarity.RARE}>Rare</option>
                  <option value={CardRarity.EPIC}>Epic</option>
                  <option value={CardRarity.LEGENDARY}>Legendary</option>
                </select>
              </div>
              
              <div>
                <select 
                  className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as CardType | 'all')}
                >
                  <option value="all">All Types</option>
                  <option value={CardType.ATTACK}>Attack</option>
                  <option value={CardType.DEFENSE}>Defense</option>
                  <option value={CardType.UTILITY}>Utility</option>
                </select>
              </div>
            </div>
            
            {/* Marketplace listings */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.length > 0 ? (
                filteredCards.map(listing => (
                  <Card key={listing.id} className="glassmorphism border-mondo-purple/30 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 flex justify-center">
                        <GameCard card={listing.card} showDetails={false} className="w-40 h-56" />
                      </div>
                      
                      <div className="p-4 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1">{listing.card.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{listing.card.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="text-xs px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800/50">
                            {listing.card.rarity}
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-purple-900/50 text-purple-400 border border-purple-800/50">
                            {listing.card.type}
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-sm text-gray-400">Price:</div>
                            <div className="text-lg font-bold text-mondo-cyan">{listing.price} MONDO</div>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-mondo-purple to-mondo-blue text-white"
                            onClick={() => handleBuy(listing.id, listing.price)}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-3xl text-gray-500 mb-2">No results found</div>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sell">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-mondo-purple/20 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-mondo-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sell Your Cards</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  Connect your wallet to list your MONDO NFT cards for sale on the marketplace.
                </p>
                <Button 
                  className="bg-gradient-to-r from-mondo-purple to-mondo-blue text-white"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "The sell functionality will be available in the next update.",
                    });
                  }}
                >
                  Connect Wallet to Sell
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Featured Collections */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Collections</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glassmorphism border-mondo-blue/30">
              <CardHeader>
                <CardTitle className="text-white">Starter Pack</CardTitle>
                <CardDescription>Perfect for new players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-[-30px]">
                  <GameCard card={cards[0]} className="w-32 h-44 transform rotate-[-15deg]" showDetails={false} />
                  <GameCard card={cards[1]} className="w-32 h-44" showDetails={false} />
                  <GameCard card={cards[2]} className="w-32 h-44 transform rotate-[15deg]" showDetails={false} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-lg font-bold text-mondo-cyan">300 MONDO</div>
                <Button variant="outline">View Pack</Button>
              </CardFooter>
            </Card>
            
            <Card className="glassmorphism border-mondo-purple/30">
              <CardHeader>
                <CardTitle className="text-white">Epic Collection</CardTitle>
                <CardDescription>Rare and powerful cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-[-30px]">
                  <GameCard card={cards[3]} className="w-32 h-44 transform rotate-[-15deg]" showDetails={false} />
                  <GameCard card={cards[4]} className="w-32 h-44" showDetails={false} />
                  <GameCard card={cards[6]} className="w-32 h-44 transform rotate-[15deg]" showDetails={false} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-lg font-bold text-mondo-cyan">1200 MONDO</div>
                <Button variant="outline">View Pack</Button>
              </CardFooter>
            </Card>
            
            <Card className="glassmorphism border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-white">Legendary Bundle</CardTitle>
                <CardDescription>The most exclusive cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-[-30px]">
                  <GameCard card={cards[5]} className="w-32 h-44 transform rotate-[-15deg]" showDetails={false} />
                  <GameCard card={cards[7]} className="w-32 h-44" showDetails={false} />
                  <GameCard card={cards[6]} className="w-32 h-44 transform rotate-[15deg]" showDetails={false} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-lg font-bold text-mondo-cyan">3000 MONDO</div>
                <Button variant="outline">View Pack</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
