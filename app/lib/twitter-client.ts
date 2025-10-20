
// Twitter API v2 Client
import crypto from 'crypto';

const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || '';

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
  
  private generateBearerToken(): string {
    // For OAuth 1.0a (App-only auth), we need to get a bearer token
    // This is a simplified version - in production, you'd handle this more robustly
    const credentials = Buffer.from(
      `${encodeURIComponent(TWITTER_API_KEY)}:${encodeURIComponent(TWITTER_API_SECRET)}`
    ).toString('base64');
    
    return credentials;
  }

  private async getBearerToken(): Promise<string> {
    try {
      const response = await fetch('https://api.twitter.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.generateBearerToken()}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Failed to get bearer token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting bearer token:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      const bearerToken = await this.getBearerToken();
      const cleanUsername = username.replace('@', '');
      
      const url = `${this.baseUrl}/users/by/username/${cleanUsername}?user.fields=profile_image_url,public_metrics,verified`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        console.error(`Twitter API error: ${response.statusText}`);
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
      const bearerToken = await this.getBearerToken();
      const cleanUsername = username.replace('@', '');
      
      // First get user ID
      const user = await this.getUserByUsername(cleanUsername);
      if (!user) {
        throw new Error(`User ${username} not found`);
      }

      const url = `${this.baseUrl}/users/${user.id}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities&expansions=author_id&user.fields=profile_image_url,public_metrics,verified`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
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

  categorizeTweet(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('alert') || lowerText.includes('breaking') || lowerText.includes('urgent')) {
      return 'alert';
    }
    if (lowerText.includes('bullish') || lowerText.includes('moon') || lowerText.includes('pump')) {
      return 'bullish';
    }
    if (lowerText.includes('bearish') || lowerText.includes('dump') || lowerText.includes('crash')) {
      return 'bearish';
    }
    if (lowerText.includes('alpha') || lowerText.includes('gem') || lowerText.includes('opportunity')) {
      return 'alpha';
    }
    if (lowerText.includes('analysis') || lowerText.includes('technical') || lowerText.includes('chart')) {
      return 'analysis';
    }
    
    return 'general';
  }
}

export const twitterClient = new TwitterClient();
export type { TwitterUser, Tweet, TwitterApiResponse };
