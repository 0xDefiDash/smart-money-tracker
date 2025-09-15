
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Shield, 
  Sword, 
  Star, 
  Crown, 
  Zap,
  Coins,
  Timer,
  TrendingUp,
  ShoppingCart,
  Lock,
  DollarSign
} from 'lucide-react'

// Money production rates per minute based on rarity
const MONEY_PRODUCTION_RATES = {
  common: 50,      // $50 per minute
  rare: 150,       // $150 per minute
  epic: 400,       // $400 per minute
  legendary: 1000, // $1000 per minute
  secret: 5000     // $5000 per minute - The ultimate block!
}

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

interface BlockCharacterProps {
  block: Block
  onClaim?: (blockId: string) => void
  onSteal?: (block: Block) => void
  onDefend?: (blockId: string) => void
  onSell?: (blockId: string) => void
  onPurchase?: (blockId: string) => void // New: Purchase handler
  showActions?: boolean
  isOwned?: boolean
  isLoading?: boolean
  playerMoney?: number // New: Player's current money
}

const getRarityColor = (rarity: Block['rarity']) => {
  switch (rarity) {
    case 'secret': return 'border-gradient-to-r from-yellow-500 to-orange-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-lg shadow-yellow-500/20'
    case 'legendary': return 'border-yellow-500 bg-yellow-500/10'
    case 'epic': return 'border-purple-500 bg-purple-500/10'
    case 'rare': return 'border-blue-500 bg-blue-500/10'
    default: return 'border-gray-500 bg-gray-500/10'
  }
}

const getRarityIcon = (rarity: Block['rarity']) => {
  switch (rarity) {
    case 'secret': return <div className="w-4 h-4 text-yellow-500 animate-pulse">🚀</div>
    case 'legendary': return <Crown className="w-4 h-4 text-yellow-500" />
    case 'epic': return <Star className="w-4 h-4 text-purple-500" />
    case 'rare': return <Zap className="w-4 h-4 text-blue-500" />
    default: return <div className="w-4 h-4" />
  }
}

// Selling price multipliers based on rarity
const SELL_PRICE_MULTIPLIERS = {
  common: 0.6,      // 60% of original value
  rare: 0.65,       // 65% of original value  
  epic: 0.7,        // 70% of original value
  legendary: 0.75,  // 75% of original value
  secret: 0.8       // 80% of original value
}

export function BlockCharacter({ 
  block, 
  onClaim, 
  onSteal, 
  onDefend,
  onSell,
  onPurchase,
  showActions = true,
  isOwned = false,
  isLoading = false,
  playerMoney = 0
}: BlockCharacterProps) {
  const timeAgo = Math.floor((Date.now() - block.spawnTime) / 1000 / 60)
  const moneyPerMinute = MONEY_PRODUCTION_RATES[block.rarity]
  const sellPrice = Math.floor(block.value * SELL_PRICE_MULTIPLIERS[block.rarity])
  
  // Check if player can afford this block
  const canAfford = block.price ? playerMoney >= block.price : true

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:scale-105", getRarityColor(block.rarity))}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getRarityIcon(block.rarity)}
              <Badge variant="secondary" className="text-xs capitalize">
                {block.rarity}
              </Badge>
              {block.isPurchasable && (
                <Badge className="text-xs bg-green-600 text-white flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>Premium</span>
                </Badge>
              )}
            </div>
            {timeAgo < 60 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>{timeAgo}m ago</span>
              </div>
            )}
          </div>

          {/* Character Visual */}
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-3xl font-bold relative overflow-hidden"
              style={{ backgroundColor: `${block.color}20`, color: block.color }}
            >
              {(block.rarity === 'secret' || block.rarity === 'legendary') && block.image.includes('.jpg') ? (
                <img 
                  src={block.image} 
                  alt={block.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                block.image
              )}
              {block.rarity === 'secret' && (
                <div className="absolute -top-1 -right-1 text-xs animate-bounce">✨</div>
              )}
              {block.rarity === 'legendary' && (
                <div className="absolute -top-1 -right-1 text-xs animate-pulse">👑</div>
              )}
            </div>
            <h3 className="font-bold text-sm mt-2">{block.name}</h3>
            <p className="text-xs text-muted-foreground">{block.description}</p>
          </div>

          {/* Money Production Display */}
          <div className="flex items-center justify-center space-x-1 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs font-bold text-green-500">
              +${moneyPerMinute}/min
            </span>
          </div>

          {/* Purchase Price for Premium Blocks */}
          {block.isPurchasable && block.price && (
            <div className={`border rounded p-2 ${canAfford ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>Price:</span>
                </span>
                <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                  ${block.price.toLocaleString()}
                </span>
              </div>
              {!canAfford && (
                <p className="text-xs text-red-300 mt-1">
                  Need ${(block.price - playerMoney).toLocaleString()} more
                </p>
              )}

            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                <span className="font-bold">{block.value}</span>
              </div>
              <p className="text-muted-foreground">Value</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Sword className="w-3 h-3 text-red-500" />
                <span className="font-bold">{block.power}</span>
              </div>
              <p className="text-muted-foreground">Power</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span className="font-bold">{block.defense}</span>
              </div>
              <p className="text-muted-foreground">Defense</p>
            </div>
          </div>

          {/* Traits */}
          <div className="flex flex-wrap gap-1">
            {block.traits.slice(0, 2).map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="space-y-2">
              {/* Free Claim (Common blocks only) */}
              {!isOwned && onClaim && !block.isPurchasable && (
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => onClaim(block.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Claiming...' : '🆓 Claim Free'}
                </Button>
              )}

              {/* Purchase Premium Blocks */}
              {!isOwned && onPurchase && block.isPurchasable && (
                <Button 
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50" 
                  onClick={() => onPurchase(block.id)}
                  disabled={isLoading || !canAfford}
                >
                  {isLoading ? 'Purchasing...' : 
                   !canAfford ? '💰 Not Enough Money' : 
                   `💳 Buy for $${block.price?.toLocaleString()}`}
                </Button>
              )}
              
              {!isOwned && block.owner && onSteal && block.isStealable && !block.isPurchasable && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => onSteal(block)}
                  disabled={isLoading}
                >
                  ⚔️ Steal ({Math.floor(block.value * 0.1)} coins)
                </Button>
              )}
              
              {isOwned && onSell && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => onSell(block.id)}
                  disabled={isLoading}
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Sell (${sellPrice})
                </Button>
              )}
              
              {isOwned && onDefend && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onDefend(block.id)}
                  disabled={isLoading}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Defend
                </Button>
              )}

              {/* Premium Block Protection Notice */}
              {!isOwned && block.isPurchasable && !block.isStealable && (
                <div className="text-xs text-center text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded p-2">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Protected - Cannot be stolen
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
