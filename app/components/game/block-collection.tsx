
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
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
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
}

export function BlockCollection({ ownedBlocks, coins }: BlockCollectionProps) {
  const totalValue = ownedBlocks.reduce((sum, block) => sum + block.value, 0)
  const rarityStats = {
    common: ownedBlocks.filter(b => b.rarity === 'common').length,
    rare: ownedBlocks.filter(b => b.rarity === 'rare').length,
    epic: ownedBlocks.filter(b => b.rarity === 'epic').length,
    legendary: ownedBlocks.filter(b => b.rarity === 'legendary').length
  }

  const sortedBlocks = [...ownedBlocks].sort((a, b) => {
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
    return rarityOrder[b.rarity] - rarityOrder[a.rarity]
  })

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{ownedBlocks.length}</p>
            <p className="text-sm text-muted-foreground">Total Blocks</p>
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
            <Star className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{rarityStats.epic}</p>
            <p className="text-sm text-muted-foreground">Epic</p>
          </CardContent>
        </Card>
      </div>

      {/* Rarity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  showActions={false}
                  isOwned={true}
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
