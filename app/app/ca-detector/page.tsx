
'use client'

import { useState } from 'react'
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
  Check
} from 'lucide-react'
import { ContractAnalysisResult } from '@/lib/types'

export default function CADetectorPage() {
  const [contractAddress, setContractAddress] = useState('')
  const [blockchain, setBlockchain] = useState('ethereum')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="holders">Holders</TabsTrigger>
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
                    <h4 className="font-semibold mb-3">Top Holders</h4>
                    <div className="space-y-2">
                      {analysis.holderAnalysis.topHolders.map((holder, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-mono text-sm">{holder.address}</div>
                              {holder.label && (
                                <Badge variant="secondary" className="mt-1 text-xs">{holder.label}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{holder.percentage}%</div>
                            <div className="text-xs text-muted-foreground">{holder.balance}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
