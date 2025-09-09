

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Settings, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface Alert {
  id: string
  title: string
  description: string
  type: 'price' | 'whale' | 'volume'
  status: 'active' | 'triggered' | 'inactive'
  createdAt: string
  condition: string
}

export default function AlertsPage() {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'SOL Institutional Movement Alert',
      description: 'Jump Trading moved 389,567 SOL - $24.89M to DeFi protocols',
      type: 'whale',
      status: 'triggered',
      createdAt: '2025-09-09',
      condition: 'SOL transfer > $20M'
    },
    {
      id: '2',
      title: 'BTC Grayscale Holdings Alert',
      description: 'Grayscale moved 9,876 BTC to Trust Portfolio - $26.89M',
      type: 'whale',
      status: 'triggered',
      createdAt: '2025-09-09',
      condition: 'BTC transfer > $25M'
    },
    {
      id: '3',
      title: 'ETH Institutional Volume Spike',
      description: 'BlackRock Digital Assets volume surge - 534% above average',
      type: 'volume',
      status: 'triggered',
      createdAt: '2025-09-09',
      condition: 'ETH volume > 500% average'
    },
    {
      id: '4',
      title: 'WBTC Liquidity Pool Alert',
      description: 'Large WBTC-USDC pool addition - $19.34M liquidity added',
      type: 'whale',
      status: 'active',
      createdAt: '2025-09-09',
      condition: 'WBTC pool > $15M'
    },
    {
      id: '5',
      title: 'AVAX Fidelity Digital Alert',
      description: 'Fidelity Digital moved 198,734 AVAX - $14.23M',
      type: 'whale',
      status: 'active',
      createdAt: '2025-09-09',
      condition: 'AVAX transfer > $10M'
    },
    {
      id: '6',
      title: 'USDC Corporate Mint Alert',
      description: 'Circle minted $12.79M USDC for enterprise settlements',
      type: 'whale',
      status: 'triggered',
      createdAt: '2025-09-09',
      condition: 'USDC mint > $10M'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'triggered': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />
      case 'whale': return <Activity className="w-4 h-4" />
      case 'volume': return <TrendingDown className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">Manage your cryptocurrency price and activity alerts</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">6</div>
            <p className="text-xs text-green-600 mt-1">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Triggered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4</div>
            <p className="text-xs text-muted-foreground mt-1">67% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">6</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Your cryptocurrency monitoring alerts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Condition: {alert.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(alert.status)} variant="secondary">
                      {alert.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {alert.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

