
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import GameCard from '@/components/GameCard';
import { generateAvatarImage } from '@/utils/placeholderImages';
import { currentPlayer } from '@/data/gameData';

const Profile = () => {
  const avatarUrl = currentPlayer.avatar.startsWith('/')
    ? generateAvatarImage(currentPlayer.username)
    : currentPlayer.avatar;
  
  const experienceToNextLevel = currentPlayer.level * 100;
  const progressPercentage = Math.min(100, (currentPlayer.experience % experienceToNextLevel) / experienceToNextLevel * 100);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4 md:px-0 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div>
            <Card className="glassmorphism border-mondo-purple/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-mondo-purple">
                      <img 
                        src={avatarUrl} 
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-mondo-blue flex items-center justify-center text-white font-bold">
                      {currentPlayer.level}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-1">{currentPlayer.username}</h2>
                  <div className="text-sm text-gray-400 mb-4">{currentPlayer.address}</div>
                  
                  <div className="w-full mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Level {currentPlayer.level}</span>
                      <span>{currentPlayer.experience % experienceToNextLevel}/{experienceToNextLevel} XP</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 w-full gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mondo-purple">{currentPlayer.wins}</div>
                      <div className="text-xs text-gray-400">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{currentPlayer.losses}</div>
                      <div className="text-xs text-gray-400">Losses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {currentPlayer.wins + currentPlayer.losses > 0
                          ? Math.round((currentPlayer.wins / (currentPlayer.wins + currentPlayer.losses)) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-mondo-purple to-mondo-blue text-white">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism border-mondo-blue/30">
              <CardHeader>
                <CardTitle className="text-white">Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">MONDO Token Balance</div>
                    <div className="text-2xl font-bold text-mondo-cyan">{currentPlayer.tokens} MONDO</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" className="w-[48%]">
                      Buy Tokens
                    </Button>
                    <Button variant="outline" className="w-[48%]">
                      Transfer
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Transaction History</div>
                    <div className="space-y-2">
                      <div className="text-xs p-2 rounded bg-black/30 flex justify-between">
                        <span className="text-white">Card Purchase</span>
                        <span className="text-red-400">-150 MONDO</span>
                      </div>
                      <div className="text-xs p-2 rounded bg-black/30 flex justify-between">
                        <span className="text-white">Game Reward</span>
                        <span className="text-green-400">+50 MONDO</span>
                      </div>
                      <div className="text-xs p-2 rounded bg-black/30 flex justify-between">
                        <span className="text-white">Token Purchase</span>
                        <span className="text-green-400">+1000 MONDO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Cards Collection */}
          <div className="md:col-span-2">
            <Card className="glassmorphism border-mondo-purple/30 h-full">
              <CardHeader>
                <CardTitle className="text-white">My Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cards">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                    <TabsTrigger value="decks">Decks</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cards" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {currentPlayer.cards.map(card => (
                        <div key={card.id}>
                          <GameCard card={card} />
                        </div>
                      ))}
                      
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg h-80 bg-black/20">
                        <div className="text-center">
                          <div className="h-12 w-12 rounded-full bg-mondo-purple/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mondo-purple" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-gray-400 mb-2">Get New Cards</div>
                          <Button 
                            variant="outline" 
                            className="border-mondo-purple text-mondo-purple hover:bg-mondo-purple/20"
                          >
                            Visit Marketplace
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="decks" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="glassmorphism border-mondo-blue/30">
                        <CardHeader>
                          <CardTitle className="text-lg text-white">Battle Deck</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {currentPlayer.cards.slice(0, 3).map(card => (
                              <div key={card.id} className="w-16 h-24">
                                <GameCard card={card} showDetails={false} />
                              </div>
                            ))}
                          </div>
                          <Button size="sm" variant="outline" className="w-full">Edit Deck</Button>
                        </CardContent>
                      </Card>
                      
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg bg-black/20 p-6">
                        <div className="text-center">
                          <div className="h-12 w-12 rounded-full bg-mondo-purple/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mondo-purple" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-gray-400 mb-2">Create New Deck</div>
                          <Button 
                            variant="outline" 
                            className="border-mondo-purple text-mondo-purple hover:bg-mondo-purple/20"
                          >
                            Create Deck
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="achievements" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded border border-green-600/30 bg-green-900/10">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="text-lg font-bold text-white">First Victory</div>
                        </div>
                        <div className="text-sm text-gray-400">Win your first battle</div>
                      </div>
                      
                      <div className="p-4 rounded border border-green-600/30 bg-green-900/10">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="text-lg font-bold text-white">Collector</div>
                        </div>
                        <div className="text-sm text-gray-400">Obtain 5 different cards</div>
                      </div>
                      
                      <div className="p-4 rounded border border-gray-600/30 bg-gray-900/10">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="text-lg font-bold text-gray-400">Master Strategist</div>
                        </div>
                        <div className="text-sm text-gray-500">Win 10 consecutive matches</div>
                        <div className="mt-2 text-xs text-gray-500">Progress: 3/10</div>
                        <Progress value={30} className="h-1 mt-1" />
                      </div>
                      
                      <div className="p-4 rounded border border-gray-600/30 bg-gray-900/10">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="text-lg font-bold text-gray-400">Blockchain Mogul</div>
                        </div>
                        <div className="text-sm text-gray-500">Hold 10,000 MONDO tokens</div>
                        <div className="mt-2 text-xs text-gray-500">Progress: 1,000/10,000</div>
                        <Progress value={10} className="h-1 mt-1" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
