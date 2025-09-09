
import { Card } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, Activity, TrendingUp, DollarSign, Users } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Mock data - Updated for September 9, 2025
const mockStats = {
  totalMarketCap: 4190000000000, // $4.19T (increased)
  totalVolume: 234500000000, // $234.5B (increased)
  whaleTransactions: 1456, // increased
  averageTransactionSize: 8940000, // $8.94M (increased)
  marketCapChange: 27.8, // higher growth
  volumeChange: 38.7, // higher volume
  whaleActivityChange: 134.8, // significant increase
  avgTransactionChange: 89.3, // larger transactions
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

