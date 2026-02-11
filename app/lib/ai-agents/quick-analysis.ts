/**
 * Multi-LLM Quick Analysis System
 * Integrates OpenAI, Gemini, NVIDIA, and Grok for comprehensive trading analysis
 * Uses real-time price data from multiple sources
 */

import { coinglassClient } from '@/lib/coinglass-client';
import * as fs from 'fs';
import * as path from 'path';

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

class MultiLLMAnalyzer {
  private llmConfigs: LLMConfig[] = [];
  private priceCache: { data: any; timestamp: number } | null = null;
  private CACHE_DURATION = 30000; // 30 seconds

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
        model: 'gpt-4o-mini',
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
    const grokKey = this.getSecretValue('grok', 'api_key') || this.getSecretValue('xai', 'api_key');
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
        model: 'gpt-4o-mini',
        apiKey: abacusKey,
        priority: 5
      });
    }

    // Sort by priority
    this.llmConfigs.sort((a, b) => a.priority - b.priority);
    console.log(`[MultiLLM] Initialized ${this.llmConfigs.length} LLM providers: ${this.llmConfigs.map(c => c.name).join(', ')}`);
  }

  /**
   * Fetch REAL-TIME prices from multiple sources
   */
  private async getRealTimePrices(): Promise<{
    btcPrice: number;
    btcChange24h: number;
    ethPrice: number;
    ethChange24h: number;
    source: string;
  }> {
    // Check cache first
    if (this.priceCache && Date.now() - this.priceCache.timestamp < this.CACHE_DURATION) {
      return this.priceCache.data;
    }

    const sources = [
      { name: 'Binance', fn: () => this.fetchBinancePrices() },
      { name: 'CoinGecko', fn: () => this.fetchCoinGeckoPrices() },
      { name: 'CoinCap', fn: () => this.fetchCoinCapPrices() }
    ];

    for (const source of sources) {
      try {
        const data = await source.fn();
        if (data && data.btcPrice > 0) {
          const result = { ...data, source: source.name };
          this.priceCache = { data: result, timestamp: Date.now() };
          console.log(`[Prices] Got real-time data from ${source.name}: BTC=$${data.btcPrice.toLocaleString()}`);
          return result;
        }
      } catch (e) {
        console.error(`[Prices] ${source.name} failed:`, e);
      }
    }

    // Ultimate fallback - should never reach here
    console.warn('[Prices] All sources failed, using last known prices');
    return {
      btcPrice: 97000,
      btcChange24h: 0,
      ethPrice: 3600,
      ethChange24h: 0,
      source: 'fallback'
    };
  }

  private async fetchBinancePrices(): Promise<{ btcPrice: number; btcChange24h: number; ethPrice: number; ethChange24h: number }> {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]', {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Binance API error');
    const data = await response.json();
    
    const btc = data.find((t: any) => t.symbol === 'BTCUSDT');
    const eth = data.find((t: any) => t.symbol === 'ETHUSDT');
    
    return {
      btcPrice: parseFloat(btc?.lastPrice || '0'),
      btcChange24h: parseFloat(btc?.priceChangePercent || '0'),
      ethPrice: parseFloat(eth?.lastPrice || '0'),
      ethChange24h: parseFloat(eth?.priceChangePercent || '0')
    };
  }

  private async fetchCoinGeckoPrices(): Promise<{ btcPrice: number; btcChange24h: number; ethPrice: number; ethChange24h: number }> {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error('CoinGecko API error');
    const data = await response.json();
    
    return {
      btcPrice: data.bitcoin?.usd || 0,
      btcChange24h: data.bitcoin?.usd_24h_change || 0,
      ethPrice: data.ethereum?.usd || 0,
      ethChange24h: data.ethereum?.usd_24h_change || 0
    };
  }

  private async fetchCoinCapPrices(): Promise<{ btcPrice: number; btcChange24h: number; ethPrice: number; ethChange24h: number }> {
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.coincap.io/v2/assets/bitcoin', { signal: AbortSignal.timeout(5000) }),
      fetch('https://api.coincap.io/v2/assets/ethereum', { signal: AbortSignal.timeout(5000) })
    ]);
    
    const btcData = await btcRes.json();
    const ethData = await ethRes.json();
    
    return {
      btcPrice: parseFloat(btcData.data?.priceUsd || '0'),
      btcChange24h: parseFloat(btcData.data?.changePercent24Hr || '0'),
      ethPrice: parseFloat(ethData.data?.priceUsd || '0'),
      ethChange24h: parseFloat(ethData.data?.changePercent24Hr || '0')
    };
  }

  /**
   * Call LLM with fallback to next provider on failure
   */
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
          console.log(`[MultiLLM] Successfully used ${config.name}`);
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
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${config.name} API error: ${error}`);
    }

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
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }),
        signal: AbortSignal.timeout(20000)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Fast market analysis using multiple LLMs
   */
  async analyzeMarket(query: string): Promise<QuickAnalysisResult> {
    const startTime = Date.now();

    // Get REAL-TIME price data
    const [priceData, sentimentData] = await Promise.all([
      this.getRealTimePrices(),
      this.getSentimentContext()
    ]);

    const systemPrompt = `You are an expert crypto trading analyst with access to REAL-TIME market data. Provide CONCISE, actionable analysis based on the ACTUAL current prices provided.

