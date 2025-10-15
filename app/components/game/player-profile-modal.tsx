
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Crown,
  Star,
  Gem,
  Shield,
  Sword,
  DollarSign,
  Target,
  TrendingUp,
  Zap,
  Clock,
  Award,
  Coins,
  Loader2,
  User,
  Twitter,
  Wallet,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react'

interface Block {
  id: string
  name: string
  type: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret'
  value: number
  power: number
  defense: number
  image: string
  color: string
}

interface PlayerProfileData {
  playerId: string
  playerName: string
  level: number
  experience: number
  money: number
  coins: number
  blocksOwned: number
  ownedBlocks: Block[]
  defenseStrength: number
  attackPower: number
  totalValue: number
  winRate: number
  battlesWon: number
  battlesLost: number
  moneyPerMinute: number
  rareBlocksOwned: number
  epicBlocksOwned: number
  legendaryBlocksOwned: number
  secretBlocksOwned: number
  rank: number
  badge: string
  badgeColor: string
  walletAddress?: string
  twitterHandle?: string
  createdAt?: string
  upgradeEffects?: {
    attackPowerBonus: number
    defenseStrengthBonus: number
    stealSuccessBonus: number
    blockProtectionBonus: number
    moneyMultiplierBonus: number
  }
}

interface PlayerProfileModalProps {
  playerId: string | null
  isOpen: boolean
  onClose: () => void
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'from-orange-500 to-red-500'
    case 'epic':
      return 'from-purple-500 to-pink-500'
    case 'rare':
      return 'from-blue-500 to-cyan-500'
    case 'secret':
      return 'from-yellow-500 to-amber-500'
    default:
      return 'from-gray-500 to-slate-500'
  }
}

const getRarityBadgeColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-orange-500 text-white'
    case 'epic':
      return 'bg-purple-500 text-white'
    case 'rare':
      return 'bg-blue-500 text-white'
    case 'secret':
      return 'bg-yellow-500 text-black'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function PlayerProfileModal({ playerId, isOpen, onClose }: PlayerProfileModalProps) {
  const [profile, setProfile] = useState<PlayerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && playerId) {
      fetchPlayerProfile()
    }
  }, [isOpen, playerId])

  const fetchPlayerProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/game/player-profile?playerId=${playerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch player profile')
      }
      
      const data = await response.json()
      setProfile(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalBattles = (profile?.battlesWon || 0) + (profile?.battlesLost || 0)
  const experienceNeeded = (profile?.level || 1) * 100
  const experienceProgress = ((profile?.experience || 0) % 100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <p className="text-red-500">Failed to load player profile</p>
            <Button onClick={fetchPlayerProfile}>Try Again</Button>
          </div>
        ) : profile ? (
          <ScrollArea className="h-[90vh]">
            <div className="p-6 space-y-6">
              {/* Header Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl" />
                <div className="relative p-6 space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${
                          profile.rank === 1 ? 'from-yellow-500 to-orange-500' :
                          profile.rank === 2 ? 'from-gray-400 to-gray-500' :
                          profile.rank === 3 ? 'from-orange-500 to-red-500' :
                          'from-blue-500 to-purple-500'
                        } flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
                          {profile.playerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                          {profile.rank === 1 && <Crown className="w-8 h-8 text-yellow-500" />}
                          {profile.rank === 2 && <Trophy className="w-8 h-8 text-gray-400" />}
                          {profile.rank === 3 && <Star className="w-8 h-8 text-orange-500" />}
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-3xl font-bold">{profile.playerName}</h2>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant="outline" 
                            style={{ backgroundColor: `${profile.badgeColor}20`, color: profile.badgeColor }}
                            className="text-sm"
                          >
                            {profile.badge}
                          </Badge>
                          <Badge variant="outline">Rank #{profile.rank}</Badge>
                          <Badge variant="outline">Level {profile.level}</Badge>
                        </div>
                        
                        {/* Social Links */}
                        <div className="flex items-center space-x-3 mt-2">
                          {profile.twitterHandle && (
                            <a 
                              href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600"
                            >
                              <Twitter className="w-4 h-4" />
                              <span>{profile.twitterHandle}</span>
                            </a>
                          )}
                          {profile.walletAddress && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Wallet className="w-4 h-4" />
                              <span className="font-mono">{profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-4xl font-bold text-green-500">
                        ${profile.money.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +${profile.moneyPerMinute}/min
                      </div>
                      <div className="text-sm text-yellow-500">
                        {profile.coins.toLocaleString()} coins
                      </div>
                    </div>
                  </div>
                  
                  {/* Level Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level {profile.level} Progress</span>
                      <span>{experienceProgress}/{experienceNeeded} XP</span>
                    </div>
                    <Progress value={(experienceProgress / experienceNeeded) * 100} className="h-3" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Sword className="w-5 h-5 text-red-500" />
                      <span className="text-2xl font-bold">
                        {profile.attackPower + (profile.upgradeEffects?.attackPowerBonus || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Attack Power</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {profile.defenseStrength + (profile.upgradeEffects?.defenseStrengthBonus || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Defense</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Target className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold">{profile.winRate}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Gem className="w-5 h-5 text-purple-500" />
                      <span className="text-2xl font-bold">{profile.blocksOwned}/12</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Blocks Owned</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for detailed info */}
              <Tabs defaultValue="blocks" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="blocks">Blocks</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="battles">Battles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blocks" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Block Collection ({profile.blocksOwned}/12)</h3>
                    <Badge variant="outline">
                      Total Value: ${profile.totalValue.toLocaleString()}
                    </Badge>
                  </div>
                  
                  {/* Rarity Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {profile.secretBlocksOwned > 0 && (
                      <Badge className="bg-yellow-500 text-black justify-center py-2">
                        🚀 {profile.secretBlocksOwned} Secret
                      </Badge>
                    )}
                    {profile.legendaryBlocksOwned > 0 && (
                      <Badge className="bg-orange-500 text-white justify-center py-2">
                        ⭐ {profile.legendaryBlocksOwned} Legendary
                      </Badge>
                    )}
                    {profile.epicBlocksOwned > 0 && (
                      <Badge className="bg-purple-500 text-white justify-center py-2">
                        💎 {profile.epicBlocksOwned} Epic
                      </Badge>
                    )}
                    {profile.rareBlocksOwned > 0 && (
                      <Badge className="bg-blue-500 text-white justify-center py-2">
                        💠 {profile.rareBlocksOwned} Rare
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.ownedBlocks.map((block) => (
                      <Card key={block.id} className="overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${getRarityColor(block.rarity)}`} />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="text-4xl w-12 h-12 flex items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${block.color}20` }}
                              >
                                {block.image}
                              </div>
                              <div>
                                <h4 className="font-semibold">{block.name}</h4>
                                <Badge className={getRarityBadgeColor(block.rarity)} variant="secondary">
                                  {block.rarity}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-bold text-green-600">{block.value} 💰</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Sword className="w-3 h-3 text-red-500" />
                              <span className="text-muted-foreground">Power:</span>
                              <span className="font-semibold">{block.power}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Shield className="w-3 h-3 text-blue-500" />
                              <span className="text-muted-foreground">Defense:</span>
                              <span className="font-semibold">{block.defense}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {profile.ownedBlocks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No blocks owned yet</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="stats" className="space-y-4">
                  <h3 className="text-lg font-semibold">Detailed Statistics</h3>
                  
                  <div className="grid gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="font-semibold">Economy</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Money</span>
                            <span className="font-semibold">${profile.money.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Money Per Minute</span>
                            <span className="font-semibold text-green-600">+${profile.moneyPerMinute}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Block Value</span>
                            <span className="font-semibold">${profile.totalValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coins</span>
                            <span className="font-semibold text-yellow-600">{profile.coins.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Combat Stats</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Attack Power</span>
                            <span className="font-semibold text-red-600">
                              {profile.attackPower}
                              {(profile.upgradeEffects?.attackPowerBonus || 0) > 0 && (
                                <span className="text-green-600 ml-1">
                                  (+{profile.upgradeEffects?.attackPowerBonus})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Defense Strength</span>
                            <span className="font-semibold text-blue-600">
                              {profile.defenseStrength}
                              {(profile.upgradeEffects?.defenseStrengthBonus || 0) > 0 && (
                                <span className="text-green-600 ml-1">
                                  (+{profile.upgradeEffects?.defenseStrengthBonus})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Steal Success Bonus</span>
                            <span className="font-semibold text-purple-600">
                              +{profile.upgradeEffects?.stealSuccessBonus || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Block Protection</span>
                            <span className="font-semibold text-orange-600">
                              +{profile.upgradeEffects?.blockProtectionBonus || 0}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">Progress</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Level</span>
                            <span className="font-semibold">{profile.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Experience</span>
                            <span className="font-semibold">{profile.experience} XP</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Global Rank</span>
                            <span className="font-semibold">#{profile.rank}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="battles" className="space-y-4">
                  <h3 className="text-lg font-semibold">Battle History</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-500 mb-2">
                          {profile.battlesWon}
                        </div>
                        <p className="text-sm text-muted-foreground">Victories</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-red-500 mb-2">
                          {profile.battlesLost}
                        </div>
                        <p className="text-sm text-muted-foreground">Defeats</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-2">
                          {totalBattles}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Battles</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                          <Target className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <div className="text-4xl font-bold mb-2">{profile.winRate}%</div>
                          <p className="text-muted-foreground">Overall Win Rate</p>
                        </div>
                        <Progress value={profile.winRate} className="h-3" />
                        <p className="text-sm text-muted-foreground">
                          {profile.winRate >= 70 ? '🔥 Dominating!' : 
                           profile.winRate >= 50 ? '⚔️ Strong Performance' :
                           profile.winRate >= 30 ? '💪 Getting Better' :
                           '📈 Keep Fighting!'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
