
# Nansen API Integration - Institutional-Grade Blockchain Intelligence

## 🎯 Overview

Smart Money Tracker is now powered by **Nansen API**, providing institutional-grade blockchain intelligence and Smart Money tracking. This integration gives users access to data from the top 5,000 highest-performing wallets in crypto, ranked by realized profit, win rate, and consistent performance across market cycles.

---

## 🚀 Key Capabilities

### 1. **Smart Money Tracking**
- **Netflows**: Track what tokens Smart Money wallets are buying and selling in real-time
- **Holdings**: Monitor current token positions of top-performing wallets
- **DEX Trades**: View recent decentralized exchange trading activity from Smart Money
- **Labels**: Identify wallets by category (30D Smart Trader, 90D Smart Trader, Fund, etc.)

### 2. **Whale Activity Intelligence**
- **Large Transfers**: Monitor significant token movements
- **PnL Leaderboard**: Track top-performing traders by profit/loss, ROI, and win rate
- **Recent Buyers/Sellers**: Identify whale wallets buying or selling specific tokens
- **Performance Metrics**: View realized/unrealized PnL, total trades, and win rates

### 3. **Token Intelligence**
- **Token Screener**: Discover trending tokens with customizable filters
- **Flow Intelligence**: Analyze token flows across Smart Money, exchanges, whales, and fresh wallets
- **Holder Analysis**: View top token holders with labels and classifications
- **Market Activity**: Track DEX trades, transfers, and buy/sell pressure

### 4. **Wallet Profiling**
- **Deep Analysis**: Comprehensive wallet profiling including balance, transactions, PnL
- **Classification**: Automatic labeling (Smart Money, Exchange, Whale, etc.)
- **Related Wallets**: Discover first-degree connections
- **Performance History**: View trading history, top trades, and counterparties

---

## 📡 API Endpoints

### Smart Money API
```
GET /api/nansen/smart-money?chain=ethereum&type=all&timeframe=24h&limit=50
```

**Parameters:**
- `chain`: Blockchain network (ethereum, base, bnb, polygon, arbitrum, optimism, solana)
- `type`: Data type (netflows, holdings, trades, or all)
- `timeframe`: Time period (24h, 7d, 30d)
- `limit`: Number of results

**Response:**
```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "timeframe": "24h",
    "netflows": [...],
    "holdings": [...],
    "dexTrades": [...]
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

---

### Whale Activity API
```
GET /api/nansen/whale-activity?chain=ethereum&tokenAddress=0x...&timeframe=24h&limit=50
```

**Parameters:**
- `chain`: Blockchain network
- `tokenAddress`: (Optional) Specific token to analyze
- `timeframe`: Time period
- `limit`: Number of results

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x...",
    "chain": "ethereum",
    "timeframe": "24h",
    "transfers": [...],
    "whoBoughtSold": {...},
    "pnlLeaderboard": [...]
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

---

### Token Intelligence API
```
GET /api/nansen/token-intelligence?action=screener&chain=ethereum&minMarketCap=1000000&limit=50
```

**Actions:**
- `screener`: Discover and filter tokens
- `analyze`: Deep analysis of specific token (requires `tokenAddress`)

**Screener Parameters:**
- `chain`: Blockchain network
- `minMarketCap`: Minimum market cap filter
- `minVolume24h`: Minimum 24h volume
- `minPriceChange24h`: Minimum price change percentage
- `minSmartMoneyHolders`: Minimum number of Smart Money holders
- `limit`: Number of results

**Analyze Parameters:**
- `tokenAddress`: Token contract address (required)
- `chain`: Blockchain network
- `timeframe`: Analysis period
- `limit`: Number of holders/transactions

**Response (Screener):**
```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "filters": {...},
    "tokens": [...],
    "count": 50
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

**Response (Analyze):**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x...",
    "chain": "ethereum",
    "timeframe": "24h",
    "flowIntelligence": {...},
    "holders": [...],
    "whoBoughtSold": {...},
    "analysis": {
      "smartMoneyActivity": 1500000,
      "exchangeFlow": -2000000,
      "whaleActivity": 500000
    }
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

---

### Wallet Analysis API
```
GET /api/nansen/wallet-analysis?address=0x...&chain=ethereum&detailed=true&timeframe=30d
```

**Parameters:**
- `address`: Wallet address (required)
- `chain`: Blockchain network
- `detailed`: Boolean (true for full analysis, false for labels only)
- `timeframe`: Analysis period for PnL (30d, 90d, 180d)

**Response (Quick):**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "chain": "ethereum",
    "labels": ["Smart Money", "30D Smart Trader"],
    "entityName": "Example Fund",
    "isSmartMoney": true,
    "isExchange": false,
    "isWhale": true
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

**Response (Detailed):**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "chain": "ethereum",
    "timeframe": "30d",
    "labels": [...],
    "entityName": "Example Fund",
    "classification": {
      "isSmartMoney": true,
      "isExchange": false,
      "isWhale": true
    },
    "balance": {...},
    "recentTransactions": [...],
    "performance": {
      "totalRealizedPnl": 5000000,
      "totalUnrealizedPnl": 2000000,
      "totalPnl": 7000000,
      "roi": 0.45,
      "winRate": 0.72,
      "totalTrades": 150
    },
    "relatedWallets": [...]
  },
  "source": "nansen",
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

