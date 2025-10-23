
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Repeat2, MessageCircle, ExternalLink, AlertTriangle, Bell, TrendingUp, Clock, Zap, Activity } from 'lucide-react';

interface DetailedAlertCardProps {
  tweet: {
    id: string;
    author: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    replies: number;
    category: string;
    coins: string[];
    metadata?: {
      alertMetadata?: {
        alertType: 'listing' | 'price' | 'whale' | 'news' | 'technical' | 'general';
        urgency: 'high' | 'medium' | 'low';
        actionable: boolean;
      };
    };
  };
}

export default function DetailedAlertCard({ tweet }: DetailedAlertCardProps) {
  const { metadata } = tweet;
  const alertData = metadata?.alertMetadata;

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAlertTypeIcon = (type?: string) => {
    switch (type) {
      case 'listing': return <TrendingUp className="h-4 w-4" />;
      case 'price': return <Activity className="h-4 w-4" />;
      case 'whale': return <Zap className="h-4 w-4" />;
      case 'news': return <Bell className="h-4 w-4" />;
      case 'technical': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type?: string) => {
    switch (type) {
      case 'listing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'price': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'whale': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'news': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'technical': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-yellow-900/20 to-red-900/20 border-yellow-500/30 hover:border-yellow-500/50 transition-all ${alertData?.urgency === 'high' ? 'ring-2 ring-red-500/50' : ''}`}>
      <CardContent className="p-5">
        {/* Header with Urgency Indicator */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className={`h-12 w-12 border-2 ${alertData?.urgency === 'high' ? 'border-red-500 ring-2 ring-red-500/30' : 'border-yellow-500 ring-2 ring-yellow-500/30'}`}>
            <AvatarImage src={tweet.avatar} alt={tweet.author} />
            <AvatarFallback>{tweet.author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-white">{tweet.author}</span>
              <span className="text-xs text-gray-400">@{tweet.username}</span>
              <span className="text-xs text-gray-500">• {tweet.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs ${getUrgencyColor(alertData?.urgency)}`}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alertData?.urgency?.toUpperCase() || 'MEDIUM'} URGENCY
              </Badge>
              {alertData?.actionable && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Actionable
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap font-medium">{tweet.content}</p>

        {/* Alert Details Panel */}
        {alertData && (
          <div className={`mb-4 p-3 rounded-lg border ${alertData.urgency === 'high' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">Alert Details</span>
              </div>
              <Clock className="h-3 w-3 text-gray-400" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className={`text-xs ${getAlertTypeColor(alertData.alertType)}`}>
                {getAlertTypeIcon(alertData.alertType)}
                <span className="ml-1.5">{alertData.alertType.toUpperCase()} ALERT</span>
              </Badge>
              {alertData.urgency === 'high' && (
                <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-pulse" />
                  IMMEDIATE ACTION REQUIRED
                </span>
              )}
            </div>
          </div>
        )}

        {/* Coin Tags */}
        {tweet.coins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tweet.coins.map((coin) => (
              <Badge key={coin} variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-mono font-bold">
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Tweet Actions */}
        <div className="flex items-center gap-6 text-gray-400 text-sm pt-3 border-t border-yellow-500/20">
          <div className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer">
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-pointer">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.retweets.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.replies}</span>
          </div>
          <a 
            href={`https://x.com/${tweet.username}/status/${tweet.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 hover:text-yellow-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
