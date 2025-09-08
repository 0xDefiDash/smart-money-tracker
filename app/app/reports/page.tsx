
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Activity
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { useState, useEffect } from 'react'

// Market Analysis Reports Data - Updated for September 6, 2025
const marketReports = [
  {
    id: 'daily-2025-09-06',
    title: 'Daily Market Analysis - Bitcoin Soars to $138,750 ATH',
    type: 'Daily Report',
    date: '2025-09-06',
    author: 'Smart Money Analytics Team',
    readTime: '9 min read',
    status: 'published',
    priority: 'high',
    tags: ['Bitcoin', 'ATH', 'Whale Activity', 'Institutional', 'Market Analysis'],
    summary: 'Bitcoin reaches new all-time high at $138,750 driven by massive institutional inflows and unprecedented whale accumulation. Market cap surpasses $3.15T with strong momentum across all sectors.',
    content: `
# Bitcoin Reaches New All-Time High: $138,750 Market Analysis

## Executive Summary
Bitcoin (BTC) has shattered all previous records, reaching a new all-time high of $138,750 on September 6, 2025, representing a remarkable +6.28% gain in 24 hours. This historic milestone is driven by unprecedented institutional adoption, massive whale accumulation, and positive global regulatory developments.

## Key Market Movements - September 6, 2025
- **Bitcoin (BTC)**: $138,750 (+6.28%) - NEW ALL-TIME HIGH
- **Ethereum (ETH)**: $2,610 (+4.85%) - Strong momentum following BTC
- **Solana (SOL)**: $547 (+8.92%) - Ecosystem growth continues
- **Total Market Cap**: $3.15T (+6.28%) - Historic milestone
- **24h Trading Volume**: $142.3B (+12.75%)

## Unprecedented Whale Activity
Our monitoring systems have detected the largest whale accumulation event in cryptocurrency history:
- **623 active whale wallets** participated in today's rally
- **$47.3 billion** in whale transaction volume (24h record)
- **Net accumulation** of 45,000+ BTC by institutional wallets
- **67 new whale addresses** emerged with $100M+ holdings
- **Average transaction size**: $4.18M (up 18.9% from yesterday)

## Technical Analysis Breakdown
### Critical Levels Shattered
- **Previous ATH**: $73,800 (November 2021) - OBLITERATED
- **Current Price**: $138,750
- **Next Major Resistance**: $145,000 - $150,000
- **Strong Support**: $135,000 - $137,000
- **RSI**: 78.5 (Overbought but momentum strong)
- **MACD**: Extremely bullish crossover

### Exchange Flow Analysis - Bullish Signals Everywhere
- **Massive Net Outflows**: $2.1B from all major exchanges
- **Binance**: +$47M net inflow (institutional accumulation)
- **Coinbase**: -$22M net outflow (HODLing behavior)
- **Bybit**: -$22M net outflow (retail to cold storage)
- **Exchange Reserves**: At 2-year lows across all platforms

## Institutional Adoption Acceleration
### Major Announcements This Week
1. **BlackRock Digital Assets**: $2.34B additional BTC allocation
2. **Sovereign Wealth Fund Alpha**: $2.89B new crypto treasury
3. **Grayscale**: Launched 5 new crypto products
4. **Fidelity**: Opened crypto trading to all retail clients
5. **MicroStrategy**: Announced $1B additional BTC purchase plan

### Corporate Treasury Updates
- **47 S&P 500 companies** now hold Bitcoin on balance sheets
- **$89.5B total corporate BTC holdings** (up from $12B in 2024)
- **Average allocation**: 5.2% of corporate cash reserves
- **Trend acceleration**: 15 new corporate announcements this quarter

## DeFi Ecosystem Surge
### Total Value Locked Explosion
- **DeFi TVL**: $127.8B (+15.7% this week)
- **Lending Protocols**: $45.2B (+12.3%)
- **DEX Volume**: $28.7B daily average
- **Yield Farming**: Record $18.9B locked
- **Cross-chain Bridges**: $8.4B in 24h volume

### Top DeFi Performers
- **Uniswap V3**: 24.75% APY pools available
- **Aave V3**: Record $12.89B TVL
- **Compound**: $3.89B TVL with institutional grade features
- **Curve**: Multi-billion dollar stable swaps

## Global Regulatory Catalyst
### Positive Developments Worldwide
1. **United States**: SEC approves Bitcoin spot ETF options trading
2. **European Union**: MiCA framework provides regulatory clarity
3. **Singapore**: Expanded crypto banking services for institutions
4. **Japan**: Tax optimization for crypto trading firms
5. **UAE**: Dubai establishes $10B crypto innovation fund

## Market Sentiment Analysis
### Fear & Greed Index: 89 (Extreme Greed)
- **Social Media Sentiment**: 94% bullish mentions
- **Google Trends**: "Buy Bitcoin" at all-time high search volume
- **Options Market**: Extreme bullish positioning
- **Futures**: Record long positions, minimal liquidations
- **Institutional Surveys**: 87% expect further upside

## Risk Assessment & Warnings
### Positive Factors
- **Institutional Infrastructure**: Mature custody and trading solutions
- **Regulatory Clarity**: Clear frameworks in major jurisdictions
- **Technological Development**: Lightning Network, Layer 2 scaling
- **Global Adoption**: 15% of global population now owns crypto

### Risk Considerations
- **Extreme Valuation**: Price discovery in uncharted territory
- **Potential Correction**: 20-30% pullbacks historically normal
- **Regulatory Changes**: Policy shifts could impact sentiment
- **Market Manipulation**: Increased scrutiny from regulators
- **Technical Analysis**: Severely overbought conditions

## Price Targets & Predictions
### Short-term (1-4 weeks)
- **Conservative**: $140,000 - $145,000
- **Optimistic**: $150,000 - $160,000
- **Support Levels**: $130,000, $125,000, $120,000

### Medium-term (3-6 months)  
- **Conservative**: $145,000 - $165,000
- **Bull Case**: $180,000 - $200,000
- **Bear Case**: $100,000 - $120,000 (healthy correction)

## Strategic Recommendations
### For Institutional Investors
1. **Dollar-Cost Averaging**: Continue systematic accumulation
2. **Risk Management**: Maintain 5-10% portfolio allocation maximum
3. **Custody Solutions**: Use regulated, insured custody providers
4. **Compliance**: Ensure full regulatory compliance in all jurisdictions

### For Retail Investors
1. **Take Profits**: Consider reducing positions at these levels
2. **Risk Assessment**: Don't invest more than you can afford to lose
3. **Education**: Understand the technology and market dynamics
4. **Long-term Perspective**: Focus on 5-10 year adoption timeline

## Conclusion
September 6, 2025 will be remembered as a historic day in cryptocurrency history. Bitcoin's breakthrough to $138,750 represents not just a new price milestone, but validation of the digital asset's evolution into a mature, institutionally-accepted store of value. While current valuations suggest caution, the fundamental adoption trends and infrastructure development support continued long-term growth.

The convergence of institutional adoption, regulatory clarity, and technological advancement has created the perfect storm for this unprecedented rally. However, investors should prepare for increased volatility and potential corrections as the market digests these historic gains.

**Market Status**: HISTORIC BULLISH MOMENTUM - PROCEED WITH CALCULATED OPTIMISM
    `,
    metrics: {
      views: 8947,
      likes: 456,
      shares: 89
    }
  },
  {
    id: 'weekly-2025-09-05',
    title: 'Weekly DeFi Report: Record-Breaking $127.8B TVL Milestone',
    type: 'Weekly Report',
    date: '2025-09-05',
    author: 'DeFi Research Division',
    readTime: '14 min read',
    status: 'published',
    priority: 'high',
    tags: ['DeFi', 'TVL', 'Yield Farming', 'Layer 2', 'Cross-chain'],
    summary: 'DeFi ecosystem reaches unprecedented $127.8B TVL with revolutionary yield opportunities up to 24.75% APY. Layer 2 solutions and cross-chain protocols driving massive growth.',
    content: `
# Weekly DeFi Report: Historic $127.8B TVL Achievement

## Executive Summary - September 5, 2025
The decentralized finance (DeFi) ecosystem has shattered all previous records this week, with Total Value Locked (TVL) reaching an unprecedented $127.8 billion, representing a massive 42.8% increase from the previous week. This explosive growth is driven by revolutionary yield farming opportunities, institutional DeFi adoption, and breakthrough Layer 2 scaling solutions.

## TVL Breakdown by Protocol Category - Current Week
- **Lending Protocols**: $45.2B (+52.3%) - Institutional borrowing surge
- **Decentralized Exchanges**: $38.7B (+28.9%) - Record trading volumes
- **Yield Farming**: $18.9B (+67.2%) - Up to 24.75% APY available
- **Liquid Staking**: $14.8B (+35.4%) - ETH staking boom continues  
- **Layer 2 Protocols**: $10.2B (+89.1%) - Arbitrum and Optimism leading

## Revolutionary Yield Opportunities
### Top High-Yield Pools (Live Data)
1. **Velodrome VELO-OP (Optimism)**: 24.75% APY - Volatile LP
2. **Trader Joe AVAX-USDC (Avalanche)**: 19.85% APY - Liquidity Book LP
3. **GMX GLP (Arbitrum)**: 18.95% APY - Liquidity provider token
4. **Radiant dLP (Arbitrum)**: 16.45% APY - Dynamic LP token
5. **PancakeSwap BNB-USDT (BSC)**: 15.75% APY - V3 LP pool

### Sustainable High-Yield Protocols
- **Uniswap V3 ETH-USDC**: 12.85% APY with $1.65B TVL
- **Curve 3pool**: 9.65% APY with institutional-grade stability
- **Aave USDT (Polygon)**: 7.45% APY with multi-chain rewards
- **Marinade mSOL (Solana)**: 7.28% APY liquid staking
- **Compound USDC**: 5.92% APY with proven track record

## Top Performing Protocols - September 2025
### Lido - The Liquid Staking Giant
- **TVL**: $32.5B (+15.4% this week)
- **Market Dominance**: 54% of all liquid staking
- **New Features**: Multi-chain expansion (Solana, Polygon)
- **Institutional Adoption**: $8.9B in corporate allocations

### Aave V3 - Lending Revolution
- **TVL**: $12.89B (+18.7% this week)
- **Active Users**: 127,000+ (record high)
- **New Markets**: Avalanche, Base, Arbitrum One integration
- **Innovation**: Flash loan volume up 340%
- **Institutional Grade**: Professional custody integration

### Uniswap V3 - DEX Dominance
- **TVL**: $8.75B (+22.1% this week)
- **24h Volume**: $4.2B average daily
- **Fee Revenue**: $12M daily protocol fees
- **V4 Launch**: Advanced hooks and custom pools

### Curve Finance - Stablecoin King
- **TVL**: $4.25B (+8.9% this week)
- **Dominance**: 67% of all stablecoin trading
- **New Pools**: 15 institutional-grade stable pools
- **Cross-chain**: Operating on 8 different networks

## Institutional DeFi Adoption Surge
### Corporate Treasury Integration
- **47 Fortune 500 companies** now using DeFi protocols
- **$23.8B corporate funds** allocated to yield farming
- **Average institutional yield**: 8.9% vs 0.1% traditional banking
- **Risk Management**: Professional custody and insurance coverage

### Traditional Finance Migration
- **12 major banks** piloting DeFi lending protocols
- **$890M institutional deposits** this week alone
- **Compliance Solutions**: Regulatory-compliant DeFi platforms
- **Professional Services**: Dedicated institutional DeFi desks

## Layer 2 DeFi Explosion
### Arbitrum Ecosystem Growth
- **TVL**: $4.8B (+67% this week)
- **GMX Dominance**: $645M in GLP tokens earning 18.95% APY
- **Radiant Capital**: Revolutionary cross-chain lending
- **Gas Savings**: 95% lower costs than Ethereum mainnet

### Optimism Network Surge  
- **TVL**: $2.3B (+89% this week)
- **Velodrome**: 24.75% APY pools attracting massive capital
- **Synthetix**: Advanced derivatives trading
- **OP Token Incentives**: Additional 8.5% reward APY

### Base Network Emergence
- **TVL**: $890M (new entrant)
- **Coinbase Integration**: Native fiat on/off ramps
- **Developer Activity**: 340% increase in new protocols
- **Institutional Access**: Professional-grade compliance

## Cross-Chain DeFi Revolution
### Multi-Chain Strategies
- **Cross-chain TVL**: $45.2B across 12 networks
- **Bridge Volume**: $8.4B daily cross-chain transactions
- **Yield Arbitrage**: Sophisticated multi-chain farming
- **Risk Diversification**: Protocol risk spread across chains

### Top Performing Networks
1. **Ethereum**: $67.8B TVL - Institutional foundation
2. **Arbitrum**: $4.8B TVL - L2 leader with high yields
3. **Polygon**: $3.2B TVL - Enterprise adoption
4. **Optimism**: $2.3B TVL - Innovative tokenomics
5. **Avalanche**: $1.9B TVL - High-performance DeFi

## Security Achievements
### Zero Critical Exploits
- **45 consecutive days** without major protocol exploits
- **$127.8B locked safely** across audited protocols
- **Insurance Coverage**: $23.4B in protocol insurance
- **Bug Bounty Programs**: $8.9M in rewards distributed

### Audit Excellence
- **34 major audits** completed this quarter
- **99.97% uptime** across top 10 protocols
- **Multi-signature security**: All major treasury operations
- **Decentralized governance**: Community-controlled upgrades

## Market Impact on DeFi Tokens
### Explosive Token Performance
- **UNI**: +28.95% (7-day) - V4 launch anticipation
- **AAVE**: +24.85% (7-day) - Institutional adoption
- **COMP**: +22.15% (7-day) - New institutional features
- **MKR**: +19.75% (7-day) - Real-world asset backing
- **CRV**: +18.45% (7-day) - Stablecoin dominance

### Governance Token Utility
- **Active Proposals**: 127 governance proposals this month
- **Voter Participation**: 78% average across major protocols
- **Treasury Management**: $12.8B in protocol-controlled value
- **Revenue Sharing**: Token holders earning protocol fees

## Institutional Yield Strategies
### Professional DeFi Portfolios
- **Conservative Strategy**: 6-8% APY with minimal risk
- **Balanced Approach**: 12-15% APY with diversified protocols
- **Aggressive Yield**: 20-25% APY with higher risk tolerance
- **Institutional Services**: Dedicated custody and compliance

### Risk Management Innovation
- **Smart Contract Insurance**: Coverage up to $100M per protocol
- **Automated Risk Monitoring**: AI-powered risk assessment
- **Professional Custody**: Institutional-grade multi-sig solutions
- **Compliance Integration**: Full regulatory reporting

## Future Outlook - Q4 2025
### Major Developments Expected
1. **Ethereum 2.0 Completion**: Final transition to Proof of Stake
2. **Real-World Assets**: $50B tokenized assets target
3. **Central Bank Integration**: CBDC-DeFi interoperability
4. **Traditional Finance**: Major bank DeFi product launches

### Innovation Pipeline
- **AI-Powered Protocols**: Automated yield optimization
- **Privacy-Preserving DeFi**: Zero-knowledge proof integration
- **Carbon-Neutral DeFi**: Sustainable blockchain protocols
- **Quantum-Resistant Security**: Next-generation cryptography

## Strategic Recommendations
### For Institutional Investors
1. **Diversified Allocation**: 15-25% portfolio exposure to DeFi
2. **Risk-Adjusted Returns**: Focus on audited, insured protocols
3. **Professional Management**: Use institutional DeFi managers
4. **Compliance First**: Ensure regulatory alignment

### For Protocol Users
1. **Due Diligence**: Verify audit reports and insurance coverage
2. **Diversification**: Spread risk across multiple protocols
3. **Yield Sustainability**: Focus on long-term viable models
4. **Emergency Planning**: Maintain exit strategies

## Conclusion
The DeFi ecosystem has reached institutional maturity with $127.8B TVL, offering unprecedented yield opportunities while maintaining security standards. The convergence of Layer 2 scaling, cross-chain interoperability, and institutional adoption has created a robust, profitable, and sustainable decentralized finance landscape.

This week's 42.8% TVL growth represents not just capital attraction, but fundamental infrastructure maturation that positions DeFi as a serious competitor to traditional finance. With yields ranging from 5-25% APY and institutional-grade security, DeFi has evolved into a cornerstone of the modern financial system.

**Outlook**: CONTINUED EXPONENTIAL GROWTH EXPECTED
    `,
    metrics: {
      views: 6234,
      likes: 312,
      shares: 68
    }
  },
  {
    id: 'whale-alert-2025-09-04',
    title: 'WHALE ALERT: $47.3B Institutional Accumulation Event',
    type: 'Alert Report',
    date: '2025-09-04',
    author: 'Whale Monitoring Division',
    readTime: '7 min read',
    status: 'published',
    priority: 'high',
    tags: ['Whale Alert', 'Institutional', 'Bitcoin', 'Accumulation', 'Record Breaking'],
    summary: 'Historic $47.3 billion whale accumulation event detected across 623 active whale wallets. Largest institutional buying pressure in cryptocurrency history preceding Bitcoin ATH.',
    content: `
# 🚨 WHALE ALERT: Historic $47.3B Institutional Accumulation Event

## CRITICAL ALERT SUMMARY - September 4, 2025
Our advanced whale monitoring systems have detected the largest institutional accumulation event in cryptocurrency history. Over the past 72 hours, we've tracked an unprecedented $47.3 billion in whale transaction volume across 623 active institutional wallets, setting the stage for Bitcoin's historic surge to $138,750.

## RECORD-BREAKING WHALE STATISTICS
### Accumulation Scale
- **Total Whale Volume**: $47.3 billion (72-hour period)
- **Active Whale Wallets**: 623 (previous record: 284)
- **Average Transaction Size**: $4.18M (+18.9% from baseline)
- **New Whale Addresses**: 67 with $100M+ initial deposits
- **Institutional Participation**: 87% of all whale activity

### Unprecedented Metrics
- **Largest Single Transaction**: $250M BTC purchase by Sovereign Wealth Fund
- **Most Active Period**: 15:00-17:00 UTC (institutional hours)
- **Geographic Distribution**: 45% US, 32% EU, 23% Asia-Pacific
- **Cold Storage Migration**: 89% moved to long-term custody

## INSTITUTIONAL WHALE BREAKDOWN
### Tier 1 Whales ($1B+ Holdings)
1. **Sovereign Wealth Fund Alpha**: $2.89B portfolio
   - **Recent Activity**: +$340M BTC accumulation
   - **Strategy**: Long-term strategic reserve
   - **Location**: Multi-jurisdictional custody

2. **BlackRock Digital Assets**: $2.34B portfolio  
   - **Recent Activity**: +$290M across BTC/ETH
   - **Strategy**: Client portfolio diversification
   - **Innovation**: First pension fund crypto allocation

3. **Grayscale Holdings Vault**: $1.89B portfolio
   - **Recent Activity**: +$180M institutional inflows
   - **Strategy**: Traditional finance gateway
   - **Products**: 15 different crypto investment vehicles

### Tier 2 Whales ($500M-$1B Holdings)
4. **Coinbase Custody Prime**: $1.45B under management
   - **Recent Activity**: +$220M institutional deposits
   - **Clients**: Fortune 500 companies, hedge funds
   - **Security**: Military-grade custody solutions

5. **Binance Ultra High Net Worth**: $1.28B portfolio
   - **Recent Activity**: +$150M international flows
   - **Focus**: Cross-border institutional trading
   - **Services**: OTC desk, custody, lending

## EXCHANGE FLOW ANALYSIS - BULLISH SUPPLY SHOCK
### Historic Exchange Outflows
- **Total Outflows**: $5.2B across all major exchanges
- **Exchange Reserves**: At 3-year lows (critically low supply)
- **Supply Shock Indicator**: 94% institutional addresses holding >1 year
- **Liquidity Crisis Warning**: Available supply down 67%

### Exchange-by-Exchange Breakdown
#### Coinbase Professional - Institutional Exodus
- **Outflow**: $2.1B (largest single-day outflow in history)
- **Primary Assets**: BTC (75%), ETH (20%), Others (5%)
- **Client Profile**: Fortune 500 companies, family offices
- **Custody Migration**: 94% to regulated cold storage

#### Binance - Strategic Accumulation Hub
- **Net Flow**: +$47M inflow (contrarian accumulation)
- **Analysis**: International institutional arbitrage
- **Geographic**: European and Asian institutions
- **OTC Volume**: $890M in institutional block trades

#### Kraken Institution Services  
- **Outflow**: $1.2B (record institutional withdrawal)
- **Pattern**: European pension funds and banks
- **Timing**: Coordinated with regulatory approvals
- **Security**: Enhanced institutional custody protocols

## WHALE WALLET BEHAVIORAL ANALYSIS
### New Institutional Address Creation
- **67 New Whale Wallets**: Each with $100M+ initial funding
- **Wallet Security**: 100% multi-signature implementations
- **Custody Type**: 78% regulated institutional custodians
- **Geographic Spread**: Global institutional presence

### Transaction Pattern Intelligence
- **Size Distribution**: $50M-$250M per transaction
- **Frequency**: Peak activity 15:00-17:00 UTC daily
- **Execution Method**: Time-weighted average price (TWAP)
- **Slippage Management**: Professional algorithmic execution

### Professional Custody Migration
- **Cold Storage Preference**: 89% long-term custody solutions
- **Insurance Coverage**: Average $500M per wallet
- **Compliance**: Full regulatory reporting compliance
- **Security Audits**: Quarterly third-party assessments

## INSTITUTIONAL ADOPTION CATALYSTS
### Corporate Treasury Allocations
- **S&P 500 Adoption**: 47 companies now hold BTC (up from 3 in 2024)
- **Total Corporate Holdings**: $89.5B across public companies
- **Average Allocation**: 5.2% of cash reserves
- **Trend Acceleration**: 15 new announcements this quarter alone

### Traditional Finance Integration
- **Bank Participation**: 12 major banks offering crypto custody
- **Pension Fund Allocation**: $23.4B in crypto investments
- **Insurance Company Holdings**: $8.9B in BTC/ETH exposure
- **Hedge Fund Adoption**: 78% now have crypto strategies

## MARKET IMPACT PREDICTION MODEL
### Supply-Demand Dynamics
- **Available Supply**: Reduced by 15.7% in 30 days
- **Institutional Demand**: Growing 340% quarter-over-quarter
- **Price Elasticity**: Extremely low liquidity environment
- **Supply Shock Timeline**: 2-3 weeks for full impact

### Price Target Implications
Our models suggest this accumulation level supports:
- **Conservative Target**: $145,000 (based on supply reduction)
- **Moderate Target**: $160,000 (institutional demand curve)
- **Optimistic Target**: $180,000 (full supply shock scenario)

## HISTORICAL PRECEDENT ANALYSIS
### Similar Accumulation Events
- **March 2024**: $12.3B accumulation → +67% price increase
- **September 2023**: $8.9B accumulation → +45% price increase
- **Current Event**: $47.3B accumulation → Price discovery phase

### Key Differentiators
- **Scale**: 3.8x larger than previous record
- **Institutional Quality**: 87% professional investment entities
- **Regulatory Environment**: Clear institutional frameworks
- **Infrastructure**: Mature custody and trading solutions

## RISK ASSESSMENT & WARNINGS
### Bullish Risk Factors
- **Institutional Infrastructure**: Mature professional ecosystem
- **Regulatory Clarity**: Clear frameworks in major jurisdictions
- **Supply Scarcity**: Exchange reserves at critical lows
- **Adoption Momentum**: Accelerating institutional participation

### Cautionary Considerations
- **Extreme Concentration**: High whale concentration risk
- **Regulatory Changes**: Policy shifts could impact sentiment
- **Market Manipulation**: Coordinated selling potential
- **Liquidity Risk**: Thin order books during volatility

## MONITORING PROTOCOL UPDATES
### Enhanced Surveillance
- **Real-time Tracking**: 623 whale addresses under 24/7 monitoring
- **Alert Thresholds**: Updated for institutional-scale movements
- **Behavioral Analysis**: AI-powered pattern recognition
- **Cross-chain Monitoring**: Multi-blockchain whale tracking

### Professional Intelligence
- **Institutional Reporting**: Weekly whale activity summaries
- **Risk Metrics**: Advanced volatility and concentration measures
- **Market Impact Models**: Predictive price impact analysis
- **Regulatory Compliance**: Full audit trail for all tracked activities

## STRATEGIC RECOMMENDATIONS
### For Market Participants
1. **Prepare for Volatility**: Extreme price discovery phase ahead
2. **Supply Shortage Awareness**: Limited liquidity available
3. **Professional Execution**: Use institutional-grade trading
4. **Risk Management**: Position sizing appropriate for volatility

### For Institutional Investors
1. **Accumulation Strategy**: Consider staged entry over time
2. **Custody Solutions**: Use regulated, insured providers
3. **Compliance Documentation**: Maintain full audit trails
4. **Risk Assessment**: Regular portfolio risk evaluation

## CONCLUSION & OUTLOOK
The $47.3 billion whale accumulation event represents a fundamental shift in cryptocurrency market structure. This unprecedented institutional buying pressure has created the foundation for Bitcoin's historic surge past $138,750, with potential for continued upward momentum.

The convergence of institutional adoption, supply scarcity, and professional infrastructure has created optimal conditions for sustained price appreciation. However, the extreme concentration of holdings among institutional whales also introduces new risk dynamics that market participants must understand and prepare for.

**ALERT STATUS**: MAXIMUM INSTITUTIONAL ACCUMULATION - SUPPLY SHOCK IMMINENT

**MARKET OUTLOOK**: HISTORIC PRICE DISCOVERY PHASE BEGINNING
    `,
    metrics: {
      views: 12547,
      likes: 789,
      shares: 156
    }
  },
  {
    id: 'solana-analysis-2025-09-03',
    title: 'Solana Ecosystem Explosion: $547 SOL and Record Growth',
    type: 'Special Report',
    date: '2025-09-03',
    author: 'Blockchain Ecosystem Team',
    readTime: '16 min read',
    status: 'published',
    priority: 'high',
    tags: ['Solana', 'Ecosystem Growth', 'DeFi', 'NFTs', 'Layer 1', 'Innovation'],
    summary: 'Solana reaches $547 with ecosystem growth driving unprecedented adoption. DeFi TVL, NFT marketplace activity, and developer engagement hit all-time highs.',
    content: `
# Solana Ecosystem Explosion: The $547 Success Story

## Executive Summary - September 3, 2025
Solana (SOL) has reached an extraordinary milestone of $547, representing a remarkable +8.92% gain amid the broader crypto rally. This surge is powered by unprecedented ecosystem growth, with DeFi TVL reaching $12.8B, NFT marketplace record volumes, and the most active developer community in blockchain. Solana has evolved from a high-performance blockchain into a comprehensive Web3 ecosystem rivaling Ethereum.

## Price Performance & Market Position
### Current Market Metrics
- **SOL Price**: $547 (+8.92% 24h, +127% YTD)
- **Market Capitalization**: $243.6B (3rd largest cryptocurrency)
- **Fully Diluted Valuation**: $312.4B
- **24h Trading Volume**: $8.9B (institutional participation high)
- **Market Dominance**: 7.8% of total crypto market cap

### Technical Analysis Breakthrough
- **All-Time High**: $547 (new record, previous ATH $259)
- **Key Resistance Broken**: $500 psychological level obliterated
- **Next Targets**: $600-$650 based on Fibonacci extensions
- **Support Levels**: $520, $485, $450 (strong institutional bids)
- **RSI**: 67 (healthy bullish momentum, not overbought)

## DeFi Ecosystem Dominance
### Record-Breaking TVL Growth
- **Total Value Locked**: $12.8B (+89% from Q2 2025)
- **Protocol Count**: 247 active DeFi protocols (+156% YoY)
- **Daily Transaction Volume**: $2.3B average
- **Unique Active Wallets**: 4.2M daily (leading all Layer 1s)

### Top DeFi Protocols on Solana
#### Marinade Finance - Liquid Staking Leader
- **TVL**: $967M (+45% this quarter)
- **mSOL APY**: 7.28% (competitive staking rewards)
- **Market Share**: 67% of Solana liquid staking
- **Innovation**: Cross-chain staking expansion

#### Jupiter Exchange - DEX Aggregator Supreme
- **Daily Volume**: $890M average
- **Token Integrations**: 12,000+ SPL tokens
- **Slippage Optimization**: Best-in-class routing
- **Market Impact**: 43% of all Solana DEX volume

#### Drift Protocol - Perpetual Trading Revolution
- **Trading Volume**: $1.2B daily perpetuals
- **Open Interest**: $340M (record high)
- **Products**: Spot, perps, borrowing/lending
- **Innovation**: Decentralized orderbook model

### Solana DeFi Innovation Highlights
- **Cross-Program Composability**: Seamless protocol interactions
- **Sub-Second Finality**: Real-time trading experiences
- **Low Transaction Costs**: Average $0.00025 per transaction
- **Mobile-First Design**: Native mobile wallet integration

## NFT Marketplace Explosion
### Record-Breaking NFT Metrics
- **Total NFT Sales**: $2.1B (30-day volume)
- **Daily Transactions**: 890,000 NFT trades
- **Unique Collections**: 45,000+ active collections
- **Floor Price Growth**: +234% average across top collections

### Leading NFT Marketplaces
#### Magic Eden - Multi-Chain Dominance
- **Solana Volume**: $1.2B monthly
- **Market Share**: 76% of Solana NFT trading
- **Chain Expansion**: Ethereum, Polygon, Bitcoin integration
- **Innovation**: Zero-fee creator royalties optional

#### Tensor - Professional Trading Platform
- **Advanced Features**: Sweep tools, rarity analytics
- **Pro Traders**: Institutional NFT trading desks
- **Volume Growth**: +340% quarter-over-quarter
- **Market Making**: Automated liquidity provision

### NFT Innovation Trends
- **Programmable NFTs**: Dynamic metadata and utilities
- **Gaming Integration**: 15,000+ in-game assets trading
- **Real-World Assets**: Property and luxury goods tokenization
- **Creator Economy**: $450M in creator royalties distributed

## Developer Ecosystem Surge
### Development Activity Records
- **GitHub Commits**: 45,000+ monthly (leading all blockchains)
- **Active Developers**: 3,400+ monthly contributors
- **New Projects**: 340 launched this quarter
- **Developer Grants**: $67M distributed by Solana Foundation

### Major Developer Tools & Infrastructure
#### Solana Pay - Commerce Revolution
- **Merchant Adoption**: 23,000+ businesses integrated
- **Transaction Volume**: $890M in commercial payments
- **Global Reach**: 67 countries supported
- **Innovation**: QR code payments, Point-of-Sale systems

#### Metaplex - NFT Infrastructure
- **NFT Standards**: Industry-leading token standards
- **Creator Tools**: No-code NFT creation platform
- **Enterprise Adoption**: 340+ brands using Metaplex
- **Market Impact**: 78% of Solana NFTs use Metaplex standards

### Programming Languages & SDKs
- **Rust Dominance**: High-performance smart contracts
- **Anchor Framework**: 12,000+ deployed programs
- **Web3.js SDK**: 890,000+ monthly downloads
- **Mobile SDK**: Native iOS and Android development

## Institutional Adoption Acceleration
### Corporate & Enterprise Integration
- **Fortune 500 Adopters**: 23 companies building on Solana
- **Payment Processors**: Stripe, Square, Checkout.com integration
- **Enterprise Partnerships**: Google Cloud, AWS validator programs
- **Investment Funds**: $2.3B in dedicated Solana ecosystem funds

### Traditional Finance Bridge
#### Visa & Mastercard Integration
- **Solana Pay Adoption**: Major payment networks piloting
- **USDC Settlement**: Real-time cross-border payments
- **Merchant Benefits**: 99.9% cost reduction vs traditional rails
- **Regulatory Compliance**: Full AML/KYC integration

#### Banking Sector Adoption
- **Central Bank Pilots**: 5 countries testing Solana-based CBDCs
- **Commercial Banks**: 12 major banks using Solana infrastructure
- **Trade Finance**: $1.2B in tokenized trade instruments
- **Remittances**: $340M monthly cross-border transfers

## Gaming & Web3 Revolution
### Play-to-Earn Ecosystem
- **Active Games**: 156 live P2E games on Solana
- **Daily Active Users**: 1.2M gamers across ecosystem
- **Gaming Revenue**: $234M generated by players monthly
- **Asset Trading**: $890M in gaming NFT transactions

### Major Gaming Projects
#### Star Atlas - AAA Metaverse
- **Development Progress**: Alpha launch Q4 2025
- **Asset Sales**: $89M in ship and land NFT sales
- **Technology**: Unreal Engine 5 integration
- **Economic Model**: Sustainable player-driven economy

#### Aurory - Pokemon-Inspired Adventure  
- **Player Base**: 340,000 registered players
- **NFT Ecosystem**: Aurorians, items, and land assets
- **Gameplay**: Turn-based strategy with breeding mechanics
- **Market Performance**: $45M in NFT trading volume

## Mobile-First Innovation
### Solana Mobile Stack
- **Saga Phone**: 45,000 devices sold, planning Saga 2
- **Seed Vault**: Hardware-secured private key storage
- **dApp Store**: 340+ native Solana mobile applications
- **Mobile Pay**: Tap-to-pay crypto transactions

### Mobile Ecosystem Growth
- **Mobile Wallet Users**: 2.1M active mobile wallets
- **Mobile DeFi**: $890M TVL from mobile-only users
- **Mobile NFTs**: 67% of NFT purchases from mobile
- **Developer Adoption**: 890+ mobile-first developers

## Cross-Chain Interoperability
### Bridge Infrastructure
- **Wormhole Protocol**: $2.3B total value bridged to Solana
- **Supported Chains**: Ethereum, BSC, Polygon, Avalanche
- **Bridge Security**: Zero critical exploits in 18 months
- **Institutional Usage**: 78% of bridge volume from institutions

### Multi-Chain Strategy
- **Assets on Solana**: $4.7B in bridged crypto assets
- **Cross-Chain DeFi**: Unified liquidity across chains
- **Developer Tools**: Single SDK for multi-chain deployment
- **User Experience**: Seamless cross-chain transactions

## Regulatory & Compliance Leadership
### Proactive Regulatory Engagement
- **Compliance Infrastructure**: Built-in AML/KYC protocols
- **Regulatory Partnerships**: Working with SEC, CFTC guidance
- **Global Compliance**: EU MiCA, UK, Singapore frameworks
- **Institutional Grade**: SOC 2, ISO 27001 certifications

### Enterprise Security Standards
- **Validator Security**: 1,400+ validators globally distributed
- **Network Uptime**: 99.97% (industry-leading reliability)
- **Audit Coverage**: All major protocols independently audited
- **Insurance**: $890M in protocol insurance coverage

## Environmental Sustainability
### Carbon Neutral Achievement
- **Energy Efficiency**: 99.95% more efficient than Proof-of-Work
- **Carbon Footprint**: Net carbon negative through offsetting
- **Green Validators**: 67% powered by renewable energy
- **Sustainability Fund**: $34M for environmental initiatives

## Future Roadmap & Innovations
### Technical Developments Q4 2025
- **Firedancer Client**: Alternative validator client for diversity
- **State Compression**: 10,000x cost reduction for large datasets
- **Account Versioning**: Improved smart contract upgradeability
- **Token Extensions**: Advanced token functionality standards

### Ecosystem Growth Initiatives
- **University Programs**: 45 blockchain courses featuring Solana
- **Hackathon Network**: $12M in prizes across global hackathons
- **Accelerator Programs**: 5 dedicated Solana startup accelerators
- **Regional Expansion**: Focus on Asia-Pacific, Latin America, Africa

## Risk Assessment & Considerations
### Strengths Supporting Growth
- **Technical Superiority**: Proven high-performance architecture
- **Developer Experience**: Superior tooling and documentation
- **Ecosystem Maturity**: Comprehensive DeFi and NFT infrastructure
- **Institutional Adoption**: Growing enterprise partnerships

### Potential Risk Factors
- **Network Congestion**: Occasional performance degradation
- **Validator Concentration**: Geographic distribution improving
- **Regulatory Uncertainty**: Ongoing SEC classification discussions
- **Competition**: Ethereum Layer 2 solutions advancing rapidly

## Investment Thesis & Price Targets
### Bull Case Scenarios
- **Conservative Target**: $650 (19% upside, ecosystem growth)
- **Base Case**: $750 (37% upside, institutional adoption)
- **Optimistic**: $900 (65% upside, full Web3 transition)

### Valuation Metrics
- **Transaction Value**: $2.3B daily economic activity
- **Developer Activity**: Highest among all Layer 1 blockchains
- **Enterprise Adoption**: 23 Fortune 500 companies building
- **Network Effects**: 4.2M daily active users

## Strategic Recommendations
### For Institutional Investors
1. **Strategic Allocation**: 5-15% portfolio exposure to SOL
2. **Ecosystem Investment**: Direct investment in Solana protocols
3. **Infrastructure Participation**: Validator and RPC node operation
4. **Product Development**: Build enterprise solutions on Solana

### For Developers & Entrepreneurs
1. **Platform Selection**: Solana for high-performance applications
2. **Grant Programs**: Access $67M in available developer funding
3. **Market Opportunity**: Underserved sectors in DeFi and NFTs
4. **Cross-Chain Strategy**: Leverage Solana's bridge infrastructure

## Conclusion
Solana's surge to $547 represents the culmination of two years of intense development, ecosystem building, and real-world adoption. The blockchain has evolved beyond a mere "Ethereum killer" narrative to become a comprehensive Web3 platform with unique advantages in speed, cost-efficiency, and developer experience.

The convergence of DeFi maturity ($12.8B TVL), NFT marketplace dominance ($2.1B monthly volume), institutional adoption (23 Fortune 500 companies), and mobile-first innovation positions Solana as a foundational infrastructure for the next phase of crypto adoption.

With 4.2 million daily active users, 3,400 monthly developers, and $243.6B market capitalization, Solana has established itself as the third-largest cryptocurrency ecosystem and a credible alternative to Ethereum for high-performance decentralized applications.

**Investment Outlook**: STRONG BUY - Ecosystem fundamentals support continued growth
**Price Target**: $750 (37% upside potential based on adoption metrics)
**Risk Level**: MODERATE - Established ecosystem with proven resilience
    `,
    metrics: {
      views: 9134,
      likes: 524,
      shares: 98
    }
  }
]

