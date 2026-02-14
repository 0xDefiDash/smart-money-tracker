# DefiDash Smart Money Tracker

Institutional-grade crypto intelligence platform for tracking smart money movements, whale activity, and market analytics across multiple blockchain networks.

## Features

### Smart Money Tracking
- Real-time whale wallet monitoring
- Smart money flow detection via Nansen API integration
- DEX trade tracking and analysis
- Multi-chain support (Ethereum, Base, BNB Chain)

### Market Intelligence
- Live price feeds from Coinglass and Nansen
- Long/Short ratio analysis
- Funding rate monitoring
- Open interest tracking
- Liquidation data aggregation

### Agentic Trading
- Defidash Agent - AI-powered trading assistant
- Multi-LLM analysis (OpenAI, Gemini, NVIDIA, Grok)
- Market sentiment analysis
- Risk assessment and trade signals

### Wallet Tracking
- Multi-chain wallet monitoring
- Transaction alerts via Telegram
- Token balance tracking
- Historical activity analysis

### Integrations
- Nansen API for smart money data
- Coinglass API for derivatives data
- AsterDex for trade execution
- Telegram for notifications
- Twitter/X for social feeds

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **APIs**: Nansen, Coinglass, Alchemy, Moralis, Etherscan

## Project Structure

```
smart_money_tracker/
├── app/                    # Next.js application
│   ├── app/               # App router pages and API routes
│   ├── components/        # React components
│   ├── lib/              # Utility functions and API clients
│   └── prisma/           # Database schema
├── docs/                  # Documentation
└── scripts/              # Utility scripts
```

## Environment Variables

Required environment variables (see `.env.example`):

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NANSEN_API_KEY=
COINGLASS_API_KEY=
ALCHEMY_API_KEY=
MORALIS_API_KEY=
TELEGRAM_BOT_TOKEN=
```

## Getting Started

1. Clone the repository
2. Install dependencies: `yarn install`
3. Set up environment variables
4. Run database migrations: `yarn prisma migrate dev`
5. Start development server: `yarn dev`

## API Documentation

See the `/docs` folder for detailed API integration guides:

- `NANSEN_API_COMPLETE_INTEGRATION.md`
- `COINGLASS_INTEGRATION.md`
- `WALLET_TRACKER_API_INTEGRATION.md`
- `TELEGRAM_BOT_INTEGRATION.md`

## License

Proprietary - All rights reserved

## Contact

For inquiries, reach out via the DefiDash platform.
