# DefiDash Smart Money Tracker

Institutional-grade crypto intelligence platform for tracking smart money movements, whale activity, and market analytics across multiple blockchain networks.

## Overview

Smart Money Tracker provides real-time insights into cryptocurrency markets by monitoring whale wallets, analyzing on-chain data, and aggregating institutional-grade market intelligence.

## Features

### Core Functionality

**Smart Money Tracking**
- Real-time whale wallet monitoring across Ethereum, Base, and BNB Chain
- Smart money flow detection via Nansen API integration
- DEX trade tracking and volume analysis
- Wallet profiling with PnL tracking

**Market Intelligence**
- Live price feeds from Coinglass and Nansen APIs
- Long/Short ratio analysis across major exchanges
- Funding rate monitoring for perpetual contracts
- Open interest tracking and liquidation alerts

**Agentic Trading**
- Defidash Agent: AI-powered trading assistant
- Multi-LLM analysis engine (OpenAI, Gemini, NVIDIA, Grok)
- Automated market sentiment analysis
- Risk assessment and trade signal generation

**Notifications**
- Telegram bot integration for real-time alerts
- Customizable watchlist monitoring
- Transaction alerts for tracked wallets

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL with Prisma ORM |
| Styling | Tailwind CSS |
| Authentication | NextAuth.js |
| Blockchain | Alchemy, Moralis, Etherscan |
| Market Data | Nansen, Coinglass, Binance |
| AI/ML | OpenAI, Gemini, NVIDIA NIM |

## Project Structure

```
smart_money_tracker/
|
|-- app/                      # Next.js application
|   |-- app/                  # Pages and API routes
|   |-- components/           # React components
|   |-- lib/                  # Utility functions and API clients
|   |-- prisma/               # Database schema and migrations
|   |-- public/               # Static assets
|   +-- services/             # Business logic services
|
|-- docs/                     # Documentation
|   |-- api/                  # API integration guides
|   +-- guides/               # Feature implementation guides
|
|-- scripts/                  # Utility scripts
|   |-- monitors/             # Wallet monitoring scripts
|   +-- testing/              # Test utilities
|
|-- .env.example              # Environment variable template
+-- README.md                 # This file
```

## Documentation

### API Integrations

| Document | Description |
|----------|-------------|
| [Nansen API Integration](docs/api/NANSEN_API_COMPLETE_INTEGRATION.md) | Complete guide for Nansen smart money data |
| [Wallet Tracker API](docs/api/WALLET_TRACKER_API_INTEGRATION.md) | Multi-chain wallet tracking setup |
| [AsterDex Integration](docs/api/ASTERDEX_LIVE_INTEGRATION.md) | Trading execution integration |
| [Swarms AI Integration](docs/api/SWARMS_AI_INTEGRATION.md) | Multi-agent AI system setup |

### Feature Guides

| Document | Description |
|----------|-------------|
| [Smart Money Tracker Guide](docs/guides/SMART_MONEY_TRACKER_GUIDE.md) | Core tracking functionality |
| [Flow Intelligence](docs/guides/FLOW_INTELLIGENCE_GUIDE.md) | Token flow analysis |
| [Real-Time Streaming](docs/guides/REAL_TIME_DATA_STREAMING.md) | Live data architecture |
| [Telegram Integration](docs/guides/TELEGRAM_BOT_INTEGRATION.md) | Bot setup and notifications |
| [Alert System](docs/guides/ALERT_SYSTEM_IMPLEMENTATION.md) | Configuring transaction alerts |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/0xDefiDash/smart-money-tracker.git
cd smart-money-tracker

# Install dependencies
cd app && yarn install

# Configure environment
cp ../.env.example .env
# Edit .env with your API keys

# Initialize database
yarn prisma migrate dev

# Start development server
yarn dev
```

### Environment Variables

See `.env.example` for required configuration:

- Database connection string
- Authentication secrets
- Blockchain API keys (Alchemy, Moralis, Etherscan)
- Market data APIs (Nansen, Coinglass)
- AI service keys (OpenAI, Gemini)
- Notification services (Telegram)

## API Endpoints

### Market Data

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prices` | GET | Current cryptocurrency prices |
| `/api/market` | GET | Market overview and metrics |
| `/api/coinglass/*` | GET | Derivatives market data |

### Wallet Tracking

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/balance` | GET | Wallet balance across chains |
| `/api/wallet/tokens` | GET | Token holdings |
| `/api/wallet/transactions` | GET | Transaction history |
| `/api/watchlist` | GET/POST/DELETE | Watchlist management |

### Smart Money

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nansen/smart-money` | GET | Smart money movements |
| `/api/nansen/whale-activity` | GET | Whale transaction feed |
| `/api/nansen/token-intelligence` | POST | Token flow analysis |

## Contributing

This is a private repository. Contact the team for contribution guidelines.

## License

Proprietary - All rights reserved.
