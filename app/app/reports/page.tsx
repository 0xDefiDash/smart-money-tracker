
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

// Market Analysis Reports Data
const marketReports = [
  {
    id: 'daily-2025-08-27',
    title: 'Daily Market Analysis - Bitcoin Surges Past $111K',
    type: 'Daily Report',
    date: '2025-08-27',
    author: 'Smart Money Analytics Team',
    readTime: '8 min read',
    status: 'published',
    priority: 'high',
    tags: ['Bitcoin', 'Market Analysis', 'Whale Activity', 'Technical Analysis'],
    summary: 'Bitcoin breaks through significant resistance at $111K driven by institutional accumulation and positive market sentiment. Exchange outflows suggest strong hodling behavior.',
    content: `
# Bitcoin Surges Past $111K: Market Analysis Report

## Executive Summary
Bitcoin (BTC) has achieved a significant milestone by breaking through the $111,000 resistance level, marking a +2.06% gain in the last 24 hours. This breakthrough comes amid strong institutional accumulation and favorable market conditions.

## Key Market Movements
- **Bitcoin (BTC)**: $111,915 (+2.06%)
- **Ethereum (ETH)**: $4,654 (+2.95%) 
- **XRP**: $3.01 (+2.86%)
- **Total Market Cap**: $2.49T (+3.24%)

## Whale Activity Analysis
Our monitoring systems detected significant whale accumulation over the past 24 hours:
- **342 active whale wallets** participated in market activity
- **$8.9 billion** in whale transaction volume
- **Net accumulation** of 15,000+ BTC by institutional wallets
- **23 new whale addresses** identified this week

## Technical Analysis
### Support and Resistance Levels
- **Strong Support**: $108,000 - $109,500
- **Current Price**: $111,915
- **Next Resistance**: $115,000 - $117,000
- **RSI**: 62.5 (Neutral to Bullish)

### Exchange Flow Analysis
- **Net Outflows**: $183M from major exchanges
- **Binance**: +$730M net inflow (unusual accumulation)
- **Coinbase**: -$450M net outflow (institutional withdrawal)
- **Overall Sentiment**: Bullish hodling behavior

## Market Outlook
The current price action suggests continued upward momentum with strong fundamentals supporting the rally. Key factors include:

1. **Institutional Adoption**: Continued corporate treasury allocations
2. **Supply Dynamics**: Reduced exchange reserves
3. **Regulatory Clarity**: Positive regulatory developments
4. **Technical Momentum**: Breaking key resistance levels

## Risk Assessment
- **Market Volatility**: Moderate (28.5%)
- **Correlation Risk**: High with traditional assets
- **Liquidity**: Adequate across major exchanges
- **Overall Risk**: Moderate

## Conclusion
The $111K breakthrough represents a significant technical and psychological milestone for Bitcoin. With strong whale accumulation and positive market dynamics, we maintain a bullish outlook for the near term, targeting $115K-$117K as the next major resistance zone.
    `,
    metrics: {
      views: 2847,
      likes: 156,
      shares: 23
    }
  },
  {
    id: 'daily-2025-08-26',
    title: 'Weekly Wrap-Up: DeFi TVL Reaches New Heights',
    type: 'Weekly Report',
    date: '2025-08-26',
    author: 'DeFi Research Division',
    readTime: '12 min read',
    status: 'published',
    priority: 'medium',
    tags: ['DeFi', 'TVL', 'Yield Farming', 'Liquidity'],
    summary: 'DeFi protocols show remarkable growth with Total Value Locked reaching $89.5B, driven by innovative yield farming strategies and improved protocol security.',
    content: `
# Weekly DeFi Report: TVL Surges to New All-Time High

## Overview
The decentralized finance (DeFi) ecosystem has demonstrated exceptional growth this week, with Total Value Locked (TVL) reaching $89.5 billion, representing an 8.5% increase from the previous week.

## TVL Breakdown by Protocol Category
- **Lending Protocols**: $32.1B (+12.3%)
- **Decentralized Exchanges**: $28.7B (+6.8%)
- **Yield Farming**: $15.2B (+15.7%)
- **Liquid Staking**: $8.9B (+4.2%)
- **Derivatives**: $4.6B (+9.1%)

## Top Performing Protocols
### Uniswap V4 
- **TVL**: $12.8B (+8.9%)
- **24h Volume**: $2.1B
- **New Features**: Enhanced capital efficiency

### Aave v3
- **TVL**: $9.4B (+11.2%)
- **Active Users**: 45,000+
- **New Markets**: 3 additional chains

### Compound Finance
- **TVL**: $6.2B (+7.8%)
- **Governance Activity**: High
- **Yield APY**: 4.2% average

## Whale Activity in DeFi
- **Large Deposits**: $890M in single transactions
- **Yield Farming**: Institutional participation up 34%
- **Multi-chain Strategy**: Cross-chain TVL migration observed

## Security Updates
- **Zero Critical Exploits**: Clean week for major protocols
- **Bug Bounties**: $2.3M in rewards distributed
- **Audit Completions**: 8 protocols received fresh audits

## Market Impact
The DeFi surge has positively impacted related tokens:
- **UNI**: +12.5%
- **AAVE**: +15.3%
- **COMP**: +8.9%
- **MKR**: +11.7%

## Looking Ahead
Key developments to watch:
1. **Layer 2 Integration**: Major protocols expanding to L2
2. **Real-World Assets**: Traditional finance tokenization
3. **Cross-Chain Infrastructure**: Improved interoperability
4. **Regulatory Framework**: Clearer guidelines expected

## Risks and Considerations
- **Smart Contract Risk**: Always present in DeFi
- **Impermanent Loss**: Consider when providing liquidity
- **Regulatory Changes**: Monitor compliance requirements
- **Market Volatility**: DeFi amplifies market movements
    `,
    metrics: {
      views: 1923,
      likes: 89,
      shares: 17
    }
  },
  {
    id: 'daily-2025-08-25',
    title: 'Exchange Flow Alert: Major Outflows Detected',
    type: 'Alert Report',
    date: '2025-08-25',
    author: 'Exchange Monitoring Team',
    readTime: '6 min read',
    status: 'published',
    priority: 'high',
    tags: ['Exchange Flows', 'Institutional', 'Alert', 'Liquidity'],
    summary: 'Significant cryptocurrency outflows from major exchanges detected, suggesting institutional accumulation and potential supply squeeze.',
    content: `
# Alert: Major Exchange Outflows Signal Institutional Accumulation

## Alert Summary
Our monitoring systems have detected unusually large outflows from major cryptocurrency exchanges over the past 48 hours, totaling approximately $2.1 billion across all assets.

## Exchange-by-Exchange Breakdown
### Coinbase Professional
- **Outflow**: $890M
- **Primary Assets**: BTC (60%), ETH (30%), Others (10%)
- **Pattern**: Institutional-sized transactions
- **Timing**: Concentrated during US market hours

### Binance
- **Net Flow**: +$730M inflow (contrarian to trend)
- **Analysis**: Possible arbitrage or regional accumulation
- **Assets**: Diversified across top 10 cryptocurrencies

### Kraken
- **Outflow**: $420M
- **Notable**: High-net-worth individual transactions
- **Geographic**: European timezone activity

## Whale Wallet Analysis
### New Accumulation Addresses
- **47 new whale wallets** identified
- **Average holding**: $58M equivalent
- **Behavior**: Long-term storage patterns
- **Security**: Multi-signature implementations

### Transaction Patterns
- **Size Range**: $10M - $150M per transaction
- **Frequency**: Every 2-3 hours during peak periods
- **Destinations**: Cold storage wallets
- **Methodology**: Professional custody solutions

## Market Implications
### Supply Dynamics
- **Circulating Supply**: Effectively reduced by 0.3%
- **Exchange Reserves**: At 18-month low
- **Liquidity**: Potential for increased volatility

### Price Impact Analysis
- **Immediate**: Minimal due to gradual execution
- **Medium-term**: Positive pressure expected
- **Long-term**: Supply shock potential

## Historical Context
Similar patterns in Q2 2024 preceded a 45% price increase over 3 months. Key similarities:
- **Magnitude**: Comparable outflow volume
- **Timing**: Post-regulatory clarity
- **Participants**: Similar institutional profiles

## Monitoring Recommendations
1. **Watch List**: Monitor identified whale addresses
2. **Exchange Reserves**: Track daily changes
3. **On-chain Metrics**: Dormancy flow indicators
4. **Market Sentiment**: Fear & Greed Index correlation

## Risk Assessment
- **Bullish Indicators**: Strong accumulation pattern
- **Risks**: Potential market manipulation
- **Confidence Level**: High (85%)
- **Timeline**: 2-4 weeks for impact materialization

## Action Items
- Continue 24/7 monitoring of identified addresses
- Update alert thresholds based on current patterns
- Prepare detailed institutional tracking reports
- Coordinate with partner exchanges for verification
    `,
    metrics: {
      views: 3421,
      likes: 234,
      shares: 45
    }
  },
  {
    id: 'daily-2025-08-24',
    title: 'Altcoin Season Analysis: Which Projects Are Leading?',
    type: 'Special Report',
    date: '2025-08-24',
    author: 'Altcoin Research Team',
    readTime: '15 min read',
    status: 'published',
    priority: 'medium',
    tags: ['Altcoins', 'Market Analysis', 'Top Performers', 'Trends'],
    summary: 'Comprehensive analysis of the current altcoin market cycle, identifying leading projects and emerging trends across different blockchain ecosystems.',
    content: `
# Altcoin Season Deep Dive: Leading Projects and Emerging Trends

## Executive Summary
The cryptocurrency market is experiencing a notable altcoin season, with several projects significantly outperforming Bitcoin and Ethereum. This report analyzes the top performers, underlying catalysts, and future outlook for the altcoin market.

## Market Performance Overview
### Top Performers (7-Day)
1. **Solana (SOL)**: +15.67% - $158.40
2. **Avalanche (AVAX)**: +12.45% - $32.85
3. **Chainlink (LINK)**: +8.23% - $18.75
4. **Polkadot (DOT)**: +7.89% - $7.45
5. **Polygon (MATIC)**: +6.12% - $0.87

### Sector Analysis
- **Layer 1 Blockchains**: Leading the charge with scalability solutions
- **DeFi Infrastructure**: Benefiting from increased TVL
- **Oracle Networks**: Growing demand for real-world data
- **Interoperability**: Cross-chain solutions gaining traction

## Deep Dive Analysis

### Solana Ecosystem Surge
**Current Price**: $158.40 (+15.67%)
**Market Cap**: $42.8B
**Key Catalysts**:
- **NFT Marketplace Growth**: Record trading volumes
- **DeFi Expansion**: New protocols launching weekly
- **Developer Activity**: 40% increase in GitHub commits
- **Institutional Adoption**: Major fund allocations

**Technical Analysis**:
- Breaking through $150 resistance decisively
- RSI at 65 (healthy bullish territory)
- Strong support established at $145
- Target: $175-$185 in the near term

### Avalanche Network Development
**Current Price**: $32.85 (+12.45%)
**Key Developments**:
- **Subnet Deployments**: 15 new subnets this month
- **Enterprise Partnerships**: Fortune 500 integrations
- **Gaming Sector**: Major game launches planned
- **Environmental Focus**: Carbon-neutral blockchain narrative

### Chainlink Integration Expansion
**Current Price**: $18.75 (+8.23%)
**Growth Drivers**:
- **New Price Feeds**: 50+ assets added this quarter
- **Cross-Chain Protocol**: CCIP gaining adoption
- **Traditional Finance**: Banks exploring integration
- **Staking Launch**: LINK staking mechanisms activated

## Emerging Trends

### 1. Real-World Asset Tokenization
- **Market Size**: $2.3B in tokenized assets
- **Growth Rate**: 35% month-over-month
- **Leading Platforms**: Centrifuge, Maple Finance, TrueFi
- **Asset Classes**: Real estate, commodities, trade finance

### 2. AI and Blockchain Convergence
- **Notable Projects**: SingularityNET, Ocean Protocol, Fetch.ai
- **Use Cases**: Decentralized AI training, data marketplaces
- **Market Cap Growth**: 120% in the AI crypto sector
- **Future Outlook**: Continued integration expected

### 3. Gaming and Metaverse Evolution
- **Play-to-Earn Evolution**: Sustainable tokenomics models
- **Major Launches**: 8 AAA games with crypto integration
- **User Adoption**: 2.3M daily active users across P2E games
- **Investment**: $1.2B in gaming crypto funding this quarter

## Risk Assessment

### Positive Factors
- **Diversified Growth**: Multiple sectors performing well
- **Institutional Interest**: Increased professional participation
- **Technical Innovation**: Genuine utility driving adoption
- **Market Structure**: Healthier distribution than previous cycles

### Risk Factors
- **Correlation Risk**: Still tied to BTC/ETH movements
- **Regulatory Uncertainty**: Ongoing regulatory developments
- **Liquidity Concerns**: Some altcoins have thin order books
- **Market Cycle**: Historical patterns suggest rotational nature

## Investment Considerations

### Portfolio Allocation Suggestions
- **Large Cap Altcoins (50-60%)**: SOL, AVAX, DOT, LINK
- **Mid Cap Opportunities (25-30%)**: Emerging L1s, DeFi protocols
- **Small Cap Speculative (10-15%)**: Early-stage projects
- **Stablecoins (5-10%)**: Powder dry for opportunities

### Due Diligence Checklist
1. **Team and Development**: Active GitHub, experienced team
2. **Use Case Validation**: Real-world problem solving
3. **Tokenomics**: Sustainable economic model
4. **Community**: Engaged user base and developers
5. **Partnerships**: Strategic business relationships

## Conclusion
The current altcoin season appears to be driven by fundamental improvements in blockchain technology, real-world adoption, and institutional recognition. While maintaining caution around market cycles and correlation risks, the diverse range of performing sectors suggests a maturing market with genuine utility driving valuations.

## Outlook
- **Short-term (1-3 months)**: Continued outperformance likely
- **Medium-term (3-6 months)**: Rotation patterns may emerge
- **Long-term (6+ months)**: Fundamentally strong projects should maintain gains
    `,
    metrics: {
      views: 4156,
      likes: 287,
      shares: 52
    }
  },
  {
    id: 'daily-2025-08-23',
    title: 'Regulatory Update: Global Crypto Policy Developments',
    type: 'Regulatory Report',
    date: '2025-08-23',
    author: 'Policy Research Division',
    readTime: '10 min read',
    status: 'published',
    priority: 'high',
    tags: ['Regulation', 'Policy', 'Compliance', 'Global Markets'],
    summary: 'Latest regulatory developments across major jurisdictions and their potential impact on cryptocurrency markets and institutional adoption.',
    content: `
# Global Regulatory Landscape: August 2025 Update

## Executive Summary
Cryptocurrency regulation continues to evolve globally, with several key jurisdictions making significant policy announcements. This report covers major regulatory developments and their market implications.

## United States Developments

### SEC Framework Updates
- **Crypto Asset Securities Rules**: Clearer guidelines for token classification
- **Institutional Custody**: Enhanced requirements for qualified custodians
- **Market Making**: New rules for crypto market makers
- **Impact**: Positive for institutional adoption

### CFTC Jurisdiction Expansion
- **Commodity Designation**: Bitcoin and Ethereum officially recognized
- **Derivatives Oversight**: Enhanced oversight of crypto derivatives
- **Enforcement**: Streamlined enforcement procedures
- **Market Response**: Reduced regulatory uncertainty

## European Union Progress

### MiCA Implementation
- **Timeline**: Full implementation by January 2026
- **Stablecoin Regulations**: Specific requirements for issuers
- **Service Provider Licensing**: Unified licensing across EU
- **Compliance Cost**: Estimated €50M for major exchanges

### Digital Euro Pilot
- **Testing Phase**: Central bank digital currency trials
- **Privacy Framework**: Balancing privacy with compliance
- **Integration**: Compatibility with existing crypto infrastructure
- **Timeline**: Potential launch by 2027

## Asia-Pacific Developments

### Singapore Expansion
- **Digital Asset Services**: Expanded MAS framework
- **Institutional Focus**: Targeting family offices and funds
- **Innovation Sandbox**: 20 new projects approved
- **Market Impact**: Increased regional trading volume

### Japan Regulatory Refinement
- **Stablecoin Framework**: New classification system
- **Tax Optimization**: Improved tax treatment for trading
- **Cross-Border Services**: Enhanced international cooperation
- **Industry Response**: Positive reception from local exchanges

### Hong Kong Virtual Asset Framework
- **Retail Access**: Limited retail investor participation
- **Professional Investors**: Full access to crypto products
- **Licensing**: 8 exchanges granted full licenses
- **Outlook**: Growing regional hub status

## Emerging Market Policies

### Brazil's Crypto Law
- **Legal Framework**: Comprehensive crypto legislation
- **Central Bank Oversight**: BCB regulatory authority
- **Tax Clarity**: Clear taxation guidelines
- **Market Size**: $25B local crypto market

### UAE Continued Leadership
- **VARA Regulations**: Dubai's comprehensive framework
- **Free Zones**: Crypto-friendly business environments
- **CBDC Development**: Digital dirham pilot program
- **International Hub**: Growing Middle East influence

## Market Impact Analysis

### Institutional Adoption Drivers
1. **Regulatory Clarity**: Reduced compliance uncertainty
2. **Custody Solutions**: Professional-grade storage requirements
3. **Tax Treatment**: Clearer accounting standards
4. **Cross-Border**: Streamlined international operations

### Short-term Market Effects
- **Compliance Costs**: Temporary pressure on smaller players
- **Consolidation**: Market share concentration
- **Premium Valuation**: Compliant exchanges gaining premium
- **Geographic Shifts**: Capital flows to clear jurisdictions

## Compliance Considerations

### For Exchanges
- **Multi-jurisdictional Licensing**: Operating in multiple regions
- **KYC/AML Enhancement**: Upgraded customer verification
- **Reporting Requirements**: Comprehensive transaction reporting
- **Technology Investment**: Compliance infrastructure development

### For Institutional Investors
- **Qualified Custody**: Professional custody requirements
- **Audit Trails**: Complete transaction documentation
- **Risk Management**: Enhanced risk assessment protocols
- **Regulatory Reporting**: Regular compliance reporting

## Future Outlook

### Q4 2025 Expectations
- **G20 Coordination**: Potential unified approach
- **CBDC Developments**: Multiple pilot programs
- **DeFi Regulation**: Specific framework development
- **Stablecoin Standards**: International standardization

### 2026 Predictions
- **Mature Framework**: Most major jurisdictions with clear rules
- **Innovation Balance**: Regulation supporting innovation
- **Global Standards**: Increased international coordination
- **Market Maturity**: Professional-grade market infrastructure

## Strategic Recommendations

### For Market Participants
1. **Proactive Compliance**: Stay ahead of regulatory requirements
2. **Geographic Diversification**: Operations in multiple friendly jurisdictions
3. **Professional Services**: Engage regulatory and legal experts
4. **Industry Engagement**: Participate in policy discussions

### For Investors
1. **Regulatory Premium**: Consider compliance in investment decisions
2. **Jurisdiction Risk**: Assess regulatory risk by geography
3. **Long-term View**: Regulation ultimately supportive of adoption
4. **Professional Advice**: Consult with qualified advisors

## Conclusion
The regulatory environment for cryptocurrencies is rapidly maturing, with most major jurisdictions moving toward comprehensive frameworks. While compliance costs may increase in the short term, clearer regulations are expected to drive institutional adoption and market maturity in the medium to long term.
    `,
    metrics: {
      views: 2789,
      likes: 198,
      shares: 31
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
              {marketReports.filter(r => r.date >= '2025-08-25').length}
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
