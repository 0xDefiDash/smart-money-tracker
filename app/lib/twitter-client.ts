
// Twitter API v2 Client
import fs from 'fs';
import path from 'path';

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  verified?: boolean;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
    cashtags?: Array<{ tag: string }>;
  };
}

interface TwitterApiResponse {
  data?: Tweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
  };
}

class TwitterClient {
  private baseUrl = 'https://api.twitter.com/2';
  private accessToken: string | null = null;
  
  private getAccessToken(): string {
    // Return cached token if available
    if (this.accessToken) {
      return this.accessToken;
    }

    // Try to get OAuth token from auth secrets file
    try {
      const authSecretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
      if (fs.existsSync(authSecretsPath)) {
        const authSecrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
        const token = authSecrets.twitter?.secrets?.access_token?.value;
        if (token && typeof token === 'string') {
          this.accessToken = token;
          return token;
        }
      }
    } catch (error) {
      console.error('Error reading OAuth token:', error);
    }

    // Fallback to environment variable if available
    const envToken = process.env.TWITTER_ACCESS_TOKEN;
    if (envToken) {
      this.accessToken = envToken;
      return envToken;
    }

    throw new Error('Twitter OAuth access token not configured');
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      const accessToken = this.getAccessToken();
      const cleanUsername = username.replace('@', '');
      
      const url = `${this.baseUrl}/users/by/username/${cleanUsername}?user.fields=profile_image_url,public_metrics,verified`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twitter API error for user ${username}:`, response.status, errorText);
        return null;
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserTweets(username: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    try {
      const accessToken = this.getAccessToken();
      const cleanUsername = username.replace('@', '');
      
      // First get user ID
      const user = await this.getUserByUsername(cleanUsername);
      if (!user) {
        console.error(`User ${username} not found`);
        throw new Error(`User ${username} not found`);
      }

      const url = `${this.baseUrl}/users/${user.id}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities&expansions=author_id&user.fields=profile_image_url,public_metrics,verified`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch tweets for ${username}:`, response.status, errorText);
        throw new Error(`Failed to fetch tweets: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      return { data: [] };
    }
  }

  async getMultipleUsersTweets(usernames: string[], maxResultsPerUser: number = 5): Promise<Map<string, TwitterApiResponse>> {
    const results = new Map<string, TwitterApiResponse>();
    
    for (const username of usernames) {
      try {
        const tweets = await this.getUserTweets(username, maxResultsPerUser);
        results.set(username, tweets);
      } catch (error) {
        console.error(`Error fetching tweets for ${username}:`, error);
        results.set(username, { data: [] });
      }
    }
    
    return results;
  }

  extractCoinsFromTweet(text: string): string[] {
    // Extract cashtags ($TOKEN) and common crypto mentions
    const coins: string[] = [];
    
    // Match $SYMBOL patterns
    const cashtags = text.match(/\$[A-Z]{2,10}/g);
    if (cashtags) {
      coins.push(...cashtags.map(tag => tag.substring(1)));
    }
    
    return [...new Set(coins)]; // Remove duplicates
  }

  extractTradingSignals(text: string): {
    action?: 'buy' | 'sell' | 'hold';
    priceTarget?: string;
    timeframe?: string;
    conviction?: 'high' | 'medium' | 'low';
    riskLevel?: 'high' | 'medium' | 'low';
  } {
    const lowerText = text.toLowerCase();
    const signals: any = {};

    // Extract action
    if (lowerText.includes('buy') || lowerText.includes('long') || lowerText.includes('accumulate')) {
      signals.action = 'buy';
    } else if (lowerText.includes('sell') || lowerText.includes('short') || lowerText.includes('exit')) {
      signals.action = 'sell';
    } else if (lowerText.includes('hold') || lowerText.includes('hodl')) {
      signals.action = 'hold';
    }

    // Extract price targets
    const priceMatch = text.match(/\$?(\d+[,.]?\d*[kKmMbB]?)/);
    if (priceMatch) {
      signals.priceTarget = priceMatch[0];
    }

    // Extract timeframe
    if (lowerText.includes('short term') || lowerText.includes('intraday') || lowerText.includes('today')) {
      signals.timeframe = 'short';
    } else if (lowerText.includes('medium term') || lowerText.includes('weeks') || lowerText.includes('this month')) {
      signals.timeframe = 'medium';
    } else if (lowerText.includes('long term') || lowerText.includes('months') || lowerText.includes('hodl')) {
      signals.timeframe = 'long';
    }

    // Extract conviction level
    if (lowerText.includes('100%') || lowerText.includes('very bullish') || lowerText.includes('extremely confident')) {
      signals.conviction = 'high';
    } else if (lowerText.includes('might') || lowerText.includes('maybe') || lowerText.includes('possibly')) {
      signals.conviction = 'low';
    } else {
      signals.conviction = 'medium';
    }

    // Extract risk level
    if (lowerText.includes('high risk') || lowerText.includes('degen') || lowerText.includes('gamble')) {
      signals.riskLevel = 'high';
    } else if (lowerText.includes('low risk') || lowerText.includes('safe') || lowerText.includes('blue chip')) {
      signals.riskLevel = 'low';
    } else {
      signals.riskLevel = 'medium';
    }

    return signals;
  }

  extractSentiment(text: string): {
    sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
    confidence: number;
    keywords: string[];
  } {
    const lowerText = text.toLowerCase();
    
    const bullishKeywords = ['moon', 'bullish', 'pump', 'rocket', 'ath', 'breakout', 'rally', 'surge', 'explode', 'parabolic', 'gains', 'profit', 'up', 'green'];
    const bearishKeywords = ['dump', 'bearish', 'crash', 'drop', 'fall', 'red', 'loss', 'down', 'sell', 'panic', 'fud'];
    
    const foundBullish = bullishKeywords.filter(kw => lowerText.includes(kw));
    const foundBearish = bearishKeywords.filter(kw => lowerText.includes(kw));
    
    const bullishScore = foundBullish.length;
    const bearishScore = foundBearish.length;
    const totalScore = bullishScore + bearishScore;
    
    let sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish' = 'neutral';
    let confidence = 0;
    
    if (bullishScore > bearishScore) {
      sentiment = bullishScore >= 3 ? 'very_bullish' : 'bullish';
      confidence = Math.min((bullishScore / (totalScore || 1)) * 100, 95);
    } else if (bearishScore > bullishScore) {
      sentiment = bearishScore >= 3 ? 'very_bearish' : 'bearish';
      confidence = Math.min((bearishScore / (totalScore || 1)) * 100, 95);
    } else {
      confidence = 50;
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence),
      keywords: [...foundBullish, ...foundBearish]
    };
  }

  extractTechnicalIndicators(text: string): {
    indicators: string[];
    levels: { type: string; value: string }[];
  } {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];
    const levels: { type: string; value: string }[] = [];

    // Common indicators
    const indicatorPatterns = ['rsi', 'macd', 'ema', 'sma', 'bollinger', 'fibonacci', 'ichimoku', 'stoch'];
    indicatorPatterns.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        indicators.push(indicator.toUpperCase());
      }
    });

    // Extract support/resistance levels
    const supportMatch = text.match(/support\s+(?:at\s+)?\$?(\d+[,.]?\d*[kKmM]?)/i);
    if (supportMatch) {
      levels.push({ type: 'support', value: supportMatch[1] });
    }

    const resistanceMatch = text.match(/resistance\s+(?:at\s+)?\$?(\d+[,.]?\d*[kKmM]?)/i);
    if (resistanceMatch) {
      levels.push({ type: 'resistance', value: resistanceMatch[1] });
    }

    return { indicators, levels };
  }

  categorizeTweet(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Priority-based categorization
    // Alerts (highest priority)
    if (lowerText.includes('🚨') || lowerText.includes('⚠️') || 
        lowerText.includes('alert') || lowerText.includes('breaking') || 
        lowerText.includes('urgent') || lowerText.includes('critical') ||
        lowerText.includes('announcement') || lowerText.includes('news')) {
      return 'alert';
    }
    
    // Alpha signals
    if (lowerText.includes('alpha') || lowerText.includes('gem') || 
        lowerText.includes('opportunity') || lowerText.includes('early') ||
        lowerText.includes('hidden') || lowerText.includes('undervalued') ||
        lowerText.includes('100x') || lowerText.includes('10x') ||
        lowerText.includes('insider')) {
      return 'alpha';
    }
    
    // Technical Analysis
    if (lowerText.includes('analysis') || lowerText.includes('technical') || 
        lowerText.includes('chart') || lowerText.includes('ta:') ||
        lowerText.includes('rsi') || lowerText.includes('macd') ||
        lowerText.includes('support') || lowerText.includes('resistance') ||
        lowerText.includes('fibonacci') || lowerText.includes('pattern')) {
      return 'analysis';
    }
    
    // Bullish sentiment
    if (lowerText.includes('bullish') || lowerText.includes('moon') || 
        lowerText.includes('pump') || lowerText.includes('🚀') ||
        lowerText.includes('green') || lowerText.includes('gains') ||
        lowerText.includes('breakout') || lowerText.includes('rally')) {
      return 'bullish';
    }
    
    // Bearish sentiment
    if (lowerText.includes('bearish') || lowerText.includes('dump') || 
        lowerText.includes('crash') || lowerText.includes('red') ||
        lowerText.includes('loss') || lowerText.includes('warning')) {
      return 'bearish';
    }
    
    return 'general';
  }

  extractAlertMetadata(text: string): {
    alertType: 'listing' | 'price' | 'whale' | 'news' | 'technical' | 'general';
    urgency: 'high' | 'medium' | 'low';
    actionable: boolean;
  } {
    const lowerText = text.toLowerCase();
    let alertType: 'listing' | 'price' | 'whale' | 'news' | 'technical' | 'general' = 'general';
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    let actionable = false;

    // Determine alert type
    if (lowerText.includes('listing') || lowerText.includes('exchange')) {
      alertType = 'listing';
      actionable = true;
    } else if (lowerText.includes('whale') || lowerText.includes('large transfer')) {
      alertType = 'whale';
    } else if (lowerText.includes('price') || lowerText.includes('ath') || lowerText.includes('atl')) {
      alertType = 'price';
    } else if (lowerText.includes('technical') || lowerText.includes('breakout') || lowerText.includes('breakdown')) {
      alertType = 'technical';
      actionable = true;
    } else if (lowerText.includes('news') || lowerText.includes('announcement') || lowerText.includes('partnership')) {
      alertType = 'news';
    }

    // Determine urgency
    if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('now') || lowerText.includes('immediate')) {
      urgency = 'high';
      actionable = true;
    } else if (lowerText.includes('soon') || lowerText.includes('upcoming') || lowerText.includes('watch')) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    return { alertType, urgency, actionable };
  }
}

export const twitterClient = new TwitterClient();
export type { TwitterUser, Tweet, TwitterApiResponse };