const reportTypes = ['All', 'Daily Report', 'Weekly Report', 'Alert Report', 'Special Report', 'Regulatory Report']
const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

export default function ReportsPage() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredReports = marketReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'All' || report.type === selectedType
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 text-foreground">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/\n\n/g, '<br/><br/>')
  }

  if (selectedReport) {
    const report = marketReports.find(r => r.id === selectedReport)
    if (report) {
      return (
        <div className="p-6 space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            ← Back to Reports
          </Button>

          {/* Report Header */}
          <Card className="bg-gradient-to-br from-background to-muted/10">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{report.type}</Badge>
                    <div className={`w-2 h-2 rounded-full ${priorityColors[report.priority as keyof typeof priorityColors]}`} />
                    <span className="text-xs text-muted-foreground capitalize">{report.priority} Priority</span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
                  <p className="text-lg text-muted-foreground">{report.summary}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(report.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{report.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{report.readTime}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.shares)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Report Content */}
          <Card className="bg-gradient-to-br from-background to-muted/10">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: formatContent(report.content) }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {report.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <FileText className="w-6 h-6 text-primary" />
            <span>Market Analysis Reports</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily market analysis and insights from our research team
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {reportTypes.map(type => (
                  <Badge
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReports.map((report) => (
          <Card 
            key={report.id} 
            className="bg-gradient-to-br from-background to-muted/10 hover:bg-muted/20 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{report.type}</Badge>
                    <div className={`w-2 h-2 rounded-full ${priorityColors[report.priority as keyof typeof priorityColors]}`} />
                    <span className="text-xs text-muted-foreground capitalize">{report.priority} Priority</span>
                    {report.status === 'published' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                    {report.title}
                  </h2>
                  <p className="text-muted-foreground">{report.summary}</p>
                </div>
                <Button variant="outline" size="sm">
                  Read Report
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(report.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{report.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{report.readTime}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{formatNumber(report.metrics.shares)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {report.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {report.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{report.tags.length - 4} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query or filter criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{marketReports.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {marketReports.filter(r => r.date >= '2025-09-03').length}
            </p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(marketReports.reduce((sum, r) => sum + r.metrics.views, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {marketReports.filter(r => r.priority === 'high').length}
            </p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
