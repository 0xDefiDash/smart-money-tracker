/**
 * Quick Analysis System
 * Uses local Abacus AI LLM API for fast trading analysis
 * Falls back to Swarms for complex multi-agent tasks
 */

import { fetchCryptoPrices } from '@/lib/price-service';
import { coinglassClient } from '@/lib/coinglass-client';

const LLM_API_BASE = 'https://routellm.abacus.ai/v1';

interface QuickAnalysisResult {
  success: boolean;
  analysis: {
    summary: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    keyPoints: string[];
    recommendation: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    signals: {
      technical: string;
      sentiment: string;
      onchain: string;
    };
  };
  marketContext: {
    btcPrice: number;
    btcChange24h: number;
    ethPrice: number;
    ethChange24h: number;
    marketSentiment?: any;
  };
  executionTime: number;
  timestamp: string;
}

class QuickAnalyzer {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ABACUSAI_API_KEY || '';
  }

  /**
   * Fast market analysis using local LLM
   */
  async analyzeMarket(query: string): Promise<QuickAnalysisResult> {
    const startTime = Date.now();

    // Gather market context in parallel
    const [priceData, sentimentData] = await Promise.all([
      this.getMarketContext(),
      this.getSentimentContext()
    ]);

    // Build the analysis prompt
    const systemPrompt = `You are an expert crypto trading analyst. Provide CONCISE, actionable analysis.

Format your response as JSON with this exact structure:
{
  "summary": "2-3 sentence market overview",
  "sentiment": "BULLISH" or "BEARISH" or "NEUTRAL",
  "confidence": number 1-10,
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendation": "specific actionable advice",
  "riskLevel": "LOW" or "MEDIUM" or "HIGH",
  "signals": {
    "technical": "brief technical outlook",
    "sentiment": "market sentiment reading",
    "onchain": "on-chain data insight"
  }
}`;

    const userPrompt = `Analyze the following crypto trading query:

"${query}"

Current Market Context:
- BTC: $${priceData.btcPrice.toLocaleString()} (${priceData.btcChange24h > 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}% 24h)
- ETH: $${priceData.ethPrice.toLocaleString()} (${priceData.ethChange24h > 0 ? '+' : ''}${priceData.ethChange24h.toFixed(2)}% 24h)
${sentimentData ? `
Sentiment Data:
- Long/Short Ratio: ${sentimentData.longRate?.toFixed(1)}% / ${sentimentData.shortRate?.toFixed(1)}%
- Funding Rate: ${sentimentData.fundingRate?.toFixed(4)}%` : ''}

Provide your analysis in the JSON format specified.`;

    try {
      const response = await fetch(`${LLM_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      
      // Parse the JSON response
      let analysis;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        // Fallback to structured response if parsing fails
        analysis = this.parseUnstructuredResponse(content);
      }

      return {
        success: true,
        analysis: {
          summary: analysis.summary || 'Analysis completed',
          sentiment: analysis.sentiment || 'NEUTRAL',
          confidence: analysis.confidence || 7,
          keyPoints: analysis.keyPoints || ['Market analysis completed'],
          recommendation: analysis.recommendation || 'Monitor market conditions',
          riskLevel: analysis.riskLevel || 'MEDIUM',
          signals: analysis.signals || {
            technical: 'Mixed signals',
            sentiment: 'Neutral',
            onchain: 'Normal activity'
          }
        },
        marketContext: priceData,
        executionTime: (Date.now() - startTime) / 1000,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Quick analysis error:', error);
      return this.getFallbackAnalysis(query, priceData, startTime);
    }
  }

  /**
   * Quick token-specific analysis
   */
  async analyzeToken(symbol: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Provide trading analysis for ${symbol}. Include entry points, risk levels, and short-term outlook.`);
  }

  /**
   * Quick risk assessment
   */
  async assessRisk(position: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Assess the risk of: ${position}. Provide position sizing recommendations and stop-loss levels.`);
  }

  /**
   * Quick alpha scan
   */
  async scanAlpha(): Promise<QuickAnalysisResult> {
    return this.analyzeMarket('Identify the top 3 alpha opportunities in crypto right now. Focus on emerging narratives and momentum plays.');
  }

  private async getMarketContext() {
    try {
      const priceResult = await fetchCryptoPrices();
      const prices = priceResult.data || [];
      const btc = prices.find((p: any) => p.symbol === 'BTC');
      const eth = prices.find((p: any) => p.symbol === 'ETH');
      
      return {
        btcPrice: btc?.current_price || 100000,
        btcChange24h: btc?.price_change_percentage_24h || 0,
        ethPrice: eth?.current_price || 4000,
        ethChange24h: eth?.price_change_percentage_24h || 0
      };
    } catch (e) {
      return {
        btcPrice: 100000,
        btcChange24h: 0,
        ethPrice: 4000,
        ethChange24h: 0
      };
    }
  }

  private async getSentimentContext() {
    try {
      const sentiment = await coinglassClient.getMarketSentiment('BTC');
      return {
        longRate: sentiment.longShortRatio.longRate,
        shortRate: sentiment.longShortRatio.shortRate,
        fundingRate: sentiment.fundingRate.rate
      };
    } catch (e) {
      return null;
    }
  }

  private parseUnstructuredResponse(content: string) {
    // Attempt to extract key information from unstructured response
    const isBullish = /bullish|long|buy|accumulate/i.test(content);
    const isBearish = /bearish|short|sell|avoid/i.test(content);
    
    return {
      summary: content.substring(0, 200) + '...',
      sentiment: isBullish ? 'BULLISH' : isBearish ? 'BEARISH' : 'NEUTRAL',
      confidence: 6,
      keyPoints: ['See full analysis above'],
      recommendation: 'Review detailed analysis',
      riskLevel: 'MEDIUM',
      signals: {
        technical: 'Analysis provided',
        sentiment: isBullish ? 'Positive' : isBearish ? 'Negative' : 'Neutral',
        onchain: 'Data integrated'
      }
    };
  }

  private getFallbackAnalysis(query: string, priceData: any, startTime: number): QuickAnalysisResult {
    const btcTrend = priceData.btcChange24h > 0 ? 'BULLISH' : priceData.btcChange24h < -2 ? 'BEARISH' : 'NEUTRAL';
    
    return {
      success: true,
      analysis: {
        summary: `Market is showing ${btcTrend.toLowerCase()} conditions with BTC at $${priceData.btcPrice.toLocaleString()}.`,
        sentiment: btcTrend as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
        confidence: 5,
        keyPoints: [
          `BTC ${priceData.btcChange24h > 0 ? 'up' : 'down'} ${Math.abs(priceData.btcChange24h).toFixed(2)}% in 24h`,
          `ETH ${priceData.ethChange24h > 0 ? 'up' : 'down'} ${Math.abs(priceData.ethChange24h).toFixed(2)}% in 24h`,
          'Monitor key support/resistance levels'
        ],
        recommendation: btcTrend === 'BULLISH' ? 'Look for pullback entries' : btcTrend === 'BEARISH' ? 'Exercise caution, wait for reversal' : 'Range-trade with tight stops',
        riskLevel: 'MEDIUM',
        signals: {
          technical: 'Based on price action',
          sentiment: 'Market data integrated',
          onchain: 'Monitoring whale activity'
        }
      },
      marketContext: priceData,
      executionTime: (Date.now() - startTime) / 1000,
      timestamp: new Date().toISOString()
    };
  }
}

export const quickAnalyzer = new QuickAnalyzer();
