'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AsterDexTrading } from '@/components/agentic/asterdex-trading';
import { 
  Brain, 
  Network, 
  Zap, 
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  Wallet,
  Play,
  Loader2,
  Bot,
  GitBranch,
  Layers,
  Activity,
  ChevronRight,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Send,
  RotateCcw,
  LineChart
} from 'lucide-react';

interface AgentOutput {
  agent_name: string;
  output: string;
}

interface SwarmResult {
  job_id: string;
  status: string;
  output: any;
  number_of_agents: number;
  execution_time: number;
  billing_info?: {
    total_cost: number;
    token_usage: number;
  };
  agent_outputs?: AgentOutput[];
}

interface AnalysisHistory {
  id: string;
  timestamp: string;
  workflow: string;
  task: string;
  result: SwarmResult;
}

const WORKFLOWS = [
  {
    id: 'hierarchical',
    name: 'Hierarchical Swarm',
    icon: GitBranch,
    description: 'Director-led comprehensive analysis with specialized agents',
    agents: ['Trading-Director', 'Market-Analyst', 'Risk-Manager', 'Technical-Analyst', 'OnChain-Analyst'],
    color: 'text-purple-400'
  },
  {
    id: 'concurrent',
    name: 'Concurrent Analysis',
    icon: Layers,
    description: 'Parallel analysis from multiple specialists simultaneously',
    agents: ['Configurable agents run in parallel'],
    color: 'text-blue-400'
  },
  {
    id: 'sequential',
    name: 'Sequential Pipeline',
    icon: ChevronRight,
    description: 'Step-by-step analysis where each agent builds on previous',
    agents: ['Market → Technical → OnChain → Risk → Execution'],
    color: 'text-cyan-400'
  },
  {
    id: 'alpha',
    name: 'Alpha Hunter',
    icon: Target,
    description: 'Identify early opportunities and hidden alpha',
    agents: ['Alpha-Hunter', 'OnChain-Analyst', 'Market-Analyst', 'Risk-Manager'],
    color: 'text-yellow-400'
  },
  {
    id: 'router',
    name: 'Smart Router',
    icon: Network,
    description: 'Automatically routes to the best specialist for your query',
    agents: ['All agents available, best one selected automatically'],
    color: 'text-green-400'
  }
];

const AGENT_TYPES = [
  { id: 'TRADING_DIRECTOR', name: 'Trading Director', icon: Brain, color: 'text-purple-400' },
  { id: 'MARKET_ANALYST', name: 'Market Analyst', icon: TrendingUp, color: 'text-green-400' },
  { id: 'RISK_MANAGER', name: 'Risk Manager', icon: Shield, color: 'text-red-400' },
  { id: 'TECHNICAL_ANALYST', name: 'Technical Analyst', icon: BarChart3, color: 'text-blue-400' },
  { id: 'ONCHAIN_ANALYST', name: 'OnChain Analyst', icon: Wallet, color: 'text-cyan-400' },
  { id: 'EXECUTION_AGENT', name: 'Execution Agent', icon: Zap, color: 'text-yellow-400' },
  { id: 'ALPHA_HUNTER', name: 'Alpha Hunter', icon: Target, color: 'text-orange-400' }
];

const QUICK_PROMPTS = [
  "Analyze BTC's current market position and provide trading recommendations",
  "What are the top alpha opportunities in the current market?",
  "Analyze whale activity on Ethereum in the last 24 hours",
  "Assess the risk of going 3x long on ETH at current prices",
  "Create an execution plan to accumulate $50k worth of SOL over 3 days",
  "What's the market sentiment across major crypto sectors?"
];

