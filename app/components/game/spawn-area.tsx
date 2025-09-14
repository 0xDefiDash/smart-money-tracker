
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
}

interface SpawnAreaProps {
  spawnedBlocks: Block[]
  timeUntilSpawn: number
  onClaimBlock: (blockId: string) => void
  isLoading: boolean
}

export function SpawnArea({ spawnedBlocks, timeUntilSpawn, onClaimBlock, isLoading }: SpawnAreaProps) {
  const spawnProgress = ((120 - timeUntilSpawn) / 120) * 100

  return (
    <div className="space-y-6">
      {/* Spawn Timer */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-green-500" />
            <span>Block Spawn Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next spawn in:</span>
            <span className="font-bold text-green-500">
              {Math.floor(timeUntilSpawn / 60)}:{(timeUntilSpawn % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Progress value={spawnProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {timeUntilSpawn === 0 ? '🎁 New blocks are spawning!' : '2-3 blocks spawn every 2 minutes (max 12 total)'}
          </p>
        </CardContent>
      </Card>

      {/* Spawned Blocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-purple-500" />
            <span>Available Blocks ({spawnedBlocks.length})</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spawnedBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spawnedBlocks.map((block) => (
                <BlockCharacter
                  key={block.id}
                  block={block}
                  onClaim={onClaimBlock}
                  showActions={true}
                  isOwned={false}
                  isLoading={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Blocks Available</h3>
              <p className="text-muted-foreground mb-4">
                Waiting for new blocks to spawn...
              </p>
              <div className="text-sm text-muted-foreground">
                Next spawn: {Math.floor(timeUntilSpawn / 60)}:{(timeUntilSpawn % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
