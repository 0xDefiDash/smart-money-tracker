
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
            <TabsContent value="top10" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Top 10 Wallet Holders - Detailed Analysis
                  </CardTitle>
                  <CardDescription>
                    Comprehensive transaction history and risk analysis for each top wallet holder
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.holderAnalysis.topHolders.map((holder, index) => {
                    const detailedAnalysis = holder.detailedAnalysis
                    
                    const riskColor = 
                      holder.riskLevel === 'high' ? 'border-red-500' :
                      holder.riskLevel === 'medium' ? 'border-orange-500' :
                      holder.riskLevel === 'low' ? 'border-yellow-500' :
                      'border-green-500'
                    
                    const riskBgColor = 
                      holder.riskLevel === 'high' ? 'bg-red-50 dark:bg-red-950/20' :
                      holder.riskLevel === 'medium' ? 'bg-orange-50 dark:bg-orange-950/20' :
                      holder.riskLevel === 'low' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                      'bg-green-50 dark:bg-green-950/20'
                    
                    return (
                      <div key={index} className={`border-2 ${riskColor} ${riskBgColor} rounded-lg overflow-hidden`}>
                        {/* Wallet Header */}
                        <div className="p-4 border-b bg-background/50">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                #{index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-semibold">{holder.address}</span>
                                  {holder.label && (
                                    <Badge variant="secondary">{holder.label}</Badge>
                                  )}
                                  {holder.previousScams && holder.previousScams > 0 && (
                                    <Badge variant="destructive">
                                      ⚠️ {holder.previousScams} SCAMS
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Holds {holder.percentage}% • {holder.balance} tokens
                                  {holder.walletAge && ` • Wallet Age: ${holder.walletAge}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                holder.riskLevel === 'high' ? 'destructive' as const :
                                holder.riskLevel === 'medium' ? 'secondary' as const :
                                'outline' as const
                              } className="text-xs">
                                {holder.riskLevel?.toUpperCase()} RISK
                              </Badge>
                              {detailedAnalysis && (
                                <Badge variant="outline" className="text-xs">
                                  Risk Score: {detailedAnalysis.riskScore}/100
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Analysis Content */}
                        {detailedAnalysis ? (
                          <div className="p-4 space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Card>
                                <CardContent className="pt-4 pb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Total Transactions</div>
                                  <div className="text-xl font-bold">{detailedAnalysis.totalTransactions}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4 pb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Trading Frequency</div>
                                  <div className="text-sm font-semibold">{detailedAnalysis.tradingFrequency}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4 pb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Avg Hold Time</div>
                                  <div className="text-xl font-bold">{detailedAnalysis.averageHoldTime}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4 pb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Current Profit</div>
                                  <div className={`text-xl font-bold ${
                                    detailedAnalysis.profitPercentage > 0 ? 'text-green-500' : 
                                    detailedAnalysis.profitPercentage < 0 ? 'text-red-500' : ''
                                  }`}>
                                    {detailedAnalysis.currentProfit}
                                  </div>
                                  <div className={`text-xs ${
                                    detailedAnalysis.profitPercentage > 0 ? 'text-green-500' : 
                                    detailedAnalysis.profitPercentage < 0 ? 'text-red-500' : 'text-muted-foreground'
                                  }`}>
                                    {detailedAnalysis.profitPercentage > 0 ? '+' : ''}{detailedAnalysis.profitPercentage.toFixed(2)}%
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Trading Activity */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3 rounded-lg border bg-background/50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Total Bought</span>
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-lg font-bold mt-1">{detailedAnalysis.totalBought}</div>
                              </div>
                              <div className="p-3 rounded-lg border bg-background/50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Total Sold</span>
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="text-lg font-bold mt-1">{detailedAnalysis.totalSold}</div>
                              </div>
                              <div className="p-3 rounded-lg border bg-background/50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">First Activity</span>
                                  <Activity className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-sm font-semibold mt-1">{detailedAnalysis.firstTransaction}</div>
                                <div className="text-xs text-muted-foreground">Last: {detailedAnalysis.lastTransaction}</div>
                              </div>
                            </div>

                            {/* Suspicious Patterns */}
                            {detailedAnalysis.suspiciousPatterns && detailedAnalysis.suspiciousPatterns.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Pattern Analysis
                                </h4>
                                <div className="space-y-2">
                                  {detailedAnalysis.suspiciousPatterns.map((pattern, pidx) => (
                                    <div 
                                      key={pidx} 
                                      className={`p-2 rounded text-sm ${
                                        pattern.includes('No suspicious') 
                                          ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800'
                                          : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800'
                                      }`}
                                    >
                                      {pattern.includes('No suspicious') ? '✅' : '⚠️'} {pattern}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Risk Flags from General Analysis */}
                            {holder.riskFlags && holder.riskFlags.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Risk Indicators
                                </h4>
                                <div className="space-y-2">
                                  {holder.riskFlags.map((flag, fidx) => (
                                    <div 
                                      key={fidx} 
                                      className={`p-2 rounded text-sm ${
                                        flag.includes('✅') 
                                          ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800'
                                          : flag.includes('🔴') || flag.includes('⚠️')
                                          ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
                                          : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800'
                                      }`}
                                    >
                                      {flag}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recent Transactions */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Recent Transactions
                              </h4>
                              <div className="space-y-2">
                                {detailedAnalysis.recentTransactions.slice(0, 5).map((tx, txidx) => (
                                  <div key={txidx} className="p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant={tx.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                            {tx.type.toUpperCase()}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">{tx.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-semibold">{tx.amount}</span>
                                          <span className="text-xs text-muted-foreground">≈ {tx.amountUsd}</span>
                                          {tx.gasFee && (
                                            <span className="text-xs text-muted-foreground">• Gas: {tx.gasFee}</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                                          {tx.hash}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-shrink-0 h-8 w-8 p-0"
                                        onClick={() => copyToClipboard(tx.hash)}
                                      >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {detailedAnalysis.recentTransactions.length > 5 && (
                                <div className="text-center mt-3">
                                  <span className="text-xs text-muted-foreground">
                                    Showing 5 of {detailedAnalysis.recentTransactions.length} transactions
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Detailed transaction analysis not available for this wallet. This could be due to:
                                <ul className="list-disc list-inside mt-2 text-xs">
                                  <li>Initial token distribution (no buy/sell history)</li>
                                  <li>Contract wallet or liquidity pool</li>
                                  <li>API rate limits or data availability</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
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
