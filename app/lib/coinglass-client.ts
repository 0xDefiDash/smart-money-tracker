/**
 * Coinglass API Client
 * Provides access to futures market data including long/short ratios,
 * funding rates, open interest, and liquidation data.
 * 
 * API Docs: https://docs.coinglass.com/reference/getting-started-with-your-api
 */

const COINGLASS_BASE_URL = 'https://open-api.coinglass.com';

// Types
export interface LongShortRatioData {
  symbol: string;
  longRate: number;
  shortRate: number;
  longShortRatio: number;
  exchange?: string;
  timestamp?: number;
}

export interface FundingRateData {
  symbol: string;
  rate: number;
  predictedRate?: number;
  nextFundingTime?: number;
  exchange: string;
  uMarginList?: Array<{
    exchangeName: string;
    rate: number;
    nextFundingTime: number;
  }>;
}

export interface OpenInterestData {
  symbol: string;
  openInterest: number;
  openInterestUsd: number;
  h24Change: number;
  exchange?: string;
}

export interface LiquidationData {
  symbol: string;
  longLiquidationUsd: number;
  shortLiquidationUsd: number;
  totalLiquidationUsd: number;
  h1?: number;
  h4?: number;
  h12?: number;
  h24?: number;
}

export interface MarketSentiment {
  symbol: string;
  longShortRatio: LongShortRatioData;
  fundingRate: FundingRateData;
  openInterest: OpenInterestData;
  liquidation24h: LiquidationData;
}

export interface TopTraderRatio {
  symbol: string;
  exchange: string;
  longAccount: number;
  shortAccount: number;
  longShortRatio: number;
  timestamp: number;
}

class CoinglassClient {
  private apiKey: string;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheDuration = 30000; // 30 seconds cache

  constructor() {
    this.apiKey = process.env.COINGLASS_API_KEY || '';
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }

    if (!this.apiKey) {
      throw new Error('COINGLASS_API_KEY is not configured');
    }

