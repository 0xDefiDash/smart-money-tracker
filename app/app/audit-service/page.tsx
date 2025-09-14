
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Search,
  FileText,
  Activity,
  Lock,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditResult {
  contractId: string
  contractName: string
  network: string
  totalScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  vulnerabilities: {
    id: string
    title: string
    severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
    recommendation: string
    codeSnippet?: string
  }[]
  securityChecks: {
    category: string
    passed: number
    total: number
    issues: string[]
  }[]
  gasAnalysis: {
    averageGasUsage: number
    gasOptimization: string
    efficientFunctions: number
    totalFunctions: number
  }
  summary: {
    totalIssues: number
    criticalIssues: number
    highIssues: number
    mediumIssues: number
    lowIssues: number
  }
  lastUpdated: string
  bevorAuditId?: string
  processingTime?: number | null
}

export default function AuditServicePage() {
  const [contractId, setContractId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Starting audit...')

  const handleAudit = async () => {
    if (!contractId.trim()) {
      setError('Please enter a valid smart contract address')
      return
    }

    setIsLoading(true)
    setError(null)
    setAuditResult(null)
    setLoadingMessage('Initializing smart contract audit...')

    try {
      // Simulate different loading stages for better UX
      const loadingStages = [
        'Scanning contract address...',
        'Retrieving source code...',
        'Running security analysis...',
        'Analyzing vulnerabilities...',
        'Generating report...'
      ]
      
      let currentStage = 0
      const progressInterval = setInterval(() => {
        if (currentStage < loadingStages.length - 1) {
          currentStage++
          setLoadingMessage(loadingStages[currentStage])
        }
      }, 3000)

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId: contractId.trim() }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Failed to audit contract')
      }

      const result = await response.json()
      setAuditResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during audit')
    } finally {
      setIsLoading(false)
      setLoadingMessage('Starting audit...')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-blue-500'
      case 'INFO': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'text-red-500 border-red-500'
      case 'HIGH': return 'text-orange-500 border-orange-500'
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500'
      case 'LOW': return 'text-green-500 border-green-500'
      default: return 'text-gray-500 border-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Smart Contract Audit Service</h1>
            <p className="text-muted-foreground">Comprehensive security analysis and vulnerability detection</p>
          </div>
        </div>

        {/* Audit Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Contract Analysis</span>
            </CardTitle>
            <CardDescription>
              Enter a smart contract address to perform a comprehensive security audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-id">Smart Contract Address</Label>
                <Input
                  id="contract-id"
                  placeholder="0x... (Powered by BevorAI - Multi-chain support: Ethereum, BSC, Polygon, Base, Arbitrum, etc.)"
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleAudit} 
                disabled={isLoading || !contractId.trim()}
                className="w-fit"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Contract...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Start Audit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-semibold">Analyzing Smart Contract</h3>
                <p className="text-muted-foreground text-center">
                  {loadingMessage}
                </p>
                <div className="text-xs text-muted-foreground text-center max-w-md">
                  This may take 1-5 minutes depending on contract complexity and verification status.
                </div>
                <Progress value={33} className="w-full max-w-md" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Results */}
        {auditResult && (
          <div className="space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Audit Summary</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {auditResult.bevorAuditId ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        BevorAI Powered
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Fallback Analysis
                      </Badge>
                    )}
                    <Badge variant="outline" className={getRiskLevelColor(auditResult.riskLevel)}>
                      {auditResult.riskLevel} RISK
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Contract: {auditResult.contractName} • Network: {auditResult.network} • Score: {auditResult.totalScore}/100
                  {auditResult.processingTime && (
                    <span> • Processing Time: {auditResult.processingTime}s</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="text-2xl font-bold text-red-500">{auditResult.summary.criticalIssues}</div>
                    <div className="text-sm text-muted-foreground">Critical Issues</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">{auditResult.summary.highIssues}</div>
                    <div className="text-sm text-muted-foreground">High Issues</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-500">{auditResult.summary.mediumIssues}</div>
                    <div className="text-sm text-muted-foreground">Medium Issues</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-500">{auditResult.summary.lowIssues}</div>
                    <div className="text-sm text-muted-foreground">Low Issues</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="vulnerabilities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="security">Security Checks</TabsTrigger>
                <TabsTrigger value="gas">Gas Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="vulnerabilities" className="space-y-4">
                {auditResult.vulnerabilities.map((vuln) => (
                  <Card key={vuln.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span>{vuln.title}</span>
                        </CardTitle>
                        <Badge className={cn('text-white', getSeverityColor(vuln.severity))}>
                          {vuln.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{vuln.description}</p>
                      {vuln.codeSnippet && (
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Code className="w-4 h-4" />
                            <span className="text-sm font-medium">Code Snippet</span>
                          </div>
                          <pre className="text-sm text-muted-foreground overflow-x-auto">
                            {vuln.codeSnippet}
                          </pre>
                        </div>
                      )}
                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-500">Recommendation</span>
                        </div>
                        <p className="text-sm">{vuln.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                {auditResult.securityChecks.map((check, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span>{check.category}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Progress 
                          value={(check.passed / check.total) * 100} 
                          className="flex-1" 
                        />
                        <span className="text-sm font-medium">
                          {check.passed}/{check.total} passed
                        </span>
                      </div>
                      {check.issues.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Issues Found:</h4>
                          <ul className="space-y-1">
                            {check.issues.map((issue, issueIndex) => (
                              <li key={issueIndex} className="flex items-start space-x-2 text-sm">
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="gas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Gas Efficiency Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Average Gas Usage</div>
                        <div className="text-2xl font-bold">{auditResult.gasAnalysis.averageGasUsage.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Efficient Functions</div>
                        <div className="text-2xl font-bold">
                          {auditResult.gasAnalysis.efficientFunctions}/{auditResult.gasAnalysis.totalFunctions}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="text-sm font-medium text-blue-500 mb-2">Optimization Recommendation</h4>
                      <p className="text-sm">{auditResult.gasAnalysis.gasOptimization}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Final Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Final Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  'p-4 rounded-lg border-2',
                  auditResult.riskLevel === 'LOW' ? 'bg-green-500/10 border-green-500' :
                  auditResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500' :
                  auditResult.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500' :
                  'bg-red-500/10 border-red-500'
                )}>
                  <div className="flex items-center space-x-2 mb-2">
                    {auditResult.riskLevel === 'LOW' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                    <span className="font-medium">
                      {auditResult.riskLevel === 'LOW' ? 'Safe to Use' :
                       auditResult.riskLevel === 'MEDIUM' ? 'Use with Caution' :
                       auditResult.riskLevel === 'HIGH' ? 'High Risk - Review Required' :
                       'Critical Risk - Do Not Use'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {auditResult.riskLevel === 'LOW' 
                      ? 'This contract has passed our security checks and appears safe for users. However, always conduct your own research.'
                      : auditResult.riskLevel === 'MEDIUM'
                      ? 'This contract has some security concerns that should be addressed. Review the vulnerabilities before using.'
                      : auditResult.riskLevel === 'HIGH'
                      ? 'This contract has significant security issues that pose risks to users. Recommend thorough review and fixes.'
                      : 'This contract has critical vulnerabilities that make it unsafe for users. Do not interact with this contract.'
                    }
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-muted-foreground">
                    Last updated: {auditResult.lastUpdated}
                  </div>
                  {!auditResult.bevorAuditId && (
                    <div className="text-xs text-muted-foreground">
                      💡 Configure BevorAI API key for real-time analysis
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
