
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Twitter, Send, Eye, TrendingUp, Bell, BarChart3, Fish } from 'lucide-react';

export default function SocialMediaPage() {
  const [tweetText, setTweetText] = useState('');
  const [tweetType, setTweetType] = useState('custom');
  const [isPosting, setIsPosting] = useState(false);
  const [lastPostedTweet, setLastPostedTweet] = useState<any>(null);

  const tweetTemplates = {
    'whale-alert': {
      name: 'Whale Alert',
      icon: Fish,
      data: {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        amount: '1,500',
        token: 'ETH',
        usdValue: '$7.7M',
        type: 'buy' as const,
        chain: 'Ethereum'
      }
    },
    'market-update': {
      name: 'Market Update',
      icon: TrendingUp,
      data: {
        token: 'BTC',
        price: '$132,850',
        change24h: '+5.3%',
        sentiment: 'bullish' as const
      }
    },
    'trending-token': {
      name: 'Trending Token',
      icon: TrendingUp,
      data: {
        token: 'PEPE',
        price: '$0.00001234',
        change: '+45.2%',
        volume: '$125M',
        reason: 'Massive whale accumulation detected!'
      }
    },
    'daily-report': {
      name: 'Daily Report',
      icon: BarChart3,
      data: {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalWhaleTransactions: 247,
        topMovers: [
          { token: 'BTC', change: '+12.5%' },
          { token: 'ETH', change: '+8.3%' },
          { token: 'SOL', change: '+15.7%' }
        ],
        marketSentiment: 'Bullish'
      }
    },
    'platform-feature': {
      name: 'Platform Feature',
      icon: Bell,
      data: {
        feature: 'whale-tracker'
      }
    }
  };

  const generatePreview = async () => {
    if (tweetType === 'custom') {
      return;
    }

    try {
      const template = tweetTemplates[tweetType as keyof typeof tweetTemplates];
      const response = await fetch('/api/twitter/auto-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: tweetType,
          eventData: template.data,
          autoPost: false
        })
      });

      const result = await response.json();
      if (result.tweets && result.tweets[0]) {
        setTweetText(result.tweets[0].text);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const postTweet = async () => {
    if (!tweetText.trim()) {
      toast.error('Please enter tweet text');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tweetText
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Tweet posted successfully!');
        setLastPostedTweet(result);
        setTweetText('');
      } else {
        toast.error(`Failed to post tweet: ${result.error}`);
      }
    } catch (error) {
      console.error('Error posting tweet:', error);
      toast.error('Failed to post tweet');
    } finally {
      setIsPosting(false);
    }
  };

  const testTwitterConnection = async () => {
    try {
      const response = await fetch('/api/twitter/test-post');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Twitter connection is working!');
      } else {
        toast.error('Twitter connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-primary">
              Social Media Manager
            </h1>
            <p className="text-terminal-gray">
              Post updates to @Defidash_Agent on X (Twitter)
            </p>
          </div>
          <Button
            onClick={testTwitterConnection}
            variant="outline"
            className="gap-2"
          >
            <Twitter className="h-4 w-4" />
            Test Connection
          </Button>
        </div>

        {/* Account Info */}
        <Card className="border-primary/20 bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Twitter className="h-5 w-5" />
              Connected Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-primary text-primary">
                @Defidash_Agent
              </Badge>
              <span className="text-terminal-gray">
                Ready to post
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Posting Interface */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Compose */}
          <Card className="border-primary/20 bg-background">
            <CardHeader>
              <CardTitle className="text-primary">
                Compose Tweet
              </CardTitle>
              <CardDescription>
                Create and post tweets to your X account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tweet Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  Tweet Type
                </label>
                <Select
                  value={tweetType}
                  onValueChange={(value) => {
                    setTweetType(value);
                    if (value !== 'custom') {
                      generatePreview();
                    } else {
                      setTweetText('');
                    }
                  }}
                >
                  <SelectTrigger className="border-white/10 bg-background text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-background">
                    <SelectItem value="custom">Custom Tweet</SelectItem>
                    <SelectItem value="whale-alert">🐋 Whale Alert</SelectItem>
                    <SelectItem value="market-update">📈 Market Update</SelectItem>
                    <SelectItem value="trending-token">🔥 Trending Token</SelectItem>
                    <SelectItem value="daily-report">📊 Daily Report</SelectItem>
                    <SelectItem value="platform-feature">✨ Platform Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tweet Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-primary">
                    Tweet Content
                  </label>
                  <span className={`text-sm ${tweetText.length > 280 ? 'text-red-500' : 'text-terminal-gray'}`}>
                    {tweetText.length} / 280
                  </span>
                </div>
                <Textarea
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="What's happening in crypto?"
                  className="min-h-[200px] border-white/10 bg-background font-mono text-primary placeholder:text-terminal-gray/50"
                  maxLength={280}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={postTweet}
                  disabled={isPosting || !tweetText.trim() || tweetText.length > 280}
                  className="flex-1 gap-2 bg-primary text-black hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                  {isPosting ? 'Posting...' : 'Post Tweet'}
                </Button>
                {tweetType !== 'custom' && (
                  <Button
                    onClick={generatePreview}
                    variant="outline"
                    className="gap-2 border-white/10 text-primary"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Templates & Last Posted */}
          <div className="space-y-6">
            {/* Tweet Templates */}
            <Card className="border-primary/20 bg-background">
              <CardHeader>
                <CardTitle className="text-primary">
                  Quick Templates
                </CardTitle>
                <CardDescription>
                  Click a template to generate a tweet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {Object.entries(tweetTemplates).map(([key, template]) => {
                    const Icon = template.icon;
                    return (
                      <Button
                        key={key}
                        onClick={() => {
                          setTweetType(key);
                          generatePreview();
                        }}
                        variant="outline"
                        className="justify-start gap-2 border-white/10 text-primary hover:bg-primary/10"
                      >
                        <Icon className="h-4 w-4" />
                        {template.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Last Posted Tweet */}
            {lastPostedTweet && (
              <Card className="border-primary/20 bg-background">
                <CardHeader>
                  <CardTitle className="text-primary">
                    Last Posted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap font-mono text-sm text-primary">
                      {lastPostedTweet.text}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-primary text-primary">
                        ID: {lastPostedTweet.tweetId}
                      </Badge>
                      <a
                        href={`https://twitter.com/Defidash_Agent/status/${lastPostedTweet.tweetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline"
                      >
                        View on X
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Usage Guide */}
        <Card className="border-primary/20 bg-background">
          <CardHeader>
            <CardTitle className="text-primary">
              Usage Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-terminal-gray">
            <p>• Select a template or write a custom tweet</p>
            <p>• Templates auto-generate content with current data</p>
            <p>• Maximum tweet length is 280 characters</p>
            <p>• All tweets will be posted to @Defidash_Agent</p>
            <p>• Use trending hashtags for better reach</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