    const url = new URL(`${COINGLASS_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'CG-API-KEY': this.apiKey,
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coinglass API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    if (result.code !== '0' && result.code !== 0) {
      throw new Error(result.msg || 'Coinglass API returned an error');
    }

    this.cache.set(cacheKey, { data: result.data, expiry: Date.now() + this.cacheDuration });
    return result.data as T;
  }

  /**
   * Get global long/short account ratio for all exchanges
   */
  async getGlobalLongShortRatio(symbol: string = 'BTC'): Promise<LongShortRatioData[]> {
    try {
      const data = await this.request<any[]>('/public/v2/indicator/global_long_short_account_ratio', {
        symbol: symbol.toUpperCase(),
      });

      return (data || []).map((item: any) => ({
        symbol: symbol.toUpperCase(),
        exchange: item.exchangeName || item.exchange,
        longRate: parseFloat(item.longRate || item.longAccount || '0') * 100,
        shortRate: parseFloat(item.shortRate || item.shortAccount || '0') * 100,
        longShortRatio: parseFloat(item.longShortRatio || item.longAccount / item.shortAccount || '1'),
        timestamp: item.createTime || Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching global long/short ratio:', error);
      return this.getMockLongShortRatio(symbol);
    }
  }

  /**
   * Get top trader account long/short ratio from exchanges
   */
  async getTopTraderRatio(symbol: string = 'BTC', exchange: string = 'Binance'): Promise<TopTraderRatio[]> {
    try {
      const data = await this.request<any[]>('/public/v2/indicator/top_long_short_account_ratio', {
        symbol: symbol.toUpperCase(),
        ex: exchange,
      });

      return (data || []).map((item: any) => ({
        symbol: symbol.toUpperCase(),
        exchange: item.exchangeName || exchange,
        longAccount: parseFloat(item.longAccount || '0.5') * 100,
        shortAccount: parseFloat(item.shortAccount || '0.5') * 100,
        longShortRatio: parseFloat(item.longShortRatio || '1'),
        timestamp: item.createTime || Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching top trader ratio:', error);
      return [];
    }
  }

  /**
   * Get taker buy/sell ratio (actual trade volume ratio)
   */
  async getTakerBuySellRatio(symbol: string = 'BTC'): Promise<any> {
    try {
      const data = await this.request<any>('/public/v2/indicator/taker_long_short_ratio', {
        symbol: symbol.toUpperCase(),
        interval: '1h',
      });
      return data;
    } catch (error) {
      console.error('Error fetching taker buy/sell ratio:', error);
      return null;
    }
  }

  /**
   * Get funding rates for a symbol across exchanges
   */
  async getFundingRates(symbol: string = 'BTC'): Promise<FundingRateData[]> {
    try {
      const data = await this.request<any[]>('/public/v2/indicator/funding', {
        symbol: symbol.toUpperCase(),
      });

      return (data || []).map((item: any) => ({
        symbol: symbol.toUpperCase(),
        exchange: item.exchangeName || item.exchange || 'Unknown',
        rate: parseFloat(item.rate || item.fundingRate || '0') * 100,
        predictedRate: item.predictedRate ? parseFloat(item.predictedRate) * 100 : undefined,
        nextFundingTime: item.nextFundingTime,
        uMarginList: item.uMarginList,
      }));
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      return this.getMockFundingRates(symbol);
    }
  }

  /**
   * Get aggregated funding rate for a symbol
   */
  async getAggregatedFundingRate(symbol: string = 'BTC'): Promise<FundingRateData | null> {
    try {
      const data = await this.request<any>('/public/v2/indicator/funding_avg', {
        symbol: symbol.toUpperCase(),
      });
      
      if (!data) return null;

      return {
        symbol: symbol.toUpperCase(),
        exchange: 'Aggregated',
        rate: parseFloat(data.avgRate || data.rate || '0') * 100,
        uMarginList: data.uMarginList,
      };
    } catch (error) {
      console.error('Error fetching aggregated funding rate:', error);
      return null;
    }
  }

  /**
   * Get open interest data for a symbol
   */
  async getOpenInterest(symbol: string = 'BTC'): Promise<OpenInterestData[]> {
    try {
      const data = await this.request<any[]>('/public/v2/indicator/open_interest', {
        symbol: symbol.toUpperCase(),
      });

      return (data || []).map((item: any) => ({
        symbol: symbol.toUpperCase(),
        exchange: item.exchangeName || item.exchange,
        openInterest: parseFloat(item.openInterest || '0'),
        openInterestUsd: parseFloat(item.openInterestUsd || item.openInterestAmount || '0'),
        h24Change: parseFloat(item.h24Change || item.rate24h || '0'),
      }));
    } catch (error) {
      console.error('Error fetching open interest:', error);
      return this.getMockOpenInterest(symbol);
    }
  }

  /**
   * Get aggregated open interest
   */
  async getAggregatedOpenInterest(symbol: string = 'BTC'): Promise<OpenInterestData | null> {
    try {
      const data = await this.request<any>('/public/v2/indicator/open_interest_aggregated_ohlc', {
        symbol: symbol.toUpperCase(),
        interval: '1h',
      });
      
      if (!data || !Array.isArray(data) || data.length === 0) return null;

      const latest = data[data.length - 1];
      return {
        symbol: symbol.toUpperCase(),
        openInterest: parseFloat(latest.c || '0'),
        openInterestUsd: parseFloat(latest.c || '0'),
        h24Change: 0,
      };
    } catch (error) {
      console.error('Error fetching aggregated OI:', error);
      return null;
    }
  }

  /**
   * Get liquidation data for a symbol
   */
  async getLiquidationData(symbol: string = 'BTC'): Promise<LiquidationData | null> {
    try {
      const data = await this.request<any>('/public/v2/indicator/liquidation_symbol', {
        symbol: symbol.toUpperCase(),
      });

      if (!data) return null;

      return {
        symbol: symbol.toUpperCase(),
        longLiquidationUsd: parseFloat(data.longLiquidationUsd || data.buyVolUsd || '0'),
        shortLiquidationUsd: parseFloat(data.shortLiquidationUsd || data.sellVolUsd || '0'),
        totalLiquidationUsd: parseFloat(data.totalLiquidationUsd || data.volUsd || '0'),
        h1: parseFloat(data.h1 || '0'),
        h4: parseFloat(data.h4 || '0'),
        h12: parseFloat(data.h12 || '0'),
        h24: parseFloat(data.h24 || '0'),
      };
    } catch (error) {
      console.error('Error fetching liquidation data:', error);
      return this.getMockLiquidation(symbol);
    }
  }

  /**
   * Get recent liquidation orders
   */
  async getLiquidationOrders(symbol?: string): Promise<any[]> {
    try {
      const params: Record<string, string> = {};
      if (symbol) params.symbol = symbol.toUpperCase();

      const data = await this.request<any[]>('/public/v2/liquidation_order', params);
      return data || [];
    } catch (error) {
      console.error('Error fetching liquidation orders:', error);
      return [];
    }
  }

  /**
   * Get comprehensive market sentiment for a symbol
   */
  async getMarketSentiment(symbol: string = 'BTC'): Promise<MarketSentiment> {
    const [longShortRatios, fundingRates, openInterest, liquidation] = await Promise.all([
      this.getGlobalLongShortRatio(symbol),
      this.getFundingRates(symbol),
      this.getOpenInterest(symbol),
      this.getLiquidationData(symbol),
    ]);

    // Aggregate the data
    const avgLongRate = longShortRatios.length > 0
      ? longShortRatios.reduce((sum, r) => sum + r.longRate, 0) / longShortRatios.length
      : 50;
    const avgShortRate = 100 - avgLongRate;

    const avgFundingRate = fundingRates.length > 0
      ? fundingRates.reduce((sum, r) => sum + r.rate, 0) / fundingRates.length
      : 0;

    const totalOI = openInterest.reduce((sum, o) => sum + o.openInterestUsd, 0);

    return {
      symbol,
      longShortRatio: {
        symbol,
        longRate: avgLongRate,
        shortRate: avgShortRate,
        longShortRatio: avgLongRate / avgShortRate,
      },
      fundingRate: {
        symbol,
        exchange: 'Aggregated',
        rate: avgFundingRate,
      },
      openInterest: {
        symbol,
        openInterest: totalOI,
        openInterestUsd: totalOI,
        h24Change: openInterest.length > 0 ? openInterest[0].h24Change : 0,
      },
      liquidation24h: liquidation || {
        symbol,
        longLiquidationUsd: 0,
        shortLiquidationUsd: 0,
        totalLiquidationUsd: 0,
      },
    };
  }

  /**
   * Get multi-coin dashboard data
   */
  async getMultiCoinSentiment(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<MarketSentiment[]> {
    return Promise.all(symbols.map(symbol => this.getMarketSentiment(symbol)));
  }

  // Mock data fallbacks
  private getMockLongShortRatio(symbol: string): LongShortRatioData[] {
    const baseRatio = symbol === 'BTC' ? 52 : symbol === 'ETH' ? 48 : 50;
    return [
      { symbol, exchange: 'Binance', longRate: baseRatio + 2, shortRate: 100 - baseRatio - 2, longShortRatio: (baseRatio + 2) / (100 - baseRatio - 2) },
      { symbol, exchange: 'OKX', longRate: baseRatio - 1, shortRate: 100 - baseRatio + 1, longShortRatio: (baseRatio - 1) / (100 - baseRatio + 1) },
      { symbol, exchange: 'Bybit', longRate: baseRatio, shortRate: 100 - baseRatio, longShortRatio: baseRatio / (100 - baseRatio) },
      { symbol, exchange: 'Bitget', longRate: baseRatio + 1, shortRate: 100 - baseRatio - 1, longShortRatio: (baseRatio + 1) / (100 - baseRatio - 1) },
    ];
  }

  private getMockFundingRates(symbol: string): FundingRateData[] {
    const baseRate = symbol === 'BTC' ? 0.01 : symbol === 'ETH' ? 0.008 : 0.015;
    return [
      { symbol, exchange: 'Binance', rate: baseRate },
      { symbol, exchange: 'OKX', rate: baseRate - 0.002 },
      { symbol, exchange: 'Bybit', rate: baseRate + 0.001 },
      { symbol, exchange: 'dYdX', rate: baseRate - 0.001 },
    ];
  }

  private getMockOpenInterest(symbol: string): OpenInterestData[] {
    const baseOI = symbol === 'BTC' ? 28000000000 : symbol === 'ETH' ? 12000000000 : 2000000000;
    return [
      { symbol, exchange: 'Binance', openInterest: baseOI * 0.35, openInterestUsd: baseOI * 0.35, h24Change: 2.5 },
      { symbol, exchange: 'OKX', openInterest: baseOI * 0.18, openInterestUsd: baseOI * 0.18, h24Change: 1.2 },
      { symbol, exchange: 'Bybit', openInterest: baseOI * 0.22, openInterestUsd: baseOI * 0.22, h24Change: 3.1 },
      { symbol, exchange: 'CME', openInterest: baseOI * 0.25, openInterestUsd: baseOI * 0.25, h24Change: -0.8 },
    ];
  }

  private getMockLiquidation(symbol: string): LiquidationData {
    const baseLiq = symbol === 'BTC' ? 50000000 : symbol === 'ETH' ? 25000000 : 10000000;
    return {
      symbol,
      longLiquidationUsd: baseLiq * 0.6,
      shortLiquidationUsd: baseLiq * 0.4,
      totalLiquidationUsd: baseLiq,
      h1: baseLiq * 0.05,
      h4: baseLiq * 0.15,
      h12: baseLiq * 0.4,
      h24: baseLiq,
    };
  }
}

export const coinglassClient = new CoinglassClient();
