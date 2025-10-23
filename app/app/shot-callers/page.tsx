
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, MessageCircle, Heart, Repeat2, ExternalLink, Target, Activity, Flame, Users, Zap, RefreshCw, Database, Wallet, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TokenCallsSection from '@/components/shot-callers/TokenCallsSection';
import EnhancedTweetCard from '@/components/shot-callers/EnhancedTweetCard';
import DetailedAlphaCard from '@/components/shot-callers/DetailedAlphaCard';
import DetailedAlertCard from '@/components/shot-callers/DetailedAlertCard';
import DetailedAnalysisCard from '@/components/shot-callers/DetailedAnalysisCard';
import DetailedBullishCard from '@/components/shot-callers/DetailedBullishCard';
import { useWeb3 } from '@/lib/web3-provider';

// Top Crypto KOLs data
const topKOLs = [
  {
    id: '1',
    username: 'elonmusk',
    displayName: 'Elon Musk',
    avatar: '/Uploads/Trump.jpg',
    followers: '170M',
    category: 'Influencer',
    influence: 100,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @elonmusk',
    isTracked: true
  },
  {
    id: '2',
    username: '100xDarren',
    displayName: '100x Darren',
    avatar: '/Uploads/100xdarren.jpg',
    followers: '500K',
    category: 'Trader',
    influence: 98,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @100xDarren',
    isTracked: true
  },
  {
    id: '3',
    username: 'cz_binance',
    displayName: 'CZ Binance',
    avatar: '/Uploads/QngrqCSC_400x400.jpg',
    followers: '10M',
    category: 'Influencer',
    influence: 99,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @cz_binance',
    isTracked: true
  },
  {
    id: '4',
    username: 'four_meme_',
    displayName: 'Four',
    avatar: '/Uploads/UPaVddbm_400x400.jpg',
    followers: '350K',
    category: 'Meme Expert',
    influence: 94,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @four_meme_',
    isTracked: true
  },
  {
    id: '5',
    username: 'BullRunGravano',
    displayName: 'Bull Run Gravano',
    avatar: '/Uploads/bullrun Gravano.jpg',
    followers: '300K',
    category: 'Analyst',
    influence: 95,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @BullRunGravano',
    isTracked: true
  },
  {
    id: '6',
    username: 'JamesWynnReal',
    displayName: 'James Wynn',
    avatar: '/Uploads/James wynn.jpg',
    followers: '250K',
    category: 'Trader',
    influence: 92,
    recentAlpha: '🔴 LIVE TRACKED: Real-time alpha from @JamesWynnReal',
    isTracked: true
  },
  {
    id: '7',
    username: 'CryptoExpert101',
    displayName: 'Crypto Expert',
    avatar: '/Uploads/cryptoExpert101.jpg',
    followers: '400K',
    category: 'Educator',
    influence: 90,
    recentAlpha: '🔴 LIVE TRACKED: Real-time tweets from @CryptoExpert101',
    isTracked: true
  },
  {
    id: '8',
    username: '0xPoet',
    displayName: '0xPoet',
    avatar: '/Uploads/oxpoet.jpg',
    followers: '180K',
    category: 'Developer',
    influence: 88,
    recentAlpha: 'New DeFi protocol launching - audited contracts'
  },
  {
    id: '9',
    username: '0xSweep',
    displayName: '0xSweep',
    avatar: '/Uploads/0xsweep.jpg',
    followers: '220K',
    category: 'Trader',
    influence: 85,
    recentAlpha: 'NFT floor sweep on blue chips incoming'
  },
  {
    id: '10',
    username: 'Wendyy',
    displayName: 'Wendy O',
    avatar: '/Uploads/wendy.jpg',
    followers: '350K',
    category: 'Influencer',
    influence: 87,
    recentAlpha: 'Market sentiment turning bullish - accumulation zone'
  }
];

