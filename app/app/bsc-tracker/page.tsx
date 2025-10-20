
import { BSCNetworkStats } from '@/components/bsc-network/bsc-network-stats';
import { BSCWhaleActivity } from '@/components/bsc-network/bsc-whale-activity';
import { BSCWalletTracker } from '@/components/bsc-network/bsc-wallet-tracker';

export const metadata = {
  title: 'BSC Network Tracker | Smart Money Tracker',
  description: 'Track on-chain activity, whale transactions, and wallets on Binance Smart Chain',
};

export default function BSCTrackerPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                BSC Network Tracker
              </h1>
              <p className="text-muted-foreground">
                Real-time on-chain data powered by Ankr RPC
              </p>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <BSCNetworkStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Whale Activity */}
          <div className="lg:col-span-2">
            <BSCWhaleActivity />
          </div>

          {/* Wallet Tracker */}
          <div className="lg:col-span-2">
            <BSCWalletTracker />
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-400">ℹ️</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                About BSC Network Tracking
              </p>
              <p className="text-xs text-muted-foreground">
                This tracker uses Ankr RPC to monitor on-chain activity on Binance Smart Chain in real-time. 
                Track whale movements, monitor wallets, and analyze network statistics with low-latency data access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
