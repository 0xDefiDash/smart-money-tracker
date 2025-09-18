
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BlockCharacter } from './block-character'
import { Timer, Gift, Sparkles } from 'lucide-react'

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
  price?: number // New: Purchase price for premium blocks
  isPurchasable?: boolean // New: Whether this block can be purchased
}

interface SpawnAreaProps {
  spawnedBlocks: Block[]
  timeUntilSpawn: number
  onClaimBlock: (blockId: string) => void
  onPurchaseBlock?: (blockId: string) => void // New: Purchase handler
  isLoading: boolean
  currentBlockCount: number
  playerMoney?: number // New: Player's current money
}

export function SpawnArea({ 
  spawnedBlocks, 
  timeUntilSpawn, 
  onClaimBlock, 
  onPurchaseBlock,
  isLoading, 
  currentBlockCount,
  playerMoney = 0
}: SpawnAreaProps) {
  const spawnProgress = ((120 - timeUntilSpawn) / 120) * 100
  const isAtLimit = currentBlockCount >= 12

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Spawn Timer - Mobile optimized */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span>Block Spawn Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Next spawn in:</span>
            <span className="font-bold text-green-500 text-lg sm:text-xl">
              {Math.floor(timeUntilSpawn / 60)}:{(timeUntilSpawn % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Progress value={spawnProgress} className="h-3 sm:h-2" />
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {timeUntilSpawn === 0 ? '🎁 New blocks are spawning globally!' : '🌍 Common blocks are FREE! Premium blocks require money!'}
          </p>
        </CardContent>
      </Card>

      {/* Global Spawned Blocks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="truncate">🌍 Global Arena ({spawnedBlocks.length})</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            🆓 Common blocks are FREE! 💳 Premium blocks cost money
          </div>
        </CardHeader>
        <CardContent>
          {/* Block Limit Warning */}
          {isAtLimit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-sm text-red-400 mb-1">Collection Full! ({currentBlockCount}/12)</h4>
              <p className="text-xs text-red-300">
                You've reached the maximum of 12 blocks. Sell some blocks in your Collection to make space for new ones!
              </p>
            </div>
          )}
          
          {spawnedBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spawnedBlocks.map((block) => (
                <BlockCharacter
                  key={block.id}
                  block={block}
                  onClaim={isAtLimit ? undefined : onClaimBlock}
                  onPurchase={onPurchaseBlock}
                  showActions={true}
                  isOwned={false}
                  isLoading={isLoading}
                  playerMoney={playerMoney}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">🌍 Global Arena Empty</h3>
              <p className="text-muted-foreground mb-4">
                All blocks have been claimed by players! New ones will spawn soon...
              </p>
              <div className="text-sm text-muted-foreground">
                Next global spawn: {Math.floor(timeUntilSpawn / 60)}:{(timeUntilSpawn % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                🏃‍♂️ Be ready to claim blocks before other players!
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