// Mock tweets data
const mockTweets = [
  {
    id: '1',
    author: '100x Darren',
    username: '100xDarren',
    avatar: '/Uploads/100xdarren.jpg',
    content: '🚨 BREAKING: Just spotted massive whale accumulation on $SOL. 50M+ tokens moved from exchanges in the last 24h. This is what smart money does before major moves. 👀\n\n#Solana #Crypto #TradingAlpha',
    timestamp: '2m ago',
    likes: 2400,
    retweets: 890,
    replies: 156,
    category: 'bullish',
    coins: ['SOL']
  },
  {
    id: '2',
    author: 'Bull Run Gravano',
    username: 'BullRunGravano',
    avatar: '/Uploads/bullrun Gravano.jpg',
    content: 'Alt season is here! My top 5 picks for 100x:\n\n1. $TOKEN1 - DeFi innovator\n2. $TOKEN2 - Gaming platform\n3. $TOKEN3 - Layer 2 solution\n4. $TOKEN4 - AI integration\n5. $TOKEN5 - Real world assets\n\nNFA, DYOR 🚀',
    timestamp: '15m ago',
    likes: 5600,
    retweets: 1200,
    replies: 340,
    category: 'alpha',
    coins: ['TOKEN1', 'TOKEN2', 'TOKEN3']
  },
  {
    id: '3',
    author: 'James Wynn',
    username: 'JamesWynn',
    avatar: '/Uploads/James wynn.jpg',
    content: '⚠️ CRITICAL: Major exchange listing announcement in 2 hours. Get ready for volatility. Smart money is positioning now.\n\n#CryptoAlert #Trading',
    timestamp: '30m ago',
    likes: 3200,
    retweets: 670,
    replies: 89,
    category: 'alert',
    coins: []
  },
  {
    id: '4',
    author: 'Crypto Expert',
    username: 'CryptoExpert101',
    avatar: '/Uploads/cryptoExpert101.jpg',
    content: '📊 Technical Analysis Update:\n\nBTC: Bullish pennant forming on 4H\nETH: Breaking resistance at $3.2K\nSOL: Consolidating before next leg up\n\nTarget: BTC $75K by month end\n\n#Bitcoin #Ethereum #TechnicalAnalysis',
    timestamp: '1h ago',
    likes: 4100,
    retweets: 980,
    replies: 234,
    category: 'analysis',
    coins: ['BTC', 'ETH', 'SOL']
  },
  {
    id: '5',
    author: '0xPoet',
    username: '0xPoet',
    avatar: '/Uploads/oxpoet.jpg',
    content: '🔥 New DeFi protocol dropping tomorrow! Audited by top firms, innovative tokenomics, backed by major VCs. This could be the next 1000x gem.\n\nWhitelist spots still available. Link in bio 👇\n\n#DeFi #Crypto',
    timestamp: '2h ago',
    likes: 2800,
    retweets: 1400,
    replies: 567,
    category: 'alpha',
    coins: []
  },
  {
    id: '6',
    author: 'Wendy O',
    username: 'Wendyy',
    avatar: '/Uploads/wendy.jpg',
    content: 'Market sentiment check:\n\n✅ Fear & Greed: 65 (Greed)\n✅ BTC dominance: Declining\n✅ Alt volume: Increasing\n✅ Whale activity: High\n\nThis is textbook alt season setup. Time to position! 📈\n\n#Crypto #AltSeason',
    timestamp: '3h ago',
    likes: 6700,
    retweets: 1890,
    replies: 445,
    category: 'bullish',
    coins: ['BTC']
  },
  {
    id: '7',
    author: '0xSweep',
    username: '0xSweep',
    avatar: '/Uploads/0xsweep.jpg',
    content: 'Floor sweep complete! 🧹\n\nJust picked up 15 blue chip NFTs at 30% discount. Panic sellers are my favorite exit liquidity providers 😎\n\n#NFT #CryptoArt',
    timestamp: '4h ago',
    likes: 1900,
    retweets: 450,
    replies: 123,
    category: 'alpha',
    coins: []
  },
  {
    id: '8',
    author: 'Four',
    username: 'four_meme_',
    avatar: '/Uploads/UPaVddbm_400x400.jpg',
    content: '📉 Red flags everywhere:\n\n⚠️ Volume declining\n⚠️ RSI extremely overbought\n⚠️ Whales moving to stables\n⚠️ Funding rates negative\n\nTaking profits and moving to sidelines. Risk management > FOMO\n\n#Trading #RiskManagement',
    timestamp: '5h ago',
    likes: 3400,
    retweets: 890,
    replies: 256,
    category: 'bearish',
    coins: ['BTC', 'ETH']
  }
];