export default function AgenticTradingPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState('hierarchical');
  const [task, setTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SwarmResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [includeMarketData, setIncludeMarketData] = useState(true);
  const [selectedAgentType, setSelectedAgentType] = useState('MARKET_ANALYST');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [activeTab, setActiveTab] = useState('swarm');
  const resultRef = useRef<HTMLDivElement>(null);

  const executeAnalysis = async () => {
    if (!task.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/agents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          workflow: activeTab === 'single' ? 'single' : selectedWorkflow,
          agentType: activeTab === 'single' ? selectedAgentType : undefined,
          includeMarketData,
          token: tokenSymbol ? { symbol: tokenSymbol } : undefined
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);
        
        // Add to history
        const historyEntry: AnalysisHistory = {
          id: data.result.job_id || Date.now().toString(),
          timestamp: new Date().toISOString(),
          workflow: activeTab === 'single' ? `Single: ${selectedAgentType}` : selectedWorkflow,
          task: task.substring(0, 100) + (task.length > 100 ? '...' : ''),
          result: data.result
        };
        setHistory(prev => [historyEntry, ...prev].slice(0, 10));

        // Scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuickAction = async (action: string, data?: any) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/agents/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });

      const result = await response.json();
      if (result.success) {
        setResult(result.result);
      }
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOutput = (output: any): string => {
    if (typeof output === 'string') return output;
    return JSON.stringify(output, null, 2);
  };

  const selectedWorkflowData = WORKFLOWS.find(w => w.id === selectedWorkflow);

  return (
    <div className="min-h-screen bg-black text-terminal-green p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-terminal-green/10 rounded-lg border border-terminal-green/30">
              <Brain className="w-8 h-8 text-terminal-green" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold text-terminal-green">
                Agentic Trading Intelligence
              </h1>
              <p className="text-terminal-green/60 font-mono text-sm">
                Swarms AI Hierarchical Framework • Multi-Agent Orchestration
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-terminal-green/50 text-terminal-green font-mono">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </Badge>
        </div>

        {/* Quick Actions */}
        <Card className="bg-black/50 border-terminal-green/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-terminal-green font-mono flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('market_sentiment')}
                disabled={isLoading}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Market Sentiment
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('find_alpha')}
                disabled={isLoading}
              >
                <Target className="w-4 h-4 mr-2" />
                Hunt Alpha
              </Button>
              <Button
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('whale_analysis', { chain: 'ethereum' })}
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Whale Activity
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('assess_risk', { position: 'BTC Long', size: 10000, leverage: 3 })}
                disabled={isLoading}
              >
                <Shield className="w-4 h-4 mr-2" />
                Risk Check
              </Button>
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('analyze_token', { symbol: 'ETH' })}
                disabled={isLoading}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze ETH
              </Button>
              <Button
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-mono text-xs h-auto py-3"
                onClick={() => executeQuickAction('execution_plan', { action: 'buy', token: 'SOL', amount: 25000, urgency: 'medium' })}
                disabled={isLoading}
              >
                <Zap className="w-4 h-4 mr-2" />
                Exec Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/50 border-terminal-green/30">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-black/50 border border-terminal-green/30">
                    <TabsTrigger value="swarm" className="font-mono data-[state=active]:bg-terminal-green/20">
                      <Network className="w-4 h-4 mr-2" />
                      Swarm Analysis
                    </TabsTrigger>
                    <TabsTrigger value="single" className="font-mono data-[state=active]:bg-terminal-green/20">
                      <Bot className="w-4 h-4 mr-2" />
                      Single Agent
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="space-y-4">
                {activeTab === 'swarm' && (
                  <>
                    {/* Workflow Selection */}
                    <div className="space-y-3">
                      <Label className="text-terminal-green font-mono">Select Workflow</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {WORKFLOWS.map((workflow) => (
                          <button
                            key={workflow.id}
                            onClick={() => setSelectedWorkflow(workflow.id)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              selectedWorkflow === workflow.id
                                ? 'border-terminal-green bg-terminal-green/10'
                                : 'border-terminal-green/30 hover:border-terminal-green/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <workflow.icon className={`w-4 h-4 ${workflow.color}`} />
                              <span className="font-mono text-sm text-white">{workflow.name}</span>
                            </div>
                            <p className="text-xs text-terminal-green/60 font-mono">
                              {workflow.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Workflow Details */}
                    {selectedWorkflowData && (
                      <Alert className="bg-terminal-green/5 border-terminal-green/30">
                        <selectedWorkflowData.icon className={`w-4 h-4 ${selectedWorkflowData.color}`} />
                        <AlertTitle className="text-terminal-green font-mono">
                          {selectedWorkflowData.name} Workflow
                        </AlertTitle>
                        <AlertDescription className="text-terminal-green/70 font-mono text-xs mt-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedWorkflowData.agents.map((agent, i) => (
                              <Badge key={i} variant="outline" className="border-terminal-green/30 text-terminal-green/70">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                {activeTab === 'single' && (
                  <div className="space-y-3">
                    <Label className="text-terminal-green font-mono">Select Specialist Agent</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {AGENT_TYPES.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedAgentType(agent.id)}
                          className={`p-3 rounded-lg border transition-all text-center ${
                            selectedAgentType === agent.id
                              ? 'border-terminal-green bg-terminal-green/10'
                              : 'border-terminal-green/30 hover:border-terminal-green/60'
                          }`}
                        >
                          <agent.icon className={`w-5 h-5 mx-auto mb-1 ${agent.color}`} />
                          <span className="font-mono text-xs text-white block">{agent.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeMarketData}
                      onCheckedChange={setIncludeMarketData}
                      className="data-[state=checked]:bg-terminal-green"
                    />
                    <Label className="text-terminal-green/70 font-mono text-sm">Include Market Data</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Token (optional)"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      className="w-32 bg-black/50 border-terminal-green/30 text-terminal-green font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Task Input */}
                <div className="space-y-2">
                  <Label className="text-terminal-green font-mono">Analysis Task</Label>
                  <Textarea
                    placeholder="Enter your analysis request... e.g., 'Analyze the current market conditions for BTC and provide trading recommendations'"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="min-h-[120px] bg-black/50 border-terminal-green/30 text-terminal-green font-mono placeholder:text-terminal-green/30"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="space-y-2">
                  <Label className="text-terminal-green/70 font-mono text-xs">Quick Prompts</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setTask(prompt)}
                        className="text-xs px-2 py-1 rounded border border-terminal-green/20 text-terminal-green/60 hover:border-terminal-green/50 hover:text-terminal-green font-mono transition-all"
                      >
                        {prompt.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Execute Button */}
                <Button
                  onClick={executeAnalysis}
                  disabled={isLoading || !task.trim()}
                  className="w-full bg-terminal-green text-black hover:bg-terminal-green/80 font-mono font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Agents Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute {activeTab === 'swarm' ? 'Swarm' : 'Agent'} Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card ref={resultRef} className="bg-black/50 border-terminal-green/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-terminal-green font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Analysis Complete
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs font-mono text-terminal-green/60">
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {result.number_of_agents} agents
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.execution_time?.toFixed(2) || '0.00'}s
                      </span>
                      {result.billing_info && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${result.billing_info.total_cost?.toFixed(4) || '0.0000'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm text-terminal-green/90 font-mono whitespace-pre-wrap">
                      {formatOutput(result.output)}
                    </pre>
                    
                    {/* Individual Agent Outputs */}
                    {result.agent_outputs && result.agent_outputs.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-terminal-green/20">
                        <h4 className="text-terminal-green font-mono mb-4">Individual Agent Outputs</h4>
                        <div className="space-y-4">
                          {result.agent_outputs.map((agent, i) => (
                            <div key={i} className="p-4 rounded-lg bg-terminal-green/5 border border-terminal-green/20">
                              <Badge className="mb-2 bg-terminal-green/20 text-terminal-green">
                                {agent.agent_name}
                              </Badge>
                              <pre className="text-xs text-terminal-green/70 font-mono whitespace-pre-wrap">
                                {agent.output}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Status */}
            <Card className="bg-black/50 border-terminal-green/30">
              <CardHeader>
                <CardTitle className="text-terminal-green font-mono text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Available Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {AGENT_TYPES.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-2 rounded bg-black/30 border border-terminal-green/10">
                    <div className="flex items-center gap-2">
                      <agent.icon className={`w-4 h-4 ${agent.color}`} />
                      <span className="font-mono text-xs text-white">{agent.name}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* History */}
            <Card className="bg-black/50 border-terminal-green/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-terminal-green font-mono text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Analyses
                  </CardTitle>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistory([])}
                      className="h-6 text-terminal-green/50 hover:text-terminal-green font-mono text-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {history.length === 0 ? (
                    <p className="text-terminal-green/40 font-mono text-xs text-center py-4">
                      No analyses yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setResult(item.result)}
                          className="w-full p-3 rounded bg-black/30 border border-terminal-green/10 hover:border-terminal-green/30 text-left transition-all"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs border-terminal-green/30 text-terminal-green/70">
                              {item.workflow}
                            </Badge>
                            <span className="text-[10px] text-terminal-green/40 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-terminal-green/60 font-mono truncate">
                            {item.task}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-mono text-sm text-white">Powered by Swarms AI</span>
                </div>
                <p className="text-xs text-purple-300/70 font-mono leading-relaxed">
                  Enterprise-grade multi-agent orchestration framework. 
                  Hierarchical swarms coordinate specialized agents for 
                  comprehensive trading intelligence.
                </p>
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-purple-300/50">Framework</div>
                    <div className="text-purple-300">Hierarchical</div>
                    <div className="text-purple-300/50">Agents</div>
                    <div className="text-purple-300">7 Specialists</div>
                    <div className="text-purple-300/50">Workflows</div>
                    <div className="text-purple-300">5 Types</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AsterDex Trading Section */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <LineChart className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-terminal-green">
                AsterDex Perpetuals Trading
              </h2>
              <p className="text-terminal-green/60 font-mono text-sm">
                Live Trading • Positions • Order Management
              </p>
            </div>
          </div>
          <AsterDexTrading />
        </div>
      </div>
    </div>
  );
}
