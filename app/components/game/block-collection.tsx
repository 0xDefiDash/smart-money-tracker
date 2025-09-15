
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BlockCharacter } from './block-character'
import { Crown, TrendingUp, Star, Package } from 'lucide-react'

interface Block {
  id: string
  name: string
  type: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret'
  value: number
  power: number
  defense: number
  image: string
  color: string
  description: string
  owner?: string
  isStealable: boolean
  spawnTime: number
  traits: string[]
}

interface BlockCollectionProps {
  ownedBlocks: Block[]
  coins: number
  onSellBlock?: (blockId: string) => void
  isLoading?: boolean
}

export function BlockCollection({ ownedBlocks, coins, onSellBlock, isLoading = false }: BlockCollectionProps) {
  const totalValue = ownedBlocks.reduce((sum, block) => sum + block.value, 0)
  const rarityStats = {
    common: ownedBlocks.filter(b => b.rarity === 'common').length,
    rare: ownedBlocks.filter(b => b.rarity === 'rare').length,
    epic: ownedBlocks.filter(b => b.rarity === 'epic').length,
    legendary: ownedBlocks.filter(b => b.rarity === 'legendary').length,
    secret: ownedBlocks.filter(b => b.rarity === 'secret').length
  }

  const sortedBlocks = [...ownedBlocks].sort((a, b) => {
    const rarityOrder = { secret: 5, legendary: 4, epic: 3, rare: 2, common: 1 }
    return rarityOrder[b.rarity] - rarityOrder[a.rarity]
  })

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">
              {ownedBlocks.length}
              <span className="text-sm text-muted-foreground">/12</span>
            </p>
            <p className="text-sm text-muted-foreground">Blocks Owned</p>
            {ownedBlocks.length >= 12 && (
              <p className="text-xs text-red-400 mt-1">Collection Full!</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{totalValue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{rarityStats.legendary}</p>
            <p className="text-sm text-muted-foreground">Legendary</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-yellow-500 text-2xl animate-pulse">🚀</div>
            <p className="text-2xl font-bold text-yellow-500">{rarityStats.secret}</p>
            <p className="text-sm text-muted-foreground">Secret</p>
          </CardContent>
        </Card>
      </div>

      {/* Rarity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <Badge className="mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">🚀 Secret</Badge>
              <p className="text-2xl font-bold text-yellow-500">{rarityStats.secret}</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 bg-yellow-500">Legendary</Badge>
              <p className="text-2xl font-bold">{rarityStats.legendary}</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 bg-purple-500">Epic</Badge>
              <p className="text-2xl font-bold">{rarityStats.epic}</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 bg-blue-500">Rare</Badge>
              <p className="text-2xl font-bold">{rarityStats.rare}</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 bg-gray-500">Common</Badge>
              <p className="text-2xl font-bold">{rarityStats.common}</p>
            </div>
          </div>
          
          {/* Block Limit Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Block Limit System</h4>
              <Badge variant="outline" className="text-blue-500">
                {12 - ownedBlocks.length} slots left
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              You can only own 12 blocks at once. Sell blocks below to free up space for new ones! 
              Higher rarity blocks sell for more money.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Block Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Your Blocks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedBlocks.map((block) => (
                <BlockCharacter
                  key={block.id}
                  block={block}
                  showActions={true}
                  isOwned={true}
                  onSell={onSellBlock}
                  isLoading={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Blocks Collected</h3>
              <p className="text-muted-foreground mb-4">
                Start claiming blocks from the Arena to build your collection!
              </p>
              <Button variant="outline">
                Go to Arena
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
