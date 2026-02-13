'use client';

import { useState, useEffect } from 'react';
import { AgentCard } from '@/components/agentic/agent-card';
import { CEOPanel } from '@/components/agentic/ceo-panel';
import { MarketOverview } from '@/components/agentic/market-overview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Sparkles, 
  Activity,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Zap,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TradingSession, CEODecision, MarketData } from '@/lib/ai-agents/agent-types';

export default function DashAgenticPage() {
  const [session, setSession] = useState<TradingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ceoDecisions, setCeoDecisions] = useState<CEODecision[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  useEffect(() => {
    // Load existing session or create new one
    loadOrCreateSession();
  }, []);

  useEffect(() => {
    if (!session || !autoRefresh) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [session, autoRefresh]);

  const loadOrCreateSession = async () => {
    setLoading(true);
    try {
      // Check for existing sessions
      const response = await fetch('/api/agentic/session');
      const data = await response.json();

      if (data.sessions && data.sessions.length > 0) {
        // Use most recent session
        const latestSession = data.sessions[data.sessions.length - 1];
        setSession(latestSession);
        await loadCEODecisions(latestSession.id);
        toast.success('Session loaded');
      } else {
        // Create new session
        await createNewSession();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agentic/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCapital: 100000 })
      });

      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        toast.success('New trading session started!');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/agentic/session?sessionId=${session.id}`);
      const data = await response.json();
      setSession(data);
      await loadCEODecisions(session.id);
      await loadMarketData();
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const loadCEODecisions = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/agentic/ceo-decisions?sessionId=${sessionId}&limit=10`);
      const data = await response.json();
      setCeoDecisions(data.decisions || []);
    } catch (error) {
      console.error('Failed to load CEO decisions:', error);
    }
  };

  const loadMarketData = async () => {
    try {
      const response = await fetch('/api/agentic/market');
      const data = await response.json();
      setMarketData(data.marketData || []);
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const handleSessionAction = async (action: 'pause' | 'resume' | 'stop') => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch('/api/agentic/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, action })
      });

      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        toast.success(`Session ${action}d`);
      }
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
      toast.error(`Failed to ${action} session`);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentStatusChange = async (agentId: string, status: 'ACTIVE' | 'PAUSED') => {
    if (!session) return;

    try {
      const response = await fetch('/api/agentic/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, agentId, status })
      });

      const data = await response.json();
      if (data.success) {
        await refreshSession();
        toast.success(`Agent ${status.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-primary text-xl font-mono">Initializing AI Agent System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-primary text-3xl font-bold uppercase tracking-wider flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              Dash Agentic
            </h1>
            <p className="text-terminal-gray mt-2">
              AI-Powered Autonomous Trading with AsterDex Perpetuals
            </p>
          </div>
          {session && (
            <Badge 
              className={`text-lg px-4 py-2 ${
                session.status === 'RUNNING' 
                  ? 'bg-primary/20 text-primary border-primary' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {session.status}
            </Badge>
          )}
        </div>

        {/* Live Trading Status Banner */}
        <Card className="border-2 border-yellow-500/50 bg-yellow-500/5 p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary">
                  LIVE
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">
                  API CONNECTED
                </Badge>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-primary font-bold text-lg mb-1">
                🚀 Real Trading Integration Active
              </h3>
              <p className="text-terminal-gray text-sm mb-3">
                Your AI Agentic system is connected to <strong className="text-primary">AsterDex perpetuals exchange</strong> with live API credentials. 
                The system can execute real trades with actual funds.
              </p>
              <div className="flex items-start gap-2 bg-surface-300 border border-yellow-500/30 rounded p-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-500 text-sm font-bold mb-1">
                    ⚠️ Account Funding Required
                  </p>
                  <p className="text-terminal-gray text-sm">
                    Your AsterDex account currently has <strong className="text-yellow-500">$0 balance</strong>. 
                    You must deposit funds before the AI agents can execute live trades. 
                    Visit <a 
                      href="https://asterdex.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      AsterDex <ExternalLink className="h-3 w-3" />
                    </a> to fund your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {session && (
          <Card className="border-2 border-white/10 bg-background/95 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity className={`h-5 w-5 ${autoRefresh ? 'text-primary animate-pulse' : 'text-gray-500'}`} />
                  <span className="text-terminal-gray text-sm">Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
                </div>
                <div className="text-terminal-gray text-sm">
                  Session: <span className="text-primary font-mono">{session.id}</span>
                </div>
                <div className="text-terminal-gray text-sm">
                  Started: <span className="text-primary">{new Date(session.startTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-primary"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                  {autoRefresh ? 'Auto' : 'Manual'}
                </Button>

                {session.status === 'RUNNING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-500"
                    onClick={() => handleSessionAction('pause')}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}

                {session.status === 'PAUSED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-primary"
                    onClick={() => handleSessionAction('resume')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-500"
                  onClick={() => handleSessionAction('stop')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>

                <Button
                  size="sm"
                  className="bg-primary/20 text-primary border-primary"
                  onClick={createNewSession}
                >
                  <Play className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {!session ? (
        <Card className="border-2 border-white/10 bg-background/95 p-12 text-center">
          <AlertCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-primary text-2xl font-bold mb-4">No Active Session</h2>
          <p className="text-terminal-gray mb-6">Start a new trading session to activate AI agents</p>
          <Button
            size="lg"
            className="bg-primary/20 text-primary border-2 border-primary"
            onClick={createNewSession}
          >
            <Play className="h-5 w-5 mr-2" />
            Start New Session
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-surface-300 border-2 border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Activity className="h-4 w-4 mr-2" />
              Agents ({session.agents.length})
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CEOPanel
              decisions={ceoDecisions}
              totalCapital={session.totalCapital}
              usedCapital={session.usedCapital}
              totalPnL={session.totalPnL}
            />

            <div>
              <h2 className="text-primary font-bold text-xl uppercase tracking-wider mb-4">
                Active Agents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {session.agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onStatusChange={handleAgentStatusChange}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onStatusChange={handleAgentStatusChange}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <MarketOverview marketData={marketData.length > 0 ? marketData : session.marketData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
