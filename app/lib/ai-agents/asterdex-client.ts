// AsterDex API Client for Perpetuals Trading
// Enhanced with full trading capabilities

import crypto from 'crypto';
import { AsterDexOrder, AsterDexPosition, AsterDexAccount } from './agent-types';

interface AsterDexConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface MarketTicker {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openPrice: number;
  closeTime: number;
}

export interface OrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  lastUpdateId: number;
}

export interface TradeHistory {
  id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  commission: number;
  commissionAsset: string;
  time: number;
  realizedPnl: number;
}

export interface FundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  markPrice: number;
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export class AsterDexClient {
  private config: AsterDexConfig;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.ASTERDEX_API_KEY || '';
    const secretKey = process.env.ASTERDEX_SECRET_KEY || '';
    
    this.config = {
      apiKey,
      secretKey,
      baseUrl: 'https://fapi.asterdex.com'
    };
    
    this.isConfigured = apiKey.length > 10 && secretKey.length > 10;
  }

  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(queryString)
      .digest('hex');
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {},
    signed: boolean = false
  ): Promise<any> {
    // Return mock data if not configured
    if (!this.isConfigured) {
      return this.getMockResponse(endpoint, params);
    }

    try {
      const timestamp = Date.now();
      const queryParams = signed 
        ? { ...params, timestamp: timestamp.toString() }
        : params;
      
      const queryString = Object.keys(queryParams).length > 0
        ? new URLSearchParams(queryParams as Record<string, string>).toString()
        : '';

      let url = `${this.config.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'X-MBX-APIKEY': this.config.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      if (signed && queryString) {
        const signature = this.generateSignature(queryString);
        url += `?${queryString}&signature=${signature}`;
      } else if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        ...(method !== 'GET' && queryString && { body: queryString })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('AsterDex API error:', data);
        throw new Error(data.msg || `AsterDex API error: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('AsterDex API request failed:', error);
      throw error;
    }
  }

  private getMockResponse(endpoint: string, params: Record<string, any>): any {
    // Mock responses for demo mode
    if (endpoint.includes('/balance')) {
      return [{
        accountAlias: 'FutureDemoAccount',
        asset: 'USDT',
        balance: '100000.00',
        crossWalletBalance: '85000.00',
        crossUnPnl: '2500.00',
        availableBalance: '85000.00',
        maxWithdrawAmount: '85000.00'
      }];
    }

    if (endpoint.includes('/account')) {
      return {
        totalWalletBalance: '100000.00',
        totalUnrealizedProfit: '2500.00',
        totalMarginBalance: '102500.00',
        availableBalance: '85000.00',
        positions: [],
        assets: [{
          asset: 'USDT',
          walletBalance: '100000.00',
          unrealizedProfit: '2500.00',
          marginBalance: '102500.00',
          availableBalance: '85000.00'
        }]
      };
    }

    if (endpoint.includes('/positionRisk')) {
      return [
        {
          symbol: 'BTCUSDT',
          positionAmt: '0.5',
          entryPrice: '95000.00',
          markPrice: '96500.00',
          unRealizedProfit: '750.00',
          liquidationPrice: '85000.00',
          leverage: '10',
          marginType: 'cross',
          isolatedMargin: '0',
          positionSide: 'LONG'
        },
        {
          symbol: 'ETHUSDT',
          positionAmt: '-2.0',
          entryPrice: '3500.00',
          markPrice: '3450.00',
          unRealizedProfit: '100.00',
          liquidationPrice: '4200.00',
          leverage: '5',
          marginType: 'isolated',
          isolatedMargin: '1400.00',
          positionSide: 'SHORT'
        }
      ];
    }

    if (endpoint.includes('/order') && !endpoint.includes('openOrders')) {
      return {
        orderId: Date.now(),
        symbol: params.symbol || 'BTCUSDT',
        status: 'NEW',
        clientOrderId: `demo_${Date.now()}`,
        price: params.price || '0',
        avgPrice: '0',
        origQty: params.quantity || '0.01',
        executedQty: '0',
        cumQuote: '0',
        timeInForce: params.timeInForce || 'GTC',
        type: params.type || 'MARKET',
        side: params.side || 'BUY',
        stopPrice: '0',
        workingType: 'CONTRACT_PRICE',
        updateTime: Date.now()
      };
    }

    if (endpoint.includes('/openOrders')) {
      return [
        {
          orderId: 123456789,
          symbol: 'BTCUSDT',
          status: 'NEW',
          price: '94000.00',
          origQty: '0.1',
          executedQty: '0',
          type: 'LIMIT',
          side: 'BUY',
          time: Date.now() - 3600000
        }
      ];
    }

    if (endpoint.includes('/ticker/24hr')) {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
      const mockTickers = symbols.map(symbol => ({
        symbol,
        lastPrice: symbol === 'BTCUSDT' ? '96500.00' : symbol === 'ETHUSDT' ? '3450.00' : symbol === 'BNBUSDT' ? '620.00' : symbol === 'SOLUSDT' ? '185.00' : '2.15',
        priceChange: symbol === 'BTCUSDT' ? '1250.00' : '25.00',
        priceChangePercent: symbol === 'BTCUSDT' ? '1.31' : '0.73',
        highPrice: symbol === 'BTCUSDT' ? '97200.00' : '3520.00',
        lowPrice: symbol === 'BTCUSDT' ? '94800.00' : '3380.00',
        volume: '125000',
        quoteVolume: '5437500000',
        openPrice: symbol === 'BTCUSDT' ? '95250.00' : '3425.00',
        closeTime: Date.now()
      }));

      if (params.symbol) {
        return mockTickers.find(t => t.symbol === params.symbol) || mockTickers[0];
      }
      return mockTickers;
    }

    if (endpoint.includes('/depth')) {
      return {
        lastUpdateId: Date.now(),
        bids: [
          ['96450.00', '1.5'],
          ['96400.00', '2.3'],
          ['96350.00', '3.1'],
          ['96300.00', '4.2'],
          ['96250.00', '5.0']
        ],
        asks: [
          ['96550.00', '1.2'],
          ['96600.00', '2.1'],
          ['96650.00', '2.8'],
          ['96700.00', '3.5'],
          ['96750.00', '4.0']
        ]
      };
    }

    if (endpoint.includes('/userTrades')) {
      return [
        {
          id: 1001,
          symbol: 'BTCUSDT',
          side: 'BUY',
          price: '95000.00',
          qty: '0.5',
          commission: '9.50',
          commissionAsset: 'USDT',
          time: Date.now() - 86400000,
          realizedPnl: '0'
        },
        {
          id: 1002,
          symbol: 'ETHUSDT',
          side: 'SELL',
          price: '3500.00',
          qty: '2.0',
          commission: '7.00',
          commissionAsset: 'USDT',
          time: Date.now() - 43200000,
          realizedPnl: '100.00'
        }
      ];
    }

    if (endpoint.includes('/fundingRate')) {
      return [
        {
          symbol: 'BTCUSDT',
          fundingRate: '0.0001',
          fundingTime: Date.now(),
          markPrice: '96500.00'
        }
      ];
    }

    if (endpoint.includes('/klines')) {
      const klines = [];
      const now = Date.now();
      for (let i = 99; i >= 0; i--) {
        const time = now - i * 3600000;
        const base = 96000 + Math.random() * 1000;
        klines.push([
          time,
          (base - 200).toFixed(2),
          (base + 300).toFixed(2),
          (base - 400).toFixed(2),
          base.toFixed(2),
          (Math.random() * 1000).toFixed(2),
          time + 3599999
        ]);
      }
      return klines;
    }

    if (endpoint.includes('/exchangeInfo')) {
      return {
        timezone: 'UTC',
        serverTime: Date.now(),
        symbols: [
          { symbol: 'BTCUSDT', status: 'TRADING', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 3 },
          { symbol: 'ETHUSDT', status: 'TRADING', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 3 },
          { symbol: 'BNBUSDT', status: 'TRADING', baseAsset: 'BNB', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 2 },
          { symbol: 'SOLUSDT', status: 'TRADING', baseAsset: 'SOL', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 0 },
          { symbol: 'XRPUSDT', status: 'TRADING', baseAsset: 'XRP', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1 }
        ]
      };
    }

    return {};
  }

  // === Account Methods ===

  async getAccount(): Promise<AsterDexAccount> {
    const data = await this.makeRequest('/fapi/v2/account', 'GET', {}, true);
    
    return {
      totalBalance: parseFloat(data.totalWalletBalance) || 100000,
      availableBalance: parseFloat(data.availableBalance) || 85000,
      totalUnrealizedPnl: parseFloat(data.totalUnrealizedProfit) || 0,
      totalMarginUsed: parseFloat(data.totalMarginBalance) - parseFloat(data.availableBalance) || 0,
      positions: data.positions || []
    };
  }

  async getBalance(): Promise<{ asset: string; balance: number; available: number; unrealizedPnl: number }[]> {
    const data = await this.makeRequest('/fapi/v2/balance', 'GET', {}, true);
    
    return (Array.isArray(data) ? data : []).map((b: any) => ({
      asset: b.asset,
      balance: parseFloat(b.balance) || 0,
      available: parseFloat(b.availableBalance) || 0,
      unrealizedPnl: parseFloat(b.crossUnPnl) || 0
    }));
  }

  async getPositions(): Promise<AsterDexPosition[]> {
    const data = await this.makeRequest('/fapi/v2/positionRisk', 'GET', {}, true);
    
    if (!Array.isArray(data)) return [];
    
    return data
      .filter((p: any) => parseFloat(p.positionAmt) !== 0)
      .map((p: any) => ({
        symbol: p.symbol,
        side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
        size: Math.abs(parseFloat(p.positionAmt)),
        entryPrice: parseFloat(p.entryPrice),
        markPrice: parseFloat(p.markPrice),
        liquidationPrice: parseFloat(p.liquidationPrice),
        leverage: parseInt(p.leverage),
        unrealizedPnl: parseFloat(p.unRealizedProfit),
        realizedPnl: 0,
        marginType: p.marginType,
        isolatedMargin: parseFloat(p.isolatedMargin) || 0
      }));
  }

  // === Trading Methods ===

  async placeOrder(order: AsterDexOrder): Promise<any> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity.toString()
    };

    if (order.type === 'LIMIT' && order.price) {
      params.price = order.price.toString();
      params.timeInForce = 'GTC';
    }

    if (order.stopPrice) {
      params.stopPrice = order.stopPrice.toString();
    }

    if (order.reduceOnly) {
      params.reduceOnly = 'true';
    }

    if (order.leverage) {
      await this.setLeverage(order.symbol, order.leverage);
    }

    return await this.makeRequest('/fapi/v1/order', 'POST', params, true);
  }

  async cancelOrder(symbol: string, orderId: number): Promise<any> {
    return await this.makeRequest('/fapi/v1/order', 'DELETE', {
      symbol,
      orderId: orderId.toString()
    }, true);
  }

  async cancelAllOrders(symbol: string): Promise<any> {
    return await this.makeRequest('/fapi/v1/allOpenOrders', 'DELETE', {
      symbol
    }, true);
  }

  async getOpenOrders(symbol?: string): Promise<any[]> {
    const params: Record<string, any> = {};
    if (symbol) params.symbol = symbol;
    
    return await this.makeRequest('/fapi/v1/openOrders', 'GET', params, true);
  }

  async closePosition(symbol: string): Promise<any> {
    const positions = await this.getPositions();
    const position = positions.find(p => p.symbol === symbol);
    
    if (!position) {
      throw new Error(`No open position found for ${symbol}`);
    }

    return await this.placeOrder({
      symbol,
      side: position.side === 'LONG' ? 'SELL' : 'BUY',
      type: 'MARKET',
      quantity: position.size,
      reduceOnly: true
    });
  }

  async setLeverage(symbol: string, leverage: number): Promise<any> {
    return await this.makeRequest('/fapi/v1/leverage', 'POST', {
      symbol,
      leverage: leverage.toString()
    }, true);
  }

  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSSED'): Promise<any> {
    return await this.makeRequest('/fapi/v1/marginType', 'POST', {
      symbol,
      marginType
    }, true);
  }

  // === Market Data Methods ===

  async getMarketPrice(symbol: string): Promise<number> {
    const data = await this.makeRequest('/fapi/v1/ticker/24hr', 'GET', { symbol });
    return parseFloat(data.lastPrice) || 0;
  }

  async getTicker(symbol: string): Promise<MarketTicker> {
    const data = await this.makeRequest('/fapi/v1/ticker/24hr', 'GET', { symbol });
    return {
      symbol: data.symbol,
      lastPrice: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
      openPrice: parseFloat(data.openPrice),
      closeTime: data.closeTime
    };
  }

  async getAllTickers(): Promise<MarketTicker[]> {
    const data = await this.makeRequest('/fapi/v1/ticker/24hr', 'GET', {});
    return (Array.isArray(data) ? data : [data]).map((t: any) => ({
      symbol: t.symbol,
      lastPrice: parseFloat(t.lastPrice),
      priceChange: parseFloat(t.priceChange),
      priceChangePercent: parseFloat(t.priceChangePercent),
      highPrice: parseFloat(t.highPrice),
      lowPrice: parseFloat(t.lowPrice),
      volume: parseFloat(t.volume),
      quoteVolume: parseFloat(t.quoteVolume),
      openPrice: parseFloat(t.openPrice),
      closeTime: t.closeTime
    }));
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    const data = await this.makeRequest('/fapi/v1/depth', 'GET', { symbol, limit });
    return {
      symbol,
      bids: data.bids.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]),
      asks: data.asks.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]),
      lastUpdateId: data.lastUpdateId
    };
  }

  async getKlines(symbol: string, interval: string = '1h', limit: number = 100): Promise<Kline[]> {
    const data = await this.makeRequest('/fapi/v1/klines', 'GET', { symbol, interval, limit });
    return data.map((k: any[]) => ({
      openTime: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      closeTime: k[6]
    }));
  }

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const data = await this.makeRequest('/fapi/v1/fundingRate', 'GET', { symbol, limit: 1 });
    const latest = Array.isArray(data) ? data[0] : data;
    return {
      symbol: latest.symbol,
      fundingRate: parseFloat(latest.fundingRate),
      fundingTime: latest.fundingTime,
      markPrice: parseFloat(latest.markPrice)
    };
  }

  async getExchangeInfo(): Promise<any> {
    return await this.makeRequest('/fapi/v1/exchangeInfo', 'GET', {});
  }

  // === Trade History ===

  async getTradeHistory(symbol?: string, limit: number = 50): Promise<TradeHistory[]> {
    const params: Record<string, any> = { limit };
    if (symbol) params.symbol = symbol;
    
    const data = await this.makeRequest('/fapi/v1/userTrades', 'GET', params, true);
    return (Array.isArray(data) ? data : []).map((t: any) => ({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      price: parseFloat(t.price),
      qty: parseFloat(t.qty),
      commission: parseFloat(t.commission),
      commissionAsset: t.commissionAsset,
      time: t.time,
      realizedPnl: parseFloat(t.realizedPnl) || 0
    }));
  }

  // === Utility Methods ===

  async getMarketData(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']) {
    const tickers = await this.getAllTickers();
    return tickers
      .filter(t => symbols.includes(t.symbol))
      .map(data => ({
        symbol: data.symbol,
        price: data.lastPrice,
        priceChange24h: data.priceChangePercent,
        volume24h: data.quoteVolume,
        high24h: data.highPrice,
        low24h: data.lowPrice,
        sentiment: data.priceChangePercent > 0 ? 'bullish' as const : 'bearish' as const
      }));
  }

  isApiConfigured(): boolean {
    return this.isConfigured;
  }

  // Calculate PnL percentage
  calculatePnlPercent(position: AsterDexPosition): number {
    if (position.entryPrice === 0) return 0;
    const priceDiff = position.side === 'LONG' 
      ? position.markPrice - position.entryPrice
      : position.entryPrice - position.markPrice;
    return (priceDiff / position.entryPrice) * 100 * position.leverage;
  }
}

export const asterDexClient = new AsterDexClient();
