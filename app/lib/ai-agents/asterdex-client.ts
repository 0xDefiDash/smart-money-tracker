// AsterDex API Client for Perpetuals Trading

import crypto from 'crypto';
import { AsterDexOrder, AsterDexPosition, AsterDexAccount } from './agent-types';

interface AsterDexConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export class AsterDexClient {
  private config: AsterDexConfig;

  constructor() {
    // Demo mode configuration
    this.config = {
      apiKey: process.env.ASTERDEX_API_KEY || 'demo_key',
      secretKey: process.env.ASTERDEX_SECRET_KEY || 'demo_secret',
      baseUrl: 'https://fapi.asterdex.com'
    };
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
    // Demo mode - return mock data
    if (this.config.apiKey === 'demo_key') {
      return this.getMockResponse(endpoint, params);
    }

    try {
      const timestamp = Date.now();
      const queryParams = { ...params, timestamp: timestamp.toString() };
      const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();

      let url = `${this.config.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'X-MBX-APIKEY': this.config.apiKey,
        'Content-Type': 'application/json'
      };

      if (signed) {
        const signature = this.generateSignature(queryString);
        url += `?${queryString}&signature=${signature}`;
      } else if (method === 'GET' && queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        ...(method !== 'GET' && { body: JSON.stringify(params) })
      });

      if (!response.ok) {
        throw new Error(`AsterDex API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AsterDex API request failed:', error);
      return this.getMockResponse(endpoint, params);
    }
  }

  private getMockResponse(endpoint: string, params: Record<string, any>): any {
    // Mock responses for demo mode
    if (endpoint.includes('/account')) {
      return {
        totalBalance: 100000,
        availableBalance: 85000,
        totalUnrealizedPnl: 2500,
        totalMarginUsed: 15000,
        positions: []
      };
    }

    if (endpoint.includes('/positionRisk')) {
      return [];
    }

    if (endpoint.includes('/order')) {
      return {
        orderId: Date.now(),
        symbol: params.symbol,
        status: 'FILLED',
        side: params.side,
        price: params.price,
        quantity: params.quantity,
        executedQty: params.quantity
      };
    }

    if (endpoint.includes('/ticker/24hr')) {
      return {
        symbol: params.symbol || 'BTCUSDT',
        lastPrice: '43500.00',
        priceChange: '1250.00',
        priceChangePercent: '2.95',
        volume: '125000',
        quoteVolume: '5437500000'
      };
    }

    return {};
  }

  async getAccount(): Promise<AsterDexAccount> {
    const data = await this.makeRequest('/fapi/v2/balance', 'GET', {}, true);
    
    return {
      totalBalance: data.totalBalance || 100000,
      availableBalance: data.availableBalance || 85000,
      totalUnrealizedPnl: data.totalUnrealizedPnl || 0,
      totalMarginUsed: data.totalMarginUsed || 0,
      positions: data.positions || []
    };
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
        marginType: p.marginType
      }));
  }

  async placeOrder(order: AsterDexOrder): Promise<any> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity
    };

    if (order.type === 'LIMIT' && order.price) {
      params.price = order.price;
      params.timeInForce = 'GTC';
    }

    if (order.leverage) {
      // Set leverage first
      await this.makeRequest('/fapi/v1/leverage', 'POST', {
        symbol: order.symbol,
        leverage: order.leverage
      }, true);
    }

    return await this.makeRequest('/fapi/v1/order', 'POST', params, true);
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
      quantity: position.size
    });
  }

  async getMarketPrice(symbol: string): Promise<number> {
    const data = await this.makeRequest('/fapi/v1/ticker/24hr', 'GET', { symbol });
    return parseFloat(data.lastPrice) || 0;
  }

  async getMarketData(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']) {
    const promises = symbols.map(symbol => 
      this.makeRequest('/fapi/v1/ticker/24hr', 'GET', { symbol })
    );
    
    const results = await Promise.all(promises);
    
    return results.map((data, index) => ({
      symbol: symbols[index],
      price: parseFloat(data.lastPrice) || 0,
      priceChange24h: parseFloat(data.priceChangePercent) || 0,
      volume24h: parseFloat(data.quoteVolume) || 0,
      sentiment: parseFloat(data.priceChangePercent) > 0 ? 'bullish' as const : 'bearish' as const
    }));
  }
}

export const asterDexClient = new AsterDexClient();
