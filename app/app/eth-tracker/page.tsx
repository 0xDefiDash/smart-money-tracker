
import { EthNetworkStats } from '@/components/eth-network/eth-network-stats';
import { EthWhaleActivity } from '@/components/eth-network/eth-whale-activity';
import { EthWalletTracker } from '@/components/eth-network/eth-wallet-tracker';

export const metadata = {
  title: 'Ethereum Network Tracker | Smart Money Tracker',
  description: 'Track on-chain activity, whale transactions, and wallets on Ethereum mainnet',
};

export default function EthTrackerPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">Ξ</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Ethereum Network Tracker
              </h1>
              <p className="text-muted-foreground">
                Real-time on-chain data powered by Ankr RPC
              </p>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <EthNetworkStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Whale Activity */}
          <div className="lg:col-span-2">
            <EthWhaleActivity />
          </div>

          {/* Wallet Tracker */}
          <div className="lg:col-span-2">
            <EthWalletTracker />
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400">ℹ️</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                About Ethereum Network Tracking
              </p>
              <p className="text-xs text-muted-foreground">
                This tracker uses Ankr RPC to monitor on-chain activity on Ethereum mainnet in real-time. 
                Track whale movements, monitor wallets, and analyze network statistics with low-latency data access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
