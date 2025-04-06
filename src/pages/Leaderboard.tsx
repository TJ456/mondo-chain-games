
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlayerCard from '@/components/PlayerCard';
import { players } from '@/data/gameData';

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('wins');
  
  // Sort players based on selected tab
  const sortedPlayers = [...players].sort((a, b) => {
    if (selectedTab === 'wins') {
      return b.wins - a.wins;
    } else if (selectedTab === 'level') {
      return b.level - a.level;
    } else if (selectedTab === 'winrate') {
      const aWinRate = a.wins / (a.wins + a.losses) || 0;
      const bWinRate = b.wins / (b.wins + b.losses) || 0;
      return bWinRate - aWinRate;
    } else { // tokens
      return b.tokens - a.tokens;
    }
  });
  
  // Filter players based on search
  const filteredPlayers = sortedPlayers.filter(player =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4 md:px-0 pb-16">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mondo-purple to-mondo-blue">
            Leaderboard
          </span>
        </h1>
        <p className="text-gray-400 mb-8">
          Top players in the MONDO Chain Games ecosystem
        </p>
        
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="md:col-span-3">
            <Input 
              placeholder="Search players..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <Tabs 
              defaultValue="wins" 
              className="w-full"
              onValueChange={(value) => setSelectedTab(value)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="wins">Wins</TabsTrigger>
                <TabsTrigger value="level">Level</TabsTrigger>
                <TabsTrigger value="winrate">Win Rate</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} rank={index} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-3xl text-gray-500 mb-2">No players found</div>
              <p className="text-gray-400">Try adjusting your search</p>
            </div>
          )}
        </div>
        
        {/* Season Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="glassmorphism border-mondo-purple/30">
            <CardHeader>
              <CardTitle className="text-white">Current Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Season Name</div>
                  <div className="text-lg font-bold text-mondo-cyan">Rise of MONDO</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Time Remaining</div>
                  <div className="text-lg font-bold text-white">21 days</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Current Prize Pool</div>
                  <div className="text-lg font-bold text-mondo-cyan">50,000 MONDO</div>
                </div>
                <Button className="w-full bg-gradient-to-r from-mondo-purple to-mondo-blue text-white">
                  Season Details
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-mondo-blue/30">
            <CardHeader>
              <CardTitle className="text-white">Top Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xs mr-2">
                      1
                    </div>
                    <div className="text-white">1st Place</div>
                  </div>
                  <div className="text-mondo-cyan font-bold">10,000 MONDO</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold text-xs mr-2">
                      2
                    </div>
                    <div className="text-white">2nd Place</div>
                  </div>
                  <div className="text-mondo-cyan font-bold">5,000 MONDO</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center text-black font-bold text-xs mr-2">
                      3
                    </div>
                    <div className="text-white">3rd Place</div>
                  </div>
                  <div className="text-mondo-cyan font-bold">2,500 MONDO</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-mondo-purple/20 flex items-center justify-center text-mondo-purple font-bold text-xs mr-2">
                      4-10
                    </div>
                    <div className="text-white">4th-10th Place</div>
                  </div>
                  <div className="text-mondo-cyan font-bold">1,000 MONDO</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-mondo-cyan/30">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded bg-black/30 border border-mondo-purple/30">
                  <div className="text-lg font-bold text-white">Weekend Warrior</div>
                  <div className="text-sm text-gray-400 mb-2">Starts in 2 days</div>
                  <div className="text-xs px-2 py-1 inline-block rounded bg-mondo-purple/20 text-mondo-purple">
                    200 MONDO Entry
                  </div>
                </div>
                
                <div className="p-3 rounded bg-black/30 border border-mondo-blue/30">
                  <div className="text-lg font-bold text-white">Pro Circuit</div>
                  <div className="text-sm text-gray-400 mb-2">Starts in 5 days</div>
                  <div className="text-xs px-2 py-1 inline-block rounded bg-mondo-blue/20 text-mondo-blue">
                    500 MONDO Entry
                  </div>
                </div>
                
                <div className="p-3 rounded bg-black/30 border border-yellow-600/30">
                  <div className="text-lg font-bold text-white">Championship Series</div>
                  <div className="text-sm text-gray-400 mb-2">Starts in 14 days</div>
                  <div className="text-xs px-2 py-1 inline-block rounded bg-yellow-600/20 text-yellow-400">
                    1,000 MONDO Entry
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