export default function ShotCallersPage() {
  const router = useRouter();
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [tweets, setTweets] = useState(mockTweets);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [kolWallets, setKolWallets] = useState<Record<string, any>>({});

  // Seed KOL wallets on mount
  useEffect(() => {
    const seedWallets = async () => {
      try {
        const response = await fetch('/api/shot-callers/kols/wallets/seed', {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          const walletsMap: Record<string, any> = {};
          data.wallets.forEach((wallet: any) => {
            walletsMap[wallet.kolUsername] = wallet;
          });
          setKolWallets(walletsMap);
        }
      } catch (error) {
        console.error('Error seeding wallets:', error);
      }
    };
    seedWallets();
  }, []);

  // Fetch live tweets from tracked accounts
  const fetchLiveTweets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shot-callers/feed?limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets);
          setLastUpdate(new Date());
          toast.success(`Loaded ${data.tweets.length} fresh tweets from ${data.tracked_accounts.join(', ')}`);
        } else {
          toast.info('No new tweets available. Showing sample data.');
        }
      } else {
        console.error('Failed to fetch tweets');
        toast.error('Failed to load live tweets. Showing sample data.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Error loading tweets. Showing sample data.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh tweets every 5 minutes
  useEffect(() => {
    fetchLiveTweets();
    const interval = setInterval(fetchLiveTweets, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'bullish': 'bg-green-500/10 text-green-500 border-green-500/20',
      'bearish': 'bg-red-500/10 text-red-500 border-red-500/20',
      'alpha': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'alert': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'analysis': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getInfluenceColor = (influence: number) => {
    if (influence >= 95) return 'text-yellow-500';
    if (influence >= 90) return 'text-orange-500';
    if (influence >= 85) return 'text-blue-500';
    return 'text-gray-500';
  };

  const filteredTweets = activeTab === 'all' 
    ? tweets 
    : tweets.filter(tweet => tweet.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Target className="h-10 w-10 text-purple-500" />
            <Flame className="h-5 w-5 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              Shot Callers
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-gray-400 text-sm md:text-base">Track Top Crypto KOLs for Real-Time Trading Alpha</p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Activity className="h-2 w-2 mr-1 animate-pulse" />
                Tracking 7 KOLs
              </Badge>
            </div>
          </div>
          {/* Wallet Connection */}
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-2">
                <DollarSign className="h-4 w-4 mr-1" />
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Active KOLs</p>
                  <p className="text-2xl font-bold text-purple-400">{topKOLs.length}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Alpha Signals</p>
                  <p className="text-2xl font-bold text-pink-400">24</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Reach</p>
                  <p className="text-2xl font-bold text-blue-400">172M</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Hot Takes</p>
                  <p className="text-2xl font-bold text-orange-400">156</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLs List */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Top Shot Callers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3">
                {topKOLs.map((kol) => (
                  <Card
                    key={kol.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedKOL === kol.id
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                    } ${(kol as any).isTracked ? 'ring-1 ring-green-500/30' : ''}`}
                    onClick={() => {
                      if ((kol as any).isTracked) {
                        router.push(`/shot-callers/${kol.username}`);
                      } else {
                        setSelectedKOL(kol.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className={`h-12 w-12 border-2 ${(kol as any).isTracked ? 'border-green-500 ring-2 ring-green-500/30' : 'border-purple-500/50'}`}>
                          <AvatarImage src={kol.avatar} alt={kol.displayName} />
                          <AvatarFallback>{kol.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white truncate">{kol.displayName}</h3>
                            <div className={`flex items-center gap-1 ${getInfluenceColor(kol.influence)}`}>
                              <Zap className="h-3 w-3" />
                              <span className="text-xs font-bold">{kol.influence}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <a 
                              href={`https://x.com/${kol.username}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              @{kol.username}
                            </a>
                            {(kol as any).isTracked && (
                              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                <Activity className="h-2 w-2 mr-1 animate-pulse" />
                                LIVE • Click to view
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {kol.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Users className="h-3 w-3" />
                              {kol.followers}
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 line-clamp-2">{kol.recentAlpha}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tweets Feed */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 mb-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Live Alpha Feed
                </CardTitle>
                {lastUpdate && (
                  <p className="text-xs text-gray-400">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={fetchLiveTweets}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-6 w-full bg-slate-800/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="bullish">Bullish</TabsTrigger>
                <TabsTrigger value="alpha">Alpha</TabsTrigger>
                <TabsTrigger value="alert">Alerts</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="bearish">Bearish</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <Card key={tweet.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                        <CardContent className="p-4">
                          {/* Tweet Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={tweet.avatar} alt={tweet.author} />
                              <AvatarFallback>{tweet.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{tweet.author}</span>
                                <span className="text-xs text-gray-400">@{tweet.username}</span>
                                <span className="text-xs text-gray-500">• {tweet.timestamp}</span>
                              </div>
                              <Badge className={`text-xs ${getCategoryColor(tweet.category)}`}>
                                {tweet.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Tweet Content */}
                          <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{tweet.content}</p>

                          {/* Coin Tags */}
                          {tweet.coins.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tweet.coins.map((coin) => (
                                <Badge key={coin} variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                  ${coin}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Tweet Actions */}
                          <div className="flex items-center gap-6 text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Heart className="h-4 w-4 text-pink-500" />
                              <span className="text-xs">{tweet.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Repeat2 className="h-4 w-4 text-green-500" />
                              <span className="text-xs">{tweet.retweets.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4 text-blue-500" />
                              <span className="text-xs">{tweet.replies}</span>
                            </div>
                            <a 
                              href={`https://x.com/${tweet.username}/status/${tweet.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto flex items-center gap-1.5 hover:text-purple-500 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-xs">View on X</span>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bullish" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <DetailedBullishCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="alpha" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <DetailedAlphaCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="alert" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <DetailedAlertCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <DetailedAnalysisCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bearish" className="mt-4">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <Card key={tweet.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={tweet.avatar} alt={tweet.author} />
                              <AvatarFallback>{tweet.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{tweet.author}</span>
                                <span className="text-xs text-gray-400">@{tweet.username}</span>
                                <span className="text-xs text-gray-500">• {tweet.timestamp}</span>
                              </div>
                              <Badge className={`text-xs ${getCategoryColor(tweet.category)}`}>
                                {tweet.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{tweet.content}</p>
                          {tweet.coins.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tweet.coins.map((coin) => (
                                <Badge key={coin} variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                  ${coin}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-6 text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Heart className="h-4 w-4 text-pink-500" />
                              <span className="text-xs">{tweet.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Repeat2 className="h-4 w-4 text-green-500" />
                              <span className="text-xs">{tweet.retweets.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4 text-blue-500" />
                              <span className="text-xs">{tweet.replies}</span>
                            </div>
                            <a 
                              href={`https://x.com/${tweet.username}/status/${tweet.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto flex items-center gap-1.5 hover:text-purple-500 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-xs">View on X</span>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Compact Token Calls Section */}
      <div className="mt-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Token Calls Tracker
              </CardTitle>
              <Button
                onClick={async () => {
                  toast.loading('Syncing token calls from Twitter...', { id: 'sync' });
                  try {
                    const response = await fetch('/api/shot-callers/sync', {
                      method: 'POST'
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                      toast.success(
                        `Synced ${data.processed} tweets and created ${data.tokenCallsCreated} token calls`,
                        { id: 'sync' }
                      );
                      // Refresh the token calls section
                      window.location.reload();
                    } else {
                      toast.error('Failed to sync token calls', { id: 'sync' });
                    }
                  } catch (error) {
                    toast.error('Error syncing token calls', { id: 'sync' });
                  }
                }}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Database className="h-3 w-3 mr-1" />
                Sync
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TokenCallsSection />
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
        size="icon"
        onClick={fetchLiveTweets}
      >
        <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
