
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Lock,
  Unlock,
  DollarSign,
  Activity,
  FileText,
  Search,
  Loader2,
  Info,
  ExternalLink,
  Copy,
  Check,
  Trophy,
  Star,
  Eye,
  Target
} from 'lucide-react'
import { ContractAnalysisResult } from '@/lib/types'

interface TopScan {
  id: string
  contractAddress: string
  blockchain: string
  contractName: string | null
  contractSymbol: string | null
  riskScore: number
  riskLevel: string
  isVerified: boolean
  scanCount: number
  lastScannedAt: string
}

export default function CADetectorPage() {
  const [contractAddress, setContractAddress] = useState('')
  const [blockchain, setBlockchain] = useState('ethereum')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [topScans, setTopScans] = useState<TopScan[]>([])
  const [loadingTopScans, setLoadingTopScans] = useState(true)

  // Fetch top scans on component mount
  useEffect(() => {
    const fetchTopScans = async () => {
      try {
        const response = await fetch('/api/ca-detector/top-scans')
        if (response.ok) {
          const data = await response.json()
          setTopScans(data)
        }
      } catch (error) {
        console.error('Error fetching top scans:', error)
      } finally {
        setLoadingTopScans(false)
      }
    }

    fetchTopScans()
  }, [])

  const handleAnalyze = async () => {
    if (!contractAddress) {
      setError('Please enter a contract address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ca-detector/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, blockchain })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze contract')
      }

      const data = await response.json()
      setAnalysis(data)
      
      // Refresh top scans after a new analysis
      const topScansResponse = await fetch('/api/ca-detector/top-scans')
      if (topScansResponse.ok) {
        const topScansData = await topScansResponse.json()
        setTopScans(topScansData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'High Risk'
    if (score >= 50) return 'Medium Risk'
    return 'Low Risk'
  }

  const getRiskBadgeColor = (score: number): "default" | "destructive" | "outline" | "secondary" => {
    if (score >= 80) return 'destructive'
    if (score >= 50) return 'secondary'
    return 'default'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" />
          CA Detector
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze smart contracts for potential risks, manipulation, and security concerns
        </p>
      </div>

      {/* Top 10 Scanned Contracts Leaderboard */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Top 10 Scanned Contracts</CardTitle>
              <CardDescription>Most analyzed tokens with their risk scores</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTopScans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : topScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No contracts scanned yet. Be the first to analyze a contract!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topScans.map((scan, index) => {
                const getRankIcon = (rank: number) => {
                  if (rank === 0) return '🥇'
                  if (rank === 1) return '🥈'
                  if (rank === 2) return '🥉'
                  return `${rank + 1}`
                }

                const getRankColor = (rank: number) => {
                  if (rank === 0) return 'from-yellow-400 to-orange-500'
                  if (rank === 1) return 'from-gray-300 to-gray-400'
                  if (rank === 2) return 'from-amber-600 to-amber-700'
                  return 'from-blue-500 to-purple-500'
                }

                const getRiskBgColor = (score: number) => {
                  if (score >= 80) return 'bg-red-500/10 border-red-500/30'
                  if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/30'
                  return 'bg-green-500/10 border-green-500/30'
                }

                const getRiskTextColor = (score: number) => {
                  if (score >= 80) return 'text-red-500'
                  if (score >= 50) return 'text-yellow-500'
                  return 'text-green-500'
                }

                return (
                  <div
                    key={scan.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getRiskBgColor(scan.riskScore)} hover:shadow-lg transition-all cursor-pointer group`}
                    onClick={() => {
                      setContractAddress(scan.contractAddress)
                      setBlockchain(scan.blockchain)
                      window.scrollTo({ top: 400, behavior: 'smooth' })
                    }}
                  >
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {getRankIcon(index)}
                    </div>

                    {/* Contract Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate group-hover:text-blue-500 transition-colors">
                          {scan.contractSymbol || 'Unknown'} - {scan.contractName || 'Unknown Token'}
                        </h3>
                        {scan.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {scan.contractAddress.slice(0, 6)}...{scan.contractAddress.slice(-4)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {scan.blockchain}
                        </Badge>
                      </div>
                    </div>

                    {/* Risk Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-2xl font-bold ${getRiskTextColor(scan.riskScore)}`}>
                        {scan.riskScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>

                    {/* Scan Count */}
                    <div className="flex-shrink-0 text-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{scan.scanCount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">scans</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Analysis</CardTitle>
          <CardDescription>
            Enter a contract address to analyze its security, holder distribution, and transaction patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="contract-address">Contract Address</Label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockchain">Blockchain</Label>
              <Select value={blockchain} onValueChange={setBlockchain} disabled={loading}>
                <SelectTrigger id="blockchain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || !contractAddress}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Contract
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Risk Score Overview */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Risk Assessment</CardTitle>
                <Badge variant={getRiskBadgeColor(analysis.riskScore)} className="text-lg px-4 py-2">
                  {getRiskLevel(analysis.riskScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Risk Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(analysis.riskScore)}`}>
                    {analysis.riskScore}/100
                  </span>
                </div>
                <Progress value={analysis.riskScore} className="h-3" />
              </div>

              {/* Contract Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Contract Name:</Label>
                    <span className="font-semibold">{analysis.contractInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Symbol:</Label>
                    <span className="font-semibold">{analysis.contractInfo.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Total Supply:</Label>
                    <span className="font-semibold">{analysis.contractInfo.totalSupply}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Contract Age:</Label>
                    <span className="font-semibold">{analysis.contractInfo.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Verified:</Label>
                    {analysis.contractInfo.isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Address:</Label>
                    <span className="font-mono text-xs">{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contractAddress)}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="holders">Holders</TabsTrigger>
              <TabsTrigger value="top10">Top 10 Wallets</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.securityChecks.map((check, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      {check.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{check.name}</h4>
                          <Badge variant={check.severity === 'critical' ? 'destructive' : check.severity === 'warning' ? 'secondary' : 'outline'}>
                            {check.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                        {check.details && (
                          <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                            {check.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Holders Tab */}
            <TabsContent value="holders" className="space-y-4">
              {/* API Key Configuration Alert for Holders */}
              {analysis.holderAnalysis.holdersDataUnavailable && (
                <Alert className="border-2 border-blue-500 bg-blue-50/10">
                  <Info className="h-5 w-5" />
                  <AlertDescription className="space-y-2">
                    <div className="font-bold">Blockchain Explorer API Keys Not Configured</div>
                    <p className="text-sm">
                      Wallet holder data requires blockchain explorer API keys. Please see the <strong>Top 10 Wallets</strong> tab for detailed setup instructions.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Free API keys are available from Etherscan, BSCScan, PolygonScan, Arbiscan, and BaseScan.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Known Scammers Alert */}
              {analysis.transactionAnalysis.knownScammers && analysis.transactionAnalysis.knownScammers.length > 0 && (
                <Alert variant="destructive" className="border-2 border-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertDescription className="space-y-2">
                    <div className="font-bold text-lg">🚨 CRITICAL: KNOWN SCAMMERS DETECTED</div>
                    <p className="text-sm">
                      {analysis.transactionAnalysis.knownScammers.length} wallet(s) with documented history of pump & dump schemes are currently holding this token.
                    </p>
                    <div className="mt-3 space-y-2">
                      {analysis.transactionAnalysis.knownScammers.map((scammer, idx) => (
                        <div key={idx} className="p-3 bg-red-950/20 rounded border border-red-800">
                          <div className="font-mono text-sm">{scammer.address}</div>
                          <div className="text-xs mt-1 space-y-1">
                            <div>• {scammer.scamCount} previous scams ({scammer.totalLoss} in losses)</div>
                            <div>• Last scam: {scammer.lastScam}</div>
                            <div>• Types: {scammer.scamTypes.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Wallet Pattern Alerts */}
              {analysis.transactionAnalysis.walletPatternAlerts && analysis.transactionAnalysis.walletPatternAlerts.length > 0 && (
                <Card className="border-2 border-orange-500 bg-orange-50/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-500">
                      <AlertTriangle className="w-5 h-5" />
                      Suspicious Wallet Patterns Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.transactionAnalysis.walletPatternAlerts.map((alert, idx) => (
                      <Alert key={idx} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertDescription className="space-y-2">
                          <div className="font-semibold">{alert.alertType.replace(/_/g, ' ').toUpperCase()}</div>
                          <p className="text-sm">{alert.description}</p>
                          <div className="text-xs space-y-1 mt-2 pl-3 border-l-2 border-muted">
                            {alert.evidence.map((evidence, eidx) => (
                              <div key={eidx}>• {evidence}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Holder Distribution Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{analysis.holderAnalysis.totalHolders}</div>
                          <div className="text-sm text-muted-foreground">Total Holders</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{analysis.holderAnalysis.top10Percentage}%</div>
                          <div className="text-sm text-muted-foreground">Top 10 Holdings</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{analysis.holderAnalysis.contractHoldings}%</div>
                          <div className="text-sm text-muted-foreground">Contract Holdings</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Top Holders with Risk Analysis</h4>
                    <div className="space-y-2">
                      {analysis.holderAnalysis.topHolders.map((holder, index) => {
                        const riskColor = 
                          holder.riskLevel === 'high' ? 'border-red-500 bg-red-50/10' :
                          holder.riskLevel === 'medium' ? 'border-orange-500 bg-orange-50/10' :
                          holder.riskLevel === 'low' ? 'border-yellow-500 bg-yellow-50/10' :
                          'border-green-500 bg-green-50/10'
                        
                        const riskBadgeVariant = 
                          holder.riskLevel === 'high' ? 'destructive' as const :
                          holder.riskLevel === 'medium' ? 'secondary' as const :
                          'outline' as const
                        
                        return (
                          <div key={index} className={`p-3 rounded-lg border-2 ${riskColor}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="font-mono text-sm break-all">{holder.address}</div>
                                    {holder.label && (
                                      <Badge variant="secondary" className="text-xs">{holder.label}</Badge>
                                    )}
                                    {holder.riskLevel && (
                                      <Badge variant={riskBadgeVariant} className="text-xs">
                                        {holder.riskLevel.toUpperCase()} RISK
                                      </Badge>
                                    )}
                                    {holder.previousScams && holder.previousScams > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        ⚠️ {holder.previousScams} SCAMS
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {holder.walletAge && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Wallet Age: {holder.walletAge}
                                    </div>
                                  )}
                                  
                                  {holder.riskFlags && holder.riskFlags.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {holder.riskFlags.map((flag, fidx) => (
                                        <div key={fidx} className="text-xs p-2 bg-muted rounded">
                                          {flag}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-3 flex-shrink-0">
                                <div className="font-semibold">{holder.percentage}%</div>
                                <div className="text-xs text-muted-foreground">{holder.balance}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top 10 Wallets Tab */}
            <TabsContent value="top10" className="space-y-6">
              {/* API Key Configuration Alert */}
              {analysis.holderAnalysis.holdersDataUnavailable && (
                <Alert className="border-2 border-orange-500/50 bg-gradient-to-r from-orange-50/10 to-amber-50/10 dark:from-orange-950/20 dark:to-amber-950/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <AlertDescription className="space-y-3">
                    <div className="font-bold text-lg">⚠️ Blockchain Explorer API Keys Required</div>
                    <p className="text-sm">
                      To display detailed wallet holder analysis, you need to configure API keys for blockchain explorers. 
                      This allows the system to fetch transaction history and holder data from the blockchain.
                    </p>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg backdrop-blur">
                      <div className="font-semibold mb-2">How to Configure API Keys:</div>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Get free API keys from:
                          <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                            <li><strong>Ethereum:</strong> <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Etherscan API</a></li>
                            <li><strong>BSC:</strong> <a href="https://bscscan.com/apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">BscScan API</a></li>
                            <li><strong>Polygon:</strong> <a href="https://polygonscan.com/apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">PolygonScan API</a></li>
                            <li><strong>Arbitrum:</strong> <a href="https://arbiscan.io/apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Arbiscan API</a></li>
                            <li><strong>Base:</strong> <a href="https://basescan.org/apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">BaseScan API</a></li>
                          </ul>
                        </li>
                        <li className="mt-2">Add the API keys to your <code className="bg-background px-1 rounded">.env</code> file:
                          <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
{`ETHERSCAN_API_KEY=your_etherscan_key
BSCSCAN_API_KEY=your_bscscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key
BASESCAN_API_KEY=your_basescan_key`}
                          </pre>
                        </li>
                        <li>Restart the application to load the new API keys</li>
                      </ol>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Note:</strong> All listed explorer APIs offer free tiers that are sufficient for personal use.
                      Without these keys, you can still view other analysis features like security checks, liquidity info, and transaction patterns.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Header Card */}
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Top 10 Wallet Holders
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Comprehensive transaction history and risk analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Empty State */}
              {analysis.holderAnalysis.topHolders.length === 0 && !analysis.holderAnalysis.holdersDataUnavailable ? (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Info className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">No Wallet Holder Data Available</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          This could be due to several reasons:
                        </p>
                        <ul className="list-none mt-3 space-y-1 text-sm text-muted-foreground">
                          <li>• Token is newly launched with no established holders yet</li>
                          <li>• Token holder list is not publicly available on blockchain explorers</li>
                          <li>• Data synchronization delay from blockchain to explorer APIs</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
                  
              {/* Holders List */}
              <div className="space-y-4">
                {analysis.holderAnalysis.topHolders.map((holder, index) => {
                  const detailedAnalysis = holder.detailedAnalysis
                  
                  const riskConfig = {
                    high: {
                      border: 'border-red-500/50',
                      gradient: 'from-red-50/80 to-red-100/80 dark:from-red-950/20 dark:to-red-900/20',
                      badge: 'bg-red-500',
                      icon: '🔴',
                      text: 'HIGH RISK'
                    },
                    medium: {
                      border: 'border-orange-500/50',
                      gradient: 'from-orange-50/80 to-amber-100/80 dark:from-orange-950/20 dark:to-amber-900/20',
                      badge: 'bg-orange-500',
                      icon: '⚠️',
                      text: 'MEDIUM RISK'
                    },
                    low: {
                      border: 'border-yellow-500/50',
                      gradient: 'from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/20 dark:to-amber-950/20',
                      badge: 'bg-yellow-500',
                      icon: '⚡',
                      text: 'LOW RISK'
                    },
                    minimal: {
                      border: 'border-green-500/50',
                      gradient: 'from-green-50/80 to-emerald-100/80 dark:from-green-950/20 dark:to-emerald-900/20',
                      badge: 'bg-green-500',
                      icon: '✅',
                      text: 'MINIMAL RISK'
                    }
                  }
                  
                  const config = riskConfig[holder.riskLevel as keyof typeof riskConfig] || riskConfig.minimal
                  
                  return (
                    <Card key={index} className={`border-2 ${config.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                      {/* Gradient Header */}
                      <div className={`bg-gradient-to-r ${config.gradient} p-6 border-b-2 ${config.border}`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Rank Badge */}
                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-2xl">#{index + 1}</span>
                              </div>
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow">
                                  <Trophy className="w-3 h-3 text-yellow-900" />
                                </div>
                              )}
                            </div>
                            
                            {/* Wallet Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-mono text-base font-bold truncate">{holder.address}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-background/50"
                                  onClick={() => copyToClipboard(holder.address)}
                                >
                                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                                {holder.label && (
                                  <Badge variant="secondary" className="text-xs font-semibold">
                                    <Star className="w-3 h-3 mr-1" />
                                    {holder.label}
                                  </Badge>
                                )}
                                {holder.previousScams && holder.previousScams > 0 && (
                                  <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                                    ⚠️ {holder.previousScams} SCAM{holder.previousScams > 1 ? 'S' : ''}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Holdings Bar */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold">Token Holdings</span>
                                  <span className="font-bold text-lg">{holder.percentage}%</span>
                                </div>
                                <div className="relative h-3 bg-background/50 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(holder.percentage, 100)}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{holder.balance} tokens</span>
                                  {holder.walletAge && <span>Age: {holder.walletAge}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Risk Badges */}
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={`${config.badge} text-white px-3 py-1 text-sm font-bold shadow-lg`}>
                              {config.icon} {config.text}
                            </Badge>
                            {detailedAnalysis && (
                              <Badge variant="outline" className="bg-background/80 backdrop-blur text-sm font-semibold">
                                Score: {detailedAnalysis.riskScore}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis Content */}
                      {detailedAnalysis ? (
                        detailedAnalysis.totalTransactions > 0 ? (
                        <CardContent className="p-6 space-y-6 bg-background/50">
                          {/* Key Metrics Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Transactions</span>
                                <Activity className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{detailedAnalysis.totalTransactions}</div>
                              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">{detailedAnalysis.tradingFrequency}</div>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Hold Time</span>
                                <Target className="w-4 h-4 text-purple-500" />
                              </div>
                              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{detailedAnalysis.averageHoldTime}</div>
                              <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Average</div>
                            </div>
                            
                            <div className={`p-4 rounded-xl border ${
                              detailedAnalysis.profitPercentage > 0 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'
                                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200/50 dark:border-red-800/50'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-medium ${detailedAnalysis.profitPercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  Profit/Loss
                                </span>
                                {detailedAnalysis.profitPercentage > 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className={`text-2xl font-bold ${
                                detailedAnalysis.profitPercentage > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                              }`}>
                                {detailedAnalysis.currentProfit}
                              </div>
                              <div className={`text-xs font-semibold mt-1 ${
                                detailedAnalysis.profitPercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {detailedAnalysis.profitPercentage > 0 ? '↗' : '↘'} {detailedAnalysis.profitPercentage > 0 ? '+' : ''}{detailedAnalysis.profitPercentage.toFixed(2)}%
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Risk Score</span>
                                <Shield className="w-4 h-4 text-amber-500" />
                              </div>
                              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{detailedAnalysis.riskScore}</div>
                              <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">out of 100</div>
                            </div>
                          </div>

                          {/* Trading Activity */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Bought</span>
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-xl font-bold text-green-800 dark:text-green-200">{detailedAnalysis.totalBought}</div>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-red-200/50 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Total Sold</span>
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-xl font-bold text-red-800 dark:text-red-200">{detailedAnalysis.totalSold}</div>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">First Activity</span>
                                  <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">{detailedAnalysis.firstTransaction}</div>
                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Last: {detailedAnalysis.lastTransaction}</div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Suspicious Patterns */}
                          {detailedAnalysis.suspiciousPatterns && detailedAnalysis.suspiciousPatterns.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-bold text-base flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                  <AlertTriangle className="w-4 h-4 text-white" />
                                </div>
                                Pattern Analysis
                              </h4>
                              <div className="grid gap-2">
                                {detailedAnalysis.suspiciousPatterns.map((pattern, pidx) => (
                                  <div 
                                    key={pidx} 
                                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                                      pattern.includes('No suspicious') 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-800 dark:text-green-200 border-2 border-green-300/50 dark:border-green-700/50'
                                        : 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-950/40 dark:to-amber-950/40 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-300/50 dark:border-yellow-700/50'
                                    }`}
                                  >
                                    <span className="text-lg mr-2">{pattern.includes('No suspicious') ? '✅' : '⚠️'}</span>
                                    {pattern}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Risk Flags from General Analysis */}
                          {holder.riskFlags && holder.riskFlags.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-bold text-base flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-white" />
                                </div>
                                Risk Indicators
                              </h4>
                              <div className="grid gap-2">
                                {holder.riskFlags.map((flag, fidx) => (
                                  <div 
                                    key={fidx} 
                                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                                      flag.includes('✅') 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-800 dark:text-green-200 border-2 border-green-300/50 dark:border-green-700/50'
                                        : flag.includes('🔴') || flag.includes('⚠️')
                                        ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/40 dark:to-rose-950/40 text-red-800 dark:text-red-200 border-2 border-red-300/50 dark:border-red-700/50'
                                        : 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-950/40 dark:to-amber-950/40 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-300/50 dark:border-yellow-700/50'
                                    }`}
                                  >
                                    {flag}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Transactions */}
                          <div className="space-y-3">
                            <h4 className="font-bold text-base flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              Recent Transactions
                            </h4>
                            <div className="space-y-3">
                              {detailedAnalysis.recentTransactions.slice(0, 5).map((tx, txidx) => (
                                <Card key={txidx} className={`overflow-hidden border-l-4 ${
                                  tx.type === 'buy' 
                                    ? 'border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20' 
                                    : 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20'
                                } hover:shadow-md transition-all duration-200`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge 
                                            className={`${
                                              tx.type === 'buy' 
                                                ? 'bg-green-500 hover:bg-green-600' 
                                                : 'bg-red-500 hover:bg-red-600'
                                            } text-white font-bold px-3 py-1`}
                                          >
                                            {tx.type === 'buy' ? '📈 BUY' : '📉 SELL'}
                                          </Badge>
                                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {tx.timestamp}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-blue-500" />
                                            <span className="text-base font-bold">{tx.amount}</span>
                                          </div>
                                          <span className="text-sm text-muted-foreground">≈ {tx.amountUsd}</span>
                                          {tx.gasFee && (
                                            <Badge variant="outline" className="text-xs">
                                              ⛽ {tx.gasFee}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                          <span className="text-xs font-mono text-muted-foreground truncate">
                                            {tx.hash}
                                          </span>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-shrink-0 h-9 w-9 p-0 hover:bg-background"
                                        onClick={() => copyToClipboard(tx.hash)}
                                        title="Copy transaction hash"
                                      >
                                        {copied ? (
                                          <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            {detailedAnalysis.recentTransactions.length > 5 && (
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium text-muted-foreground">
                                  📊 Showing 5 of {detailedAnalysis.recentTransactions.length} transactions
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        ) : (
                          <CardContent className="p-6">
                            <Card className="border-dashed border-2 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10">
                              <CardContent className="pt-8 pb-8">
                                <div className="text-center space-y-4">
                                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                    <Info className="h-8 w-8 text-blue-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg mb-2">No Transaction History Available</h4>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                      This wallet holder has no buy/sell transaction history for this token.
                                    </p>
                                    <div className="flex flex-col items-center gap-2 text-sm">
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span>Initial token distribution or airdrop recipient</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <span>Pre-sale or private sale allocation</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                                        <span>Contract wallet, liquidity pool, or exchange wallet</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                        <span>Tokens transferred from another wallet</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                    <div className="flex items-center justify-center gap-3 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold text-sm">Current Holdings:</span>
                                      </div>
                                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{holder.percentage}%</span>
                                      <span className="text-sm text-muted-foreground">({holder.balance} tokens)</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </CardContent>
                        )
                      ) : (
                        <CardContent className="p-6">
                          <Card className="border-2 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/10">
                            <CardContent className="pt-8 pb-8">
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg mb-2">Detailed Analysis Unavailable</h4>
                                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                    Unable to fetch detailed transaction analysis for this wallet.
                                  </p>
                                  <div className="flex flex-col items-center gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                      <span>Initial token distribution (no buy/sell history)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                      <span>Contract wallet or liquidity pool</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                      <span>API rate limits or data availability</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Liquidity Tab */}
            <TabsContent value="liquidity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Liquidity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">${analysis.liquidityInfo.totalLiquidityUSD}</div>
                            <div className="text-sm text-muted-foreground">Total Liquidity</div>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                              {analysis.liquidityInfo.isLocked ? (
                                <Lock className="w-6 h-6 text-green-500" />
                              ) : (
                                <Unlock className="w-6 h-6 text-red-500" />
                              )}
                              {analysis.liquidityInfo.isLocked ? 'Locked' : 'Unlocked'}
                            </div>
                            <div className="text-sm text-muted-foreground">Liquidity Status</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analysis.liquidityInfo.isLocked && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        Liquidity is locked until {analysis.liquidityInfo.lockUntil}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold">Liquidity Pools</h4>
                    {analysis.liquidityInfo.pools.map((pool, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-semibold">{pool.dex}</div>
                          <div className="text-sm text-muted-foreground">{pool.pair}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${pool.liquidityUSD}</div>
                          <div className="text-xs text-muted-foreground">{pool.volume24h} 24h vol</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Transaction Pattern Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{analysis.transactionAnalysis.totalTransactions}</div>
                          <div className="text-sm text-muted-foreground">Total Transactions</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{analysis.transactionAnalysis.uniqueWallets}</div>
                          <div className="text-sm text-muted-foreground">Unique Wallets</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">${analysis.transactionAnalysis.volume24h}</div>
                          <div className="text-sm text-muted-foreground">24h Volume</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Detected Anomalies</h4>
                    {analysis.transactionAnalysis.anomalies.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.transactionAnalysis.anomalies.map((anomaly, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="font-semibold">{anomaly.type}</div>
                              <div className="text-sm mt-1">{anomaly.description}</div>
                              <div className="text-xs mt-2 opacity-75">{anomaly.timestamp}</div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          No suspicious transaction patterns detected
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Trading Patterns</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">Average Buy Size</span>
                        <span className="font-semibold">${analysis.transactionAnalysis.avgBuySize}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">Average Sell Size</span>
                        <span className="font-semibold">${analysis.transactionAnalysis.avgSellSize}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">Buy/Sell Ratio</span>
                        <span className="font-semibold">{analysis.transactionAnalysis.buySellRatio}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Comprehensive Risk Report
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis and recommendations for investors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Critical Concerns */}
                  {analysis.report.criticalConcerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Concerns
                      </h4>
                      <div className="space-y-2">
                        {analysis.report.criticalConcerns.map((concern, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertDescription>{concern}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {analysis.report.warnings.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Warnings
                      </h4>
                      <div className="space-y-2">
                        {analysis.report.warnings.map((warning, index) => (
                          <Alert key={index}>
                            <AlertDescription>{warning}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Positive Indicators */}
                  {analysis.report.positiveIndicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Positive Indicators
                      </h4>
                      <div className="space-y-2">
                        {analysis.report.positiveIndicators.map((indicator, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Overall Recommendation */}
                  <div className="p-4 rounded-lg border-2 bg-muted/50">
                    <h4 className="font-semibold mb-2">Overall Recommendation</h4>
                    <p className="text-sm text-muted-foreground">{analysis.report.recommendation}</p>
                  </div>

                  {/* Additional Resources */}
                  <div>
                    <h4 className="font-semibold mb-3">Additional Resources</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-between" asChild>
                        <a href={`https://etherscan.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
                          View on Block Explorer
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-between">
                        Export Full Report
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Info Section */}
      {!analysis && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold">What does the CA Detector analyze?</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Known Scammer Detection:</strong> Identifies wallets with history of pump & dump schemes</li>
                  <li><strong>Wallet Pattern Analysis:</strong> Detects coordinated trading and wash trading</li>
                  <li><strong>Holder Risk Profiling:</strong> Analyzes each top holder's transaction history and risk level</li>
                  <li>Honeypot and rug pull detection</li>
                  <li>Ownership and admin privileges</li>
                  <li>Token holder distribution and concentration</li>
                  <li>Liquidity status and lock periods</li>
                  <li>Transaction patterns and anomalies</li>
                  <li>Smart contract security vulnerabilities</li>
                  <li>Buy/sell tax analysis</li>
                  <li>Trading volume and market manipulation signs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
