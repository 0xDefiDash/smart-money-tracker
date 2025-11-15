
// Twitter API v2 Client with OAuth 1.0a posting support
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

interface TwitterCredentials {
  apiKey: string;
  apiKeySecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
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
  private credentials: TwitterCredentials | null = null;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000; // Minimum 1 second between requests
  private rateLimitRemaining: number = 180;
  private rateLimitReset: number = 0;
  
  private getCredentials(): TwitterCredentials {
    // Return cached credentials if available
    if (this.credentials) {
      return this.credentials;
    }

    // Try to get OAuth credentials from auth secrets file
    try {
      const authSecretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
      if (fs.existsSync(authSecretsPath)) {
        const authSecrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
        
        // Try "x (twitter)" first, then fallback to "twitter"
        const twitterData = authSecrets['x (twitter)'] || authSecrets.twitter;
        
        if (twitterData?.secrets) {
          const secrets = twitterData.secrets;
          this.credentials = {
            apiKey: secrets.api_key?.value || '',
            apiKeySecret: secrets.api_key_secret?.value || '',
            accessToken: secrets.access_token?.value || '',
            accessTokenSecret: secrets.access_token_secret?.value || '',
            bearerToken: secrets.bearer_token?.value || ''
          };
          console.log('✅ Twitter OAuth credentials loaded successfully');
          return this.credentials;
        }
      }
    } catch (error) {
      console.error('Error reading OAuth credentials:', error);
    }

    throw new Error('Twitter OAuth credentials not configured. Please authenticate with Twitter.');
  }
  
  private getAccessToken(): string {
    const creds = this.getCredentials();
    return creds.bearerToken;
  }

