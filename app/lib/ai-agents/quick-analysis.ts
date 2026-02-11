/**
 * Multi-LLM Quick Analysis System
 * Integrates OpenAI, Gemini, NVIDIA for accurate trading analysis
 * Uses REAL-TIME verified data only - no hallucinations
 */

import { coinglassClient } from '@/lib/coinglass-client';
import * as fs from 'fs';

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
    source: string;
  };
  llmUsed: string;
  executionTime: number;
  timestamp: string;
}

interface LLMConfig {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  priority: number;
}

interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
  btcHigh24h: number;
  btcLow24h: number;
  ethHigh24h: number;
  ethLow24h: number;
  source: string;
}

interface SentimentData {
  longRate: number;
  shortRate: number;
  fundingRate: number;
  openInterest?: number;
  oiChange24h?: number;
}

class MultiLLMAnalyzer {
  private llmConfigs: LLMConfig[] = [];
  private priceCache: { data: MarketData; timestamp: number } | null = null;
  private CACHE_DURATION = 15000; // 15 seconds for fresher data

  constructor() {
    this.initializeLLMs();
  }

  private getSecretValue(serviceName: string, secretName: string): string {
    try {
      const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
      if (fs.existsSync(secretsPath)) {
        const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
        return secrets[serviceName]?.secrets?.[secretName]?.value || '';
      }
    } catch (e) {
      console.error(`Error reading secret for ${serviceName}:`, e);
    }
    return '';
  }

  private initializeLLMs() {
    // OpenAI - Primary
    const openaiKey = this.getSecretValue('openai', 'api_key');
    if (openaiKey) {
      this.llmConfigs.push({
        name: 'OpenAI GPT-4o',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        apiKey: openaiKey,
        priority: 1
      });
    }

    // Google Gemini
    const geminiKey = process.env.GEMINI_API_KEY || '';
    if (geminiKey) {
      this.llmConfigs.push({
        name: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-1.5-flash',
        apiKey: geminiKey,
        priority: 2
      });
    }

    // NVIDIA NIM
    const nvidiaKey = this.getSecretValue('nvidia', 'api_key');
    if (nvidiaKey) {
      this.llmConfigs.push({
        name: 'NVIDIA Llama-3.1',
        baseUrl: 'https://integrate.api.nvidia.com/v1',
        model: 'meta/llama-3.1-70b-instruct',
        apiKey: nvidiaKey,
        priority: 3
      });
    }

    // Grok/XAI
    const grokKey = this.getSecretValue('grok', 'api_key');
    if (grokKey) {
      this.llmConfigs.push({
        name: 'Grok',
        baseUrl: 'https://api.x.ai/v1',
        model: 'grok-beta',
        apiKey: grokKey,
        priority: 4
      });
    }

    // Fallback to Abacus RouteLLM
    const abacusKey = process.env.ABACUSAI_API_KEY || '';
    if (abacusKey) {
      this.llmConfigs.push({
        name: 'Abacus RouteLLM',
        baseUrl: 'https://routellm.abacus.ai/v1',
        model: 'gpt-4o',
        apiKey: abacusKey,
        priority: 5
      });
    }

    this.llmConfigs.sort((a, b) => a.priority - b.priority);
    console.log(`[MultiLLM] Initialized ${this.llmConfigs.length} providers: ${this.llmConfigs.map(c => c.name).join(', ')}`);
  }