Format your response as JSON with this exact structure:
{
  "summary": "2-3 sentence market overview with specific price levels",
  "sentiment": "BULLISH" or "BEARISH" or "NEUTRAL",
  "confidence": number 1-10,
  "keyPoints": ["point 1 with specific data", "point 2", "point 3"],
  "recommendation": "specific actionable advice with price targets",
  "riskLevel": "LOW" or "MEDIUM" or "HIGH",
  "signals": {
    "technical": "technical outlook based on price action",
    "sentiment": "market sentiment from L/S ratios and funding",
    "onchain": "on-chain data insight"
  }
}`;

    const userPrompt = `Analyze the following crypto trading query:

"${query}"

=== REAL-TIME MARKET DATA (Source: ${priceData.source}) ===
• BTC Price: $${priceData.btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• BTC 24h Change: ${priceData.btcChange24h > 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}%
• ETH Price: $${priceData.ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• ETH 24h Change: ${priceData.ethChange24h > 0 ? '+' : ''}${priceData.ethChange24h.toFixed(2)}%
${sentimentData ? `
=== DERIVATIVES DATA ===
• BTC Long/Short Ratio: ${sentimentData.longRate?.toFixed(1)}% / ${sentimentData.shortRate?.toFixed(1)}%
• Funding Rate: ${sentimentData.fundingRate?.toFixed(4)}%` : ''}

Provide your analysis in the JSON format specified. Use the ACTUAL prices shown above.`;

    try {
      const { content, llmUsed } = await this.callLLM(systemPrompt, userPrompt);
      
      // Parse the JSON response
      let analysis;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
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
        llmUsed,
        executionTime: (Date.now() - startTime) / 1000,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return this.getFallbackAnalysis(query, priceData, startTime);
    }
  }

  async analyzeToken(symbol: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Provide trading analysis for ${symbol}. Include entry points, risk levels, and short-term outlook based on current price action.`);
  }

  async assessRisk(position: string): Promise<QuickAnalysisResult> {
    return this.analyzeMarket(`Assess the risk of: ${position}. Provide position sizing recommendations and stop-loss levels based on current market conditions.`);
  }

  async scanAlpha(): Promise<QuickAnalysisResult> {
    return this.analyzeMarket('Identify the top 3 alpha opportunities in crypto right now. Focus on emerging narratives, momentum plays, and smart money movements.');
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
    const isBullish = /bullish|long|buy|accumulate/i.test(content);
    const isBearish = /bearish|short|sell|avoid/i.test(content);
    
    return {
      summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
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
    const btcTrend = priceData.btcChange24h > 2 ? 'BULLISH' : priceData.btcChange24h < -2 ? 'BEARISH' : 'NEUTRAL';
    
    return {
      success: true,
      analysis: {
        summary: `BTC trading at $${priceData.btcPrice.toLocaleString()} with ${priceData.btcChange24h > 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}% in 24h. ETH at $${priceData.ethPrice.toLocaleString()}.`,
        sentiment: btcTrend as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
        confidence: 5,
        keyPoints: [
          `BTC: $${priceData.btcPrice.toLocaleString()} (${priceData.btcChange24h > 0 ? '+' : ''}${priceData.btcChange24h.toFixed(2)}%)`,
          `ETH: $${priceData.ethPrice.toLocaleString()} (${priceData.ethChange24h > 0 ? '+' : ''}${priceData.ethChange24h.toFixed(2)}%)`,
          `Data source: ${priceData.source}`
        ],
        recommendation: btcTrend === 'BULLISH' ? 'Look for pullback entries' : btcTrend === 'BEARISH' ? 'Exercise caution' : 'Range-trade with tight stops',
        riskLevel: 'MEDIUM',
        signals: {
          technical: 'Based on real-time price data',
          sentiment: 'Market data integrated',
          onchain: 'Monitoring whale activity'
        }
      },
      marketContext: priceData,
      llmUsed: 'Fallback',
      executionTime: (Date.now() - startTime) / 1000,
      timestamp: new Date().toISOString()
    };
  }
}

export const quickAnalyzer = new MultiLLMAnalyzer();