  // OAuth 1.0a signature generation for posting tweets
  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>
  ): string {
    const creds = this.getCredentials();
    
    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams)
    ].join('&');

    // Create signing key
    const signingKey = `${this.percentEncode(creds.apiKeySecret)}&${this.percentEncode(creds.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64');

    return signature;
  }

  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  private generateOAuthHeader(
    method: string,
    url: string,
    additionalParams: Record<string, string> = {}
  ): string {
    const creds = this.getCredentials();
    
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: creds.apiKey,
      oauth_token: creds.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(32).toString('base64').replace(/\W/g, ''),
      oauth_version: '1.0'
    };

    // Combine OAuth params with additional params for signature
    const allParams = { ...oauthParams, ...additionalParams };

    // Generate signature
    const signature = this.generateOAuthSignature(method, url, allParams);
    oauthParams.oauth_signature = signature;

    // Build OAuth header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .sort()
      .map(key => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
      .join(', ');

    return authHeader;
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private updateRateLimitInfo(headers: Headers): void {
    const remaining = headers.get('x-rate-limit-remaining');
    const reset = headers.get('x-rate-limit-reset');
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset) * 1000;
  }

  private async handleRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 1 && this.rateLimitReset > Date.now()) {
      const waitTime = this.rateLimitReset - Date.now();
      console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      await this.handleRateLimit();
      await this.rateLimitDelay();
      
      const accessToken = this.getAccessToken();
      const cleanUsername = username.replace('@', '');
      
      const url = `${this.baseUrl}/users/by/username/${cleanUsername}?user.fields=profile_image_url,public_metrics,verified`;
      
      console.log(`🔍 Fetching user info for @${cleanUsername}...`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      this.updateRateLimitInfo(response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Twitter API error for user ${username}:`, response.status, errorText);
        
        if (response.status === 429) {
          console.error('⚠️ Rate limit exceeded. Please wait before making more requests.');
        }
        
        return null;
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched user @${cleanUsername}`);
      return data.data || null;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }
  }

  async getUserTweets(username: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    try {
      await this.handleRateLimit();
      await this.rateLimitDelay();
      
      const accessToken = this.getAccessToken();
      const cleanUsername = username.replace('@', '');
      
      // First get user ID
      const user = await this.getUserByUsername(cleanUsername);
      if (!user) {
        console.error(`❌ User ${username} not found`);
        return { data: [] };
      }

      console.log(`📱 Fetching ${maxResults} tweets from @${cleanUsername}...`);

      const url = `${this.baseUrl}/users/${user.id}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities&expansions=author_id&user.fields=profile_image_url,public_metrics,verified`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      this.updateRateLimitInfo(response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to fetch tweets for ${username}:`, response.status, errorText);
        
        if (response.status === 429) {
          console.error('⚠️ Rate limit exceeded. Using cached data.');
        }
        
        return { data: [] };
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.data?.length || 0} tweets from @${cleanUsername}`);
      console.log(`📊 Rate limit remaining: ${this.rateLimitRemaining}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching tweets:', error);
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

  // Post a tweet using OAuth 1.0a
  async postTweet(text: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    try {
      await this.rateLimitDelay();

      const url = `${this.baseUrl}/tweets`;
      const authHeader = this.generateOAuthHeader('POST', url);

      console.log(`🐦 Posting tweet: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to post tweet:`, response.status, errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      console.log(`✅ Tweet posted successfully! ID: ${data.data?.id}`);
      return { success: true, tweetId: data.data?.id };
    } catch (error) {
      console.error('❌ Error posting tweet:', error);
      return { success: false, error: String(error) };
    }
  }

  // Helper methods for creating different types of tweets

  createWhaleAlertTweet(data: {
    address: string;
    amount: string;
    token: string;
    usdValue: string;
    type: 'buy' | 'sell' | 'transfer';
    chain: string;
  }): string {
    const emoji = data.type === 'buy' ? '🟢' : data.type === 'sell' ? '🔴' : '🔄';
    const action = data.type === 'buy' ? 'bought' : data.type === 'sell' ? 'sold' : 'transferred';
    
    return `🐋 WHALE ALERT ${emoji}

${data.amount} $${data.token} ${action}
💰 Value: ${data.usdValue}
⛓️ Chain: ${data.chain}
📍 ${data.address.substring(0, 10)}...

Track whale activity: https://defidashtracker.com/whale-tracker

#Crypto #WhaleAlert #${data.token}`;
  }

  createMarketUpdateTweet(data: {
    token: string;
    price: string;
    change24h: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
  }): string {
    const emoji = data.sentiment === 'bullish' ? '🚀' : data.sentiment === 'bearish' ? '📉' : '➡️';
    const changeEmoji = parseFloat(data.change24h) > 0 ? '📈' : '📉';
    
    return `${emoji} ${data.token} Market Update

💵 Price: ${data.price}
${changeEmoji} 24h: ${data.change24h}
📊 Sentiment: ${data.sentiment.toUpperCase()}

Get real-time market insights: https://defidashtracker.com

#Crypto #${data.token} #MarketUpdate`;
  }

  createAlertTweet(data: {
    title: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
  }): string {
    const emoji = data.urgency === 'high' ? '🚨' : data.urgency === 'medium' ? '⚠️' : 'ℹ️';
    
    return `${emoji} ${data.title}

${data.description}

Stay ahead with DeFiDash alerts: https://defidashtracker.com/alerts

#DeFi #CryptoAlert #SmartMoney`;
  }

  createPlatformFeatureTweet(feature: string): string {
    const features: Record<string, { emoji: string; description: string; hashtags: string[] }> = {
      'whale-tracker': {
        emoji: '🐋',
        description: 'Track whale movements across multiple chains in real-time. Get instant alerts when smart money moves.',
        hashtags: ['WhaleTracking', 'SmartMoney', 'Crypto']
      },
      'wallet-monitor': {
        emoji: '👀',
        description: 'Monitor any wallet address. Get notified of all transactions, token transfers, and balance changes.',
        hashtags: ['WalletTracking', 'DeFi', 'Crypto']
      },
      'market-insights': {
        emoji: '📊',
        description: 'AI-powered market analysis with live price feeds, sentiment analysis, and trading signals.',
        hashtags: ['CryptoTrading', 'MarketAnalysis', 'AI']
      },
      'telegram-alerts': {
        emoji: '📱',
        description: 'Get instant Telegram notifications for whale movements, price changes, and custom alerts.',
        hashtags: ['TelegramBot', 'CryptoAlerts', 'DeFi']
      }
    };

    const info = features[feature] || {
      emoji: '✨',
      description: 'Discover powerful tools for crypto tracking and analysis.',
      hashtags: ['Crypto', 'DeFi', 'Trading']
    };

    return `${info.emoji} DeFiDash Feature

${info.description}

Try it now: https://defidashtracker.com

${info.hashtags.map(tag => `#${tag}`).join(' ')}`;
  }

  createDailyReportTweet(data: {
    date: string;
    totalWhaleTransactions: number;
    topMovers: Array<{ token: string; change: string }>;
    marketSentiment: string;
  }): string {
    const topMoversText = data.topMovers
      .slice(0, 3)
      .map(m => `• $${m.token}: ${m.change}`)
      .join('\n');

    return `📊 Daily Crypto Report - ${data.date}

🐋 Whale Transactions: ${data.totalWhaleTransactions}
📈 Top Movers:
${topMoversText}

📌 Market Sentiment: ${data.marketSentiment}

Full report: https://defidashtracker.com

#Crypto #DailyReport #DeFi`;
  }

  createTrendingTokenTweet(data: {
    token: string;
    price: string;
    change: string;
    volume: string;
    reason: string;
  }): string {
    return `🔥 TRENDING NOW: $${data.token}

💵 Price: ${data.price}
📈 Change: ${data.change}
💰 Volume: ${data.volume}

${data.reason}

Track trending tokens: https://defidashtracker.com

#Crypto #${data.token} #Trending`;
  }
}

export const twitterClient = new TwitterClient();
export type { TwitterUser, Tweet, TwitterApiResponse };
