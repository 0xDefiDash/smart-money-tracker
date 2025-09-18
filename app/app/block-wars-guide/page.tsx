
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Gamepad2, 
  Target, 
  Sparkles,
  Shield, 
  Sword, 
  Crown,
  Trophy,
  Coins,
  Timer,
  Users,
  Zap,
  Star,
  Package,
  Gift,
  TrendingUp,
  AlertTriangle,
  Eye,
  Lock,
  Activity,
  Flame,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Crosshair
} from 'lucide-react'

export default function BlockWarsGuide() {
  const [animatedCounter, setAnimatedCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedCounter(prev => (prev + 1) % 1000)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500', 
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500',
    secret: 'bg-gradient-to-r from-pink-500 to-violet-600'
  }

  const rarityData = [
    { name: 'Common', color: 'text-gray-400', chance: '60%', value: '$50/min', features: ['Basic stats', 'Easy to find', 'Low steal risk'] },
    { name: 'Rare', color: 'text-blue-400', chance: '25%', value: '$150/min', features: ['Enhanced stats', 'Moderate protection', 'Decent income'] },
    { name: 'Epic', color: 'text-purple-400', chance: '12%', value: '$400/min', features: ['High stats', 'Strong protection', 'Great income'] },
    { name: 'Legendary', color: 'text-yellow-400', chance: '2.5%', value: '$1,000/min', features: ['Excellent stats', 'Elite protection', 'Premium income'] },
    { name: 'Secret', color: 'text-pink-400', chance: '0.5%', value: '$5,000/min', features: ['MAX stats', 'Ultimate protection', 'Elite income', 'Exclusive traits'] }
  ]

  const battleStrategies = [
    { title: 'The Stealth Strike', description: 'Target players with high money but low defense', icon: Eye },
    { title: 'The Fortress Build', description: 'Focus on defense upgrades to protect your wealth', icon: Shield },
    { title: 'The Raider', description: 'High attack power for maximum steal success', icon: Sword },
    { title: 'The Balanced Warrior', description: 'Equal attack and defense for versatility', icon: Target }
  ]

  const secretBlocks = [
    { name: 'realDonaldTrump', description: 'The ultimate power block with presidential authority', rarity: 'Secret' },
    { name: 'Bullrun Gravano', description: 'Legendary trader with insider knowledge', rarity: 'Secret' },
    { name: '0xSweeps', description: 'Elite crypto analyst with market prediction powers', rarity: 'Secret' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neon-green/20 via-neon-blue/20 to-purple-600/20 border border-neon-green/30 mb-8 glow-green">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative p-8 lg:p-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <Gamepad2 className="w-16 h-16 text-neon-green-bright animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-neon-green-bright via-neon-blue-bright to-purple-400 bg-clip-text text-transparent">
                Block Wars
              </h1>
              <p className="text-xl lg:text-2xl text-neon-green-bright font-semibold mt-2">Players Guide</p>
            </div>
            <Sparkles className="w-16 h-16 text-neon-blue-bright animate-bounce" />
          </div>
          
          <p className="text-center text-slate-300 text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
            Master the art of crypto warfare! Collect legendary blocks, battle other players, 
            steal their treasures, and climb to the top of the leaderboard in this epic blockchain adventure.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green-bright">{animatedCounter + 1247}</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue-bright">$2.5M</div>
              <div className="text-sm text-slate-400">Total Stolen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">156</div>
              <div className="text-sm text-slate-400">Secret Blocks Found</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8 bg-black/50 border border-neon-green/30">
          <TabsTrigger value="getting-started" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Play className="w-4 h-4 mr-2" />
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="blocks" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Package className="w-4 h-4 mr-2" />
            Block System
          </TabsTrigger>
          <TabsTrigger value="battles" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Sword className="w-4 h-4 mr-2" />
            Combat & Battles
          </TabsTrigger>
          <TabsTrigger value="economy" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Coins className="w-4 h-4 mr-2" />
            Economy & Upgrades
          </TabsTrigger>
          <TabsTrigger value="strategies" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Target className="w-4 h-4 mr-2" />
            Pro Strategies
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-neon-gradient data-[state=active]:text-black">
            <Trophy className="w-4 h-4 mr-2" />
            Rankings & Rewards
          </TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-neon-green/30 glow-green">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-neon-green-bright">
                <CheckCircle className="w-6 h-6" />
                <span>Quick Start Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neon-green-bright text-black font-bold flex items-center justify-center text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-white">Claim Your First Block</h4>
                      <p className="text-slate-300 text-sm">Visit the Arena tab and wait for blocks to spawn every 2 minutes. Click to claim them!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neon-green-bright text-black font-bold flex items-center justify-center text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-white">Start Earning Money</h4>
                      <p className="text-slate-300 text-sm">Blocks automatically generate money based on their rarity. Check your balance regularly!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neon-green-bright text-black font-bold flex items-center justify-center text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-white">Upgrade Your Stats</h4>
                      <p className="text-slate-300 text-sm">Visit the Store to buy attack and defense upgrades. Balance is key to success!</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neon-blue-bright text-black font-bold flex items-center justify-center text-sm">4</div>
                    <div>
                      <h4 className="font-semibold text-white">Enter Battle Mode</h4>
                      <p className="text-slate-300 text-sm">Once you have some defense, start battling other players to steal their money!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neon-blue-bright text-black font-bold flex items-center justify-center text-sm">5</div>
                    <div>
                      <h4 className="font-semibold text-white">Climb the Leaderboard</h4>
                      <p className="text-slate-300 text-sm">Earn experience, collect rare blocks, and compete for the top spot!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">6</div>
                    <div>
                      <h4 className="font-semibold text-white">Hunt Secret Blocks</h4>
                      <p className="text-slate-300 text-sm">Look out for ultra-rare secret blocks with massive income potential!</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-neon-green/30" />

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">Pro Tip</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Keep your money balance low by spending on upgrades! High money balances make you a target for raiders. 
                  Invest in defense first, then attack power for optimal gameplay.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Block System Tab */}
        <TabsContent value="blocks" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                  <span>Block Rarity System</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rarityData.map((rarity, index) => (
                    <div key={rarity.name} className="flex items-center space-x-4 p-3 rounded-lg bg-black/30 border border-slate-700/50">
                      <div className={`w-4 h-4 rounded ${rarityColors[rarity.name.toLowerCase() as keyof typeof rarityColors]}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${rarity.color}`}>{rarity.name}</span>
                          <span className="text-sm text-slate-400">{rarity.chance} spawn rate</span>
                        </div>
                        <div className="text-sm text-neon-green-bright font-medium mb-2">{rarity.value} income</div>
                        <div className="flex flex-wrap gap-1">
                          {rarity.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-400">
                  <Crown className="w-6 h-6" />
                  <span>Secret Blocks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm mb-4">
                    Ultra-rare blocks with unique personalities and massive income potential. Only the luckiest players will find these!
                  </p>
                  
                  {secretBlocks.map((block, index) => (
                    <div key={block.name} className="p-4 rounded-lg bg-gradient-to-r from-pink-500/20 to-violet-600/20 border border-pink-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{block.name}</span>
                        <Badge className="bg-gradient-to-r from-pink-500 to-violet-600 text-white">
                          {block.rarity}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{block.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-neon-green-bright text-sm font-medium">$5,000/min income</span>
                      </div>
                    </div>
                  ))}

                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Timer className="w-4 h-4 text-violet-400" />
                      <span className="text-violet-400 font-semibold text-sm">Spawn Mechanics</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Secret blocks have a 0.5% spawn chance and are limited to 1 per player per day. They appear randomly in the Arena and must be claimed quickly!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Activity className="w-6 h-6" />
                <span>Block Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Gift className="w-4 h-4 mr-2 text-green-400" />
                    Claiming Blocks
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Blocks spawn every 2 minutes in the Arena</li>
                    <li>• Maximum 12 blocks per player</li>
                    <li>• First-come, first-served basis</li>
                    <li>• Higher level players get priority on rare spawns</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-neon-green-bright" />
                    Income Generation
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Passive income generated per minute</li>
                    <li>• Rarity determines income rate</li>
                    <li>• Money accumulates automatically</li>
                    <li>• Check Collection tab to monitor</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-400" />
                    Block Protection
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Higher rarity = better protection</li>
                    <li>• Secret blocks are nearly unstealable</li>
                    <li>• Your defense stats matter</li>
                    <li>• Some blocks have special immunity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combat & Battles Tab */}
        <TabsContent value="battles" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-400">
                  <Sword className="w-6 h-6" />
                  <span>Battle System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">How Battles Work</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>1. <strong className="text-white">Choose your target</strong> - Look for players with high money but low defense</p>
                    <p>2. <strong className="text-white">Calculate success chance</strong> - Your attack vs their defense</p>
                    <p>3. <strong className="text-white">Execute the raid</strong> - Success steals 15-30% of their money</p>
                    <p>4. <strong className="text-white">Gain experience</strong> - Win or lose, you earn XP for trying</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Battle Formulas</h4>
                  <div className="bg-black/30 rounded-lg p-3 space-y-2 font-mono text-sm">
                    <div className="text-green-400">Success Rate = (Attack / (Attack + Defense)) × 100%</div>
                    <div className="text-yellow-400">Money Stolen = Target Money × (15% to 30%)</div>
                    <div className="text-blue-400">XP Gained = 10-50 points (based on difficulty)</div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">Battle Cooldowns</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    You can only attack the same player once every 30 minutes. Failed attacks have a 5-minute cooldown.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-400">
                  <Target className="w-6 h-6" />
                  <span>Battle Strategies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {battleStrategies.map((strategy, index) => {
                    const Icon = strategy.icon
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-black/30 border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white mb-1">{strategy.title}</h5>
                          <p className="text-slate-300 text-sm">{strategy.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Eye className="w-6 h-6" />
                <span>Real-Time Battle Feed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Live Battle Ticker</h4>
                  <div className="bg-black/30 rounded-lg p-4 border border-slate-700/50">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-green-400">
                        <span>CryptoMaster88 raided WhaleFinder</span>
                        <span>+$2,450</span>
                      </div>
                      <div className="flex items-center justify-between text-red-400">
                        <span>BlockHunter defended against Raider99</span>
                        <span>+25 XP</span>
                      </div>
                      <div className="flex items-center justify-between text-yellow-400">
                        <span>DiamondHands found a LEGENDARY block!</span>
                        <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded">RARE!</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">Battle Tips</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Target players with 10x+ money vs defense ratio</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Attack during off-peak hours for better success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Watch for players who just claimed expensive blocks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Build defense before going on offense sprees</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Economy & Upgrades Tab */}
        <TabsContent value="economy" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <Coins className="w-6 h-6" />
                  <span>Money System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Income Sources</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Common Block</span>
                      <span className="text-green-400 font-medium">$50/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400">Rare Block</span>
                      <span className="text-green-400 font-medium">$150/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400">Epic Block</span>
                      <span className="text-green-400 font-medium">$400/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400">Legendary Block</span>
                      <span className="text-green-400 font-medium">$1,000/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-400">Secret Block</span>
                      <span className="text-green-400 font-medium">$5,000/min</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Money Management</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• Money accumulates automatically from blocks</li>
                    <li>• High money balances attract raiders</li>
                    <li>• Spend regularly on upgrades for protection</li>
                    <li>• Failed raids lose 5% of your money</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-400">
                  <Zap className="w-6 h-6" />
                  <span>Upgrade System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sword className="w-4 h-4 text-red-400" />
                      <span className="text-white font-semibold text-sm">Attack Power</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Level 1: $1,000</div>
                      <div>Level 5: $5,000</div>
                      <div>Level 10: $25,000</div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold text-sm">Defense</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Level 1: $1,200</div>
                      <div>Level 5: $6,000</div>
                      <div>Level 10: $30,000</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-purple-400" />
                    Special Upgrades
                  </h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Steal Success Boost</span>
                      <span className="text-purple-400">+15% success rate</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Money Protection</span>
                      <span className="text-blue-400">-50% raid losses</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP Multiplier</span>
                      <span className="text-yellow-400">Double XP gains</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <BarChart3 className="w-6 h-6" />
                <span>Investment Strategy Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Early Game (Levels 1-5)</h4>
                  <p className="text-sm text-slate-300">Focus on defense upgrades first. Build a strong foundation before attacking others.</p>
                  <div className="mt-3 text-xs text-green-400 font-semibold">Defense Priority</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Target className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Mid Game (Levels 6-15)</h4>
                  <p className="text-sm text-slate-300">Balance attack and defense. Start raiding weaker players for quick money.</p>
                  <div className="mt-3 text-xs text-orange-400 font-semibold">Balanced Approach</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <Crown className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">End Game (Level 16+)</h4>
                  <p className="text-sm text-slate-300">Max out special upgrades. Hunt for secret blocks and dominate the leaderboard.</p>
                  <div className="mt-3 text-xs text-purple-400 font-semibold">Elite Player</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pro Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <Crosshair className="w-6 h-6" />
                <span>Advanced Combat Tactics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">The Perfect Raid Target</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Money to Defense Ratio &gt; 10:1</div>
                        <div className="text-sm text-slate-300">Target has $50K+ money but &lt;$5K defense</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Recently Active Player</div>
                        <div className="text-sm text-slate-300">They'll have fresh money from block income</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Lower Level Than You</div>
                        <div className="text-sm text-slate-300">Less experience = weaker upgrades</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-4">Timing Your Attacks</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-400 font-medium mb-1">Peak Hours (7-11 PM EST)</div>
                      <div className="text-slate-300">Many players online = more competition but fresh targets</div>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-purple-400 font-medium mb-1">Off Hours (2-6 AM EST)</div>
                      <div className="text-slate-300">Fewer defenders = higher success rates</div>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="text-yellow-400 font-medium mb-1">Right After Block Spawns</div>
                      <div className="text-slate-300">Players just spent money on blocks = temporarily vulnerable</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-400">
                  <Activity className="w-6 h-6" />
                  <span>Resource Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">The 50/30/20 Rule</h5>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div><span className="text-green-400 font-medium">50%</span> on Defense upgrades</div>
                      <div><span className="text-red-400 font-medium">30%</span> on Attack upgrades</div>
                      <div><span className="text-purple-400 font-medium">20%</span> on Special upgrades</div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">Never Hold More Than:</h5>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>• 10x your total defense value</div>
                      <div>• $100K without maxed defense</div>
                      <div>• Money overnight (spend before logging off)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-400">
                  <Flame className="w-6 h-6" />
                  <span>Secret Block Hunting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">Maximizing Secret Block Chances</h5>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div>• Check Arena every spawn (0.5% chance each time)</div>
                      <div>• Higher level players get slight priority</div>
                      <div>• Only 1 secret block per player per day</div>
                      <div>• Spawns are completely random - no patterns</div>
                    </div>
                  </div>
                  
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">Secret Block ROI</h5>
                    <div className="text-sm text-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span>Income per hour:</span>
                        <span className="text-green-400 font-medium">$300,000</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span>Income per day:</span>
                        <span className="text-green-400 font-medium">$7,200,000</span>
                      </div>
                      <div className="text-xs text-purple-400 mt-2">
                        One secret block = game changer! 💎
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rankings & Rewards Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Trophy className="w-6 h-6" />
                <span>Leaderboard System</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Ranking Factors</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center text-sm">40%</div>
                      <div>
                        <div className="text-white font-medium">Total Money Earned</div>
                        <div className="text-sm text-slate-300">Lifetime earnings from all sources</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">30%</div>
                      <div>
                        <div className="text-white font-medium">Block Collection Value</div>
                        <div className="text-sm text-slate-300">Total value of all owned blocks</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white font-bold flex items-center justify-center text-sm">20%</div>
                      <div>
                        <div className="text-white font-medium">Battle Statistics</div>
                        <div className="text-sm text-slate-300">Win rate and successful raids</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-black font-bold flex items-center justify-center text-sm">10%</div>
                      <div>
                        <div className="text-white font-medium">Experience Level</div>
                        <div className="text-sm text-slate-300">Overall player level and XP</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-4">Player Badges</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <div className="text-sm font-medium text-white">Crypto King</div>
                      <div className="text-xs text-slate-400">Top 1% player</div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <Sword className="w-6 h-6 text-red-400 mx-auto mb-1" />
                      <div className="text-sm font-medium text-white">Raid Master</div>
                      <div className="text-xs text-slate-400">100+ successful raids</div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                      <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <div className="text-sm font-medium text-white">Fortress</div>
                      <div className="text-xs text-slate-400">Defended 50+ raids</div>
                    </div>
                    
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-center">
                      <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                      <div className="text-sm font-medium text-white">Secret Holder</div>
                      <div className="text-xs text-slate-400">Owns secret block</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <Star className="w-5 h-5" />
                  <span>Top 10 Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Daily bonus money:</span>
                    <span className="text-green-400 font-medium">+$50,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Exclusive badge:</span>
                    <span className="text-yellow-400 font-medium">Elite Player</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Special privileges:</span>
                    <span className="text-purple-400 font-medium">Priority spawns</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-400">
                  <Crown className="w-5 h-5" />
                  <span>Top 3 Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Daily bonus money:</span>
                    <span className="text-green-400 font-medium">+$100,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Exclusive badge:</span>
                    <span className="text-yellow-400 font-medium">Crypto Elite</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Special privileges:</span>
                    <span className="text-purple-400 font-medium">VIP features</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-400">
                  <Trophy className="w-5 h-5" />
                  <span>#1 Player Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Daily bonus money:</span>
                    <span className="text-green-400 font-medium">+$250,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Exclusive badge:</span>
                    <span className="text-yellow-400 font-medium">Crypto King</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Special privileges:</span>
                    <span className="text-purple-400 font-medium">All features</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA Section */}
      <Card className="bg-gradient-to-r from-neon-green/10 via-neon-blue/10 to-purple-600/10 border border-neon-green/30 glow-green mt-8">
        <CardContent className="text-center p-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-neon-green-bright via-neon-blue-bright to-purple-400 bg-clip-text text-transparent mb-4">
            Ready to Dominate Block Wars?
          </h3>
          <p className="text-slate-300 text-lg mb-6">
            Apply these strategies and climb to the top of the leaderboard!
          </p>
          <Button 
            size="lg" 
            className="bg-neon-gradient hover:glow-green text-black font-bold px-8 py-3"
            onClick={() => window.location.href = '/block-wars'}
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Start Playing Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
