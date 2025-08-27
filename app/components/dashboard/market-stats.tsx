
import { Card } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, Activity, TrendingUp, DollarSign, Users } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Mock data - in real app this would come from API
const mockStats = {
  totalMarketCap: 2450000000000,
  totalVolume: 89500000000,
  whaleTransactions: 342,
  averageTransactionSize: 2150000,
  marketCapChange: 2.34,
  volumeChange: -5.67,
  whaleActivityChange: 15.2,
  avgTransactionChange: 8.1,
}

export async function MarketStats() {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const stats = [
    {
      title: 'Total Market Cap',
      value: formatCurrency(mockStats.totalMarketCap),
      change: mockStats.marketCapChange,
      icon: DollarSign,
    },
    {
      title: '24h Volume',
      value: formatCurrency(mockStats.totalVolume),
      change: mockStats.volumeChange,
      icon: TrendingUp,
    },
    {
      title: 'Whale Transactions',
      value: mockStats.whaleTransactions.toString(),
      change: mockStats.whaleActivityChange,
      icon: Activity,
    },
    {
      title: 'Avg Transaction Size',
      value: formatCurrency(mockStats.averageTransactionSize),
      change: mockStats.avgTransactionChange,
      icon: Users,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        
        return (
          <Card key={index} className="p-4 bg-gradient-to-br from-background to-muted/20 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-xs ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? (
                  <ArrowUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