  /**
   * Fetch VERIFIED real-time prices from Binance
   */
  private async getRealTimePrices(): Promise<MarketData> {
    if (this.priceCache && Date.now() - this.priceCache.timestamp < this.CACHE_DURATION) {
      return this.priceCache.data;
    }

    // Try Binance first - most reliable
    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]',
        { signal: AbortSignal.timeout(5000) }
      );
      if (response.ok) {
        const data = await response.json();
        const btc = data.find((t: any) => t.symbol === 'BTCUSDT');
        const eth = data.find((t: any) => t.symbol === 'ETHUSDT');
        
        const result: MarketData = {
          btcPrice: parseFloat(btc?.lastPrice || '0'),
          btcChange24h: parseFloat(btc?.priceChangePercent || '0'),
          btcHigh24h: parseFloat(btc?.highPrice || '0'),
          btcLow24h: parseFloat(btc?.lowPrice || '0'),
          ethPrice: parseFloat(eth?.lastPrice || '0'),
          ethChange24h: parseFloat(eth?.priceChangePercent || '0'),
          ethHigh24h: parseFloat(eth?.highPrice || '0'),
          ethLow24h: parseFloat(eth?.lowPrice || '0'),
          source: 'Binance'
        };
        
        this.priceCache = { data: result, timestamp: Date.now() };
        console.log(`[Prices] Binance: BTC=$${result.btcPrice.toLocaleString()}, ETH=$${result.ethPrice.toLocaleString()}`);
        return result;
      }
    } catch (e) {
      console.error('[Prices] Binance failed:', e);
    }

    // Fallback to CoinGecko
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&sparkline=false',
        { signal: AbortSignal.timeout(5000) }
      );
      if (response.ok) {
        const data = await response.json();
        const btc = data.find((c: any) => c.id === 'bitcoin');
        const eth = data.find((c: any) => c.id === 'ethereum');
        
        const result: MarketData = {
          btcPrice: btc?.current_price || 0,
          btcChange24h: btc?.price_change_percentage_24h || 0,
          btcHigh24h: btc?.high_24h || 0,
          btcLow24h: btc?.low_24h || 0,
          ethPrice: eth?.current_price || 0,
          ethChange24h: eth?.price_change_percentage_24h || 0,
          ethHigh24h: eth?.high_24h || 0,
          ethLow24h: eth?.low_24h || 0,
          source: 'CoinGecko'
        };
        
        this.priceCache = { data: result, timestamp: Date.now() };
        return result;
      }
    } catch (e) {
      console.error('[Prices] CoinGecko failed:', e);
    }

    // Return cached or error
    if (this.priceCache) return this.priceCache.data;
    throw new Error('All price sources failed');
  }

  /**
   * Get REAL sentiment data from Coinglass
   */
  private async getSentimentData(): Promise<SentimentData | null> {
    try {
      const sentiment = await coinglassClient.getMarketSentiment('BTC');
      return {
        longRate: sentiment.longShortRatio.longRate,
        shortRate: sentiment.longShortRatio.shortRate,
        fundingRate: sentiment.fundingRate.rate,
        openInterest: sentiment.openInterest?.openInterestUsd,
        oiChange24h: sentiment.openInterest?.h24Change
      };
    } catch (e) {
      console.error('[Sentiment] Coinglass failed:', e);
      return null;
    }
  }

  private async callLLM(systemPrompt: string, userPrompt: string): Promise<{ content: string; llmUsed: string }> {
    for (const config of this.llmConfigs) {
      try {
        let content: string;
        
        if (config.name === 'Google Gemini') {
          content = await this.callGemini(config, systemPrompt, userPrompt);
        } else {
          content = await this.callOpenAICompatible(config, systemPrompt, userPrompt);
        }
        
        if (content) {
          console.log(`[MultiLLM] Success with ${config.name}`);
          return { content, llmUsed: config.name };
        }
      } catch (e) {
        console.error(`[MultiLLM] ${config.name} failed:`, e);
      }
    }
    throw new Error('All LLM providers failed');
  }

  private async callOpenAICompatible(config: LLMConfig, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temp for more factual responses
        max_tokens: 1000
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) throw new Error(`${config.name} error: ${response.status}`);
    const result = await response.json();
    return result.choices?.[0]?.message?.content || '';
  }

  private async callGemini(config: LLMConfig, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(
      `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        }),
        signal: AbortSignal.timeout(25000)
      }
    );

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async analyzeMarket(query: string): Promise<QuickAnalysisResult> {
    const startTime = Date.now();

    // Get REAL data
    const [priceData, sentimentData] = await Promise.all([
      this.getRealTimePrices(),
      this.getSentimentData()
    ]);

    // Build prompt that ONLY allows using provided data
    const systemPrompt = `You are a crypto market analyst. CRITICAL RULES:
1. ONLY use the EXACT data provided below - DO NOT invent prices, levels, or statistics
2. For support/resistance, use the 24h high/low from the data provided
3. DO NOT mention any price levels that aren't in the provided data
4. If data is missing, say "data not available" instead of making it up
5. Base sentiment ONLY on the Long/Short ratio and funding rate provided

Respond in JSON format:
{
  "summary": "2-3 sentences using ONLY the provided data",
  "sentiment": "BULLISH" or "BEARISH" or "NEUTRAL" (based on L/S ratio and price change),
  "confidence": number 1-10,
  "keyPoints": ["point using actual data", "point 2", "point 3"],
  "recommendation": "advice based on actual data",
  "riskLevel": "LOW" or "MEDIUM" or "HIGH",
  "signals": {
    "technical": "based on 24h high/low and price change ONLY",
    "sentiment": "based on L/S ratio and funding rate ONLY",
    "onchain": "based on open interest if available, otherwise say data limited"
  }
}`;

    const userPrompt = `Query: "${query}"

=== VERIFIED REAL-TIME DATA (${new Date().toISOString()}) ===
Source: ${priceData.source}

BTC/USDT:
- Current Price: $${priceData.btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
- 24h Change: ${priceData.btcChange24h >= 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}%
- 24h High: $${priceData.btcHigh24h.toLocaleString(undefined, {minimumFractionDigits: 2})}
- 24h Low: $${priceData.btcLow24h.toLocaleString(undefined, {minimumFractionDigits: 2})}

ETH/USDT:
- Current Price: $${priceData.ethPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
- 24h Change: ${priceData.ethChange24h >= 0 ? '+' : ''}${priceData.ethChange24h.toFixed(2)}%
- 24h High: $${priceData.ethHigh24h.toLocaleString(undefined, {minimumFractionDigits: 2})}
- 24h Low: $${priceData.ethLow24h.toLocaleString(undefined, {minimumFractionDigits: 2})}

${sentimentData ? `=== DERIVATIVES DATA (Coinglass) ===
- Long Positions: ${sentimentData.longRate.toFixed(1)}%
- Short Positions: ${sentimentData.shortRate.toFixed(1)}%
- Funding Rate: ${sentimentData.fundingRate >= 0 ? '+' : ''}${sentimentData.fundingRate.toFixed(4)}%
${sentimentData.openInterest ? `- Open Interest: $${(sentimentData.openInterest / 1e9).toFixed(2)}B` : ''}
${sentimentData.oiChange24h ? `- OI 24h Change: ${sentimentData.oiChange24h >= 0 ? '+' : ''}${sentimentData.oiChange24h.toFixed(2)}%` : ''}` : '=== DERIVATIVES DATA ===\nNot available'}

Analyze using ONLY the data above. Do not invent any numbers or levels.`;

    try {
      const { content, llmUsed } = await this.callLLM(systemPrompt, userPrompt);
      
      let analysis;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        analysis = this.createDataDrivenAnalysis(priceData, sentimentData);
      }

      return {
        success: true,
        analysis: {
          summary: analysis.summary || this.createSummary(priceData, sentimentData),
          sentiment: analysis.sentiment || this.deriveSentiment(priceData, sentimentData),
          confidence: analysis.confidence || 7,
          keyPoints: analysis.keyPoints || this.createKeyPoints(priceData, sentimentData),
          recommendation: analysis.recommendation || 'Monitor key levels',
          riskLevel: analysis.riskLevel || 'MEDIUM',
          signals: analysis.signals || this.createSignals(priceData, sentimentData)
        },
        marketContext: priceData,
        llmUsed,
        executionTime: (Date.now() - startTime) / 1000,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return this.createFallbackAnalysis(priceData, sentimentData, startTime);
    }
  }

  private deriveSentiment(priceData: MarketData, sentimentData: SentimentData | null): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    let score = 0;
    
    // Price momentum
    if (priceData.btcChange24h > 3) score += 2;
    else if (priceData.btcChange24h > 0) score += 1;
    else if (priceData.btcChange24h < -3) score -= 2;
    else if (priceData.btcChange24h < 0) score -= 1;
    
    // L/S ratio
    if (sentimentData) {
      if (sentimentData.longRate > 55) score += 1;
      else if (sentimentData.shortRate > 55) score -= 1;
      
      // Funding
      if (sentimentData.fundingRate > 0.01) score += 1;
      else if (sentimentData.fundingRate < -0.01) score -= 1;
    }
    
    if (score >= 2) return 'BULLISH';
    if (score <= -2) return 'BEARISH';
    return 'NEUTRAL';
  }

  private createSummary(priceData: MarketData, sentimentData: SentimentData | null): string {
    const btcDir = priceData.btcChange24h >= 0 ? 'up' : 'down';
    const sentiment = this.deriveSentiment(priceData, sentimentData);
    return `BTC trading at $${priceData.btcPrice.toLocaleString()} (${btcDir} ${Math.abs(priceData.btcChange24h).toFixed(2)}% in 24h). ` +
           `24h range: $${priceData.btcLow24h.toLocaleString()} - $${priceData.btcHigh24h.toLocaleString()}. ` +
           `Market sentiment appears ${sentiment.toLowerCase()}.`;
  }

  private createKeyPoints(priceData: MarketData, sentimentData: SentimentData | null): string[] {
    const points = [
      `BTC: $${priceData.btcPrice.toLocaleString()} (${priceData.btcChange24h >= 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}%)`,
      `ETH: $${priceData.ethPrice.toLocaleString()} (${priceData.ethChange24h >= 0 ? '+' : ''}${priceData.ethChange24h.toFixed(2)}%)`,
      `BTC 24h Range: $${priceData.btcLow24h.toLocaleString()} - $${priceData.btcHigh24h.toLocaleString()}`
    ];
    
    if (sentimentData) {
      points.push(`Long/Short Ratio: ${sentimentData.longRate.toFixed(1)}% / ${sentimentData.shortRate.toFixed(1)}%`);
    }
    
    return points;
  }

  private createSignals(priceData: MarketData, sentimentData: SentimentData | null): { technical: string; sentiment: string; onchain: string } {
    const pricePosition = ((priceData.btcPrice - priceData.btcLow24h) / (priceData.btcHigh24h - priceData.btcLow24h) * 100).toFixed(0);
    
    return {
      technical: `BTC at ${pricePosition}% of 24h range. Support: $${priceData.btcLow24h.toLocaleString()}, Resistance: $${priceData.btcHigh24h.toLocaleString()}`,
      sentiment: sentimentData 
        ? `L/S: ${sentimentData.longRate.toFixed(1)}%/${sentimentData.shortRate.toFixed(1)}%, Funding: ${sentimentData.fundingRate >= 0 ? '+' : ''}${sentimentData.fundingRate.toFixed(4)}%`
        : 'Derivatives data not available',
      onchain: sentimentData?.openInterest 
        ? `Open Interest: $${(sentimentData.openInterest / 1e9).toFixed(2)}B`
        : 'On-chain data limited'
    };
  }

  private createDataDrivenAnalysis(priceData: MarketData, sentimentData: SentimentData | null): {
    summary: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    keyPoints: string[];
    recommendation: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    signals: { technical: string; sentiment: string; onchain: string };
  } {
    return {
      summary: this.createSummary(priceData, sentimentData),
      sentiment: this.deriveSentiment(priceData, sentimentData),
      confidence: 7,
      keyPoints: this.createKeyPoints(priceData, sentimentData),
      recommendation: priceData.btcChange24h > 0 ? 'Monitor for continuation' : 'Watch for reversal signals',
      riskLevel: Math.abs(priceData.btcChange24h) > 5 ? 'HIGH' as const : 'MEDIUM' as const,
      signals: this.createSignals(priceData, sentimentData)
    };
  }

  private createFallbackAnalysis(priceData: MarketData, sentimentData: SentimentData | null, startTime: number): QuickAnalysisResult {
    return {
      success: true,
      analysis: this.createDataDrivenAnalysis(priceData, sentimentData),
      marketContext: priceData,
      llmUsed: 'Data-Driven Fallback',
      executionTime: (Date.now() - startTime) / 1000,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeToken(symbol: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Analyze ${symbol} trading opportunity based on current market data.`);
  }

  async assessRisk(position: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Assess risk for: ${position}`);
  }

  async scanAlpha(): Promise<QuickAnalysisResult> {
    return this.analyzeMarket('What trading opportunities exist based on current BTC and ETH price action and derivatives data?');
  }
}

export const quickAnalyzer = new MultiLLMAnalyzer();