---

### Status Check API
```
GET /api/nansen/status
```

**Response:**
```json
{
  "configured": true,
  "working": true,
  "timestamp": "2025-11-18T15:00:00.000Z"
}
```

---

## 🤖 AI Chatbot Integration

The DefiDash Agent chatbot now has **real-time access** to Nansen Smart Money intelligence. It can:

1. **Answer Questions About Smart Money Activity**
   - "What are Smart Money wallets buying right now?"
   - "Show me the top Smart Money holdings"
   - "Which whales are most profitable?"

2. **Provide Token Analysis**
   - "Analyze this token address using Nansen data"
   - "What's the Smart Money sentiment on ETH?"
   - "Show me token flow intelligence for [token]"

3. **Profile Wallets**
   - "Is this wallet considered Smart Money?"
   - "What's the PnL of this address?"
   - "Show me related wallets for [address]"

### Example Chat Queries:

```
User: What are Smart Money wallets buying today?
Agent: According to current Nansen data, Smart Money wallets (top 5,000 performers) 
       are showing strong buying activity in:
       - ETH: +$15.2M net inflow from 847 Smart Money wallets
       - LINK: +$8.7M net inflow from 423 wallets
       - [Additional data from live context]
```

```
User: Who are the top whale performers?
Agent: Based on Nansen's PnL Leaderboard:
       1. Wallet ABC...DEF: $12.5M total PnL, 78% win rate, 245 trades
       2. Wallet XYZ...123: $9.8M total PnL, 82% win rate, 189 trades
       [Additional data from live context]
```

---

## 🔧 Configuration

### Environment Variables
```bash
NANSEN_API_KEY=QpQGxaiUSPhf8oxAISrgStYW2lXg9rOJ
```

### Supported Chains
- Ethereum (`ethereum`)
- Base (`base`)
- BNB Smart Chain (`bnb`)
- Polygon (`polygon`)
- Arbitrum (`arbitrum`)
- Optimism (`optimism`)
- Solana (`solana`)

---

## 📊 Data Sources

### Nansen's Data Labeling System
Nansen applies unique, human-readable labels to hundreds of millions of blockchain addresses:
- **Smart Money Labels**: 30D/90D/180D Smart Trader, Fund
- **Entity Labels**: Exchange, Market Maker, Public Figure, Whale
- **Activity Labels**: Fresh Wallet, Top PnL Trader

### Data Quality
- **Top 5,000 Wallets**: Ranked by realized profit and win rate
- **Real-time Updates**: Typical latency within seconds
- **Multi-Chain Coverage**: 25+ blockchain networks
- **Proprietary Intelligence**: Data not available elsewhere

---

## 💾 Caching Strategy

The Nansen client implements intelligent caching:
- **Cache Duration**: 5 minutes
- **In-Memory Storage**: Fast access to recent queries
- **Automatic Refresh**: Expired cache entries are updated automatically
- **Manual Clear**: Use `clearNansenCache()` to force refresh

---

## 🔐 Security

- API key stored securely in environment variables
- Never exposed in client-side code
- Request timeout: 30 seconds
- Error handling with fallback messages

---

## 📈 Use Cases

### 1. **Trading Strategy Development**
- Follow Smart Money signals for entry/exit points
- Identify tokens with strong institutional interest
- Monitor whale accumulation/distribution patterns

### 2. **Risk Assessment**
- Check if a wallet is labeled as Smart Money
- Analyze holder composition of tokens
- Track exchange inflows/outflows

### 3. **Market Research**
- Discover trending tokens before mainstream attention
- Analyze token flow patterns
- Study successful trader strategies

### 4. **Portfolio Management**
- Copy trades from top-performing wallets
- Monitor similar wallets to yours
- Track performance metrics over time

---

## 🚀 Future Enhancements

### Planned Features
1. **Hyperliquid Integration**: Perpetual trading analytics
2. **DeFi Positions**: Track DeFi holdings across protocols
3. **Historical Data**: Access to historical Smart Money activity
4. **Custom Alerts**: Notifications for Smart Money movements
5. **Advanced Filters**: More granular token screening
6. **NFT Tracking**: Smart Money activity in NFT markets

### API Expansion
- Jupiter DCA tracking on Solana
- Cross-chain flow analysis
- Enhanced wallet relationship mapping
- Real-time WebSocket feeds

---

## 📚 Resources

- **Nansen Documentation**: https://docs.nansen.ai/
- **API Endpoints**: https://docs.nansen.ai/endpoints-overview
- **Use Cases**: https://docs.nansen.ai/getting-started/use-case-templates/simple-use-cases
- **Support**: Check `/api/nansen/status` for API health

---

## ✅ Integration Status

- ✅ Nansen API Client Library
- ✅ Smart Money Tracking Endpoints
- ✅ Whale Activity Endpoints
- ✅ Token Intelligence Endpoints
- ✅ Wallet Analysis Endpoints
- ✅ AI Chatbot Integration
- ✅ Real-time Data Feeds
- ✅ Multi-Chain Support
- ✅ Comprehensive Documentation

---

## 🎉 Result

Smart Money Tracker now provides **institutional-grade blockchain intelligence** powered by Nansen, giving users the same data and insights used by professional crypto funds, market makers, and top traders.

**Last Updated**: November 18, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
