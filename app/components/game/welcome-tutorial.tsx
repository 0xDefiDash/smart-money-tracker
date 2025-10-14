
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Gamepad2, 
  Target, 
  Coins, 
  Trophy, 
  Shield, 
  Sword, 
  Star, 
  Zap,
  ArrowRight,
  CheckCircle,
  Crown,
  TrendingUp
} from 'lucide-react'

interface WelcomeTutorialProps {
  onComplete: () => void
}

export function WelcomeTutorial({ onComplete }: WelcomeTutorialProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem('dashWars_tutorial_completed')
    if (!hasSeenTutorial) {
      setIsOpen(true)
    }
  }, [])

  const steps = [
    {
      title: "Welcome to Dash Wars! 🎮",
      icon: Gamepad2,
      description: "The ultimate crypto block collection and battle game!",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            Collect powerful blockchain blocks, build your fortune, and compete with players worldwide for the top spot on the leaderboard!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border-neon-green/30">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-neon-green-bright" />
                <p className="font-bold text-sm">Collect Blocks</p>
                <p className="text-xs text-muted-foreground">Free & Premium</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-bold text-sm">Earn Money</p>
                <p className="text-xs text-muted-foreground">Passive Income</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30">
              <CardContent className="p-4 text-center">
                <Sword className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="font-bold text-sm">Battle Players</p>
                <p className="text-xs text-muted-foreground">Steal & Defend</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="font-bold text-sm">Climb Leaderboard</p>
                <p className="text-xs text-muted-foreground">Win Rewards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Understanding Currencies 💰",
      icon: Coins,
      description: "Dash Wars uses multiple currencies - here's what each does:",
      content: (
        <div className="space-y-4">
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Coins className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <p className="font-bold text-yellow-500">Coins</p>
                  <p className="text-sm text-muted-foreground">
                    Earned by collecting blocks. Used for basic upgrades and defense.
                  </p>
                  <Badge variant="outline" className="mt-2 border-yellow-500/30 text-yellow-400">
                    Easy to earn
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Trophy className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <p className="font-bold text-green-500">Money ($)</p>
                  <p className="text-sm text-muted-foreground">
                    Earned passively from your blocks! Each block generates money every minute. Use it to buy premium blocks and powerful upgrades.
                  </p>
                  <Badge variant="outline" className="mt-2 border-green-500/30 text-green-400">
                    Passive income
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <p className="font-bold text-orange-500">$DEFIDASH Tokens</p>
                  <p className="text-sm text-muted-foreground">
                    Real crypto tokens! Win them by ranking in the top 5 on the leaderboard. Reset every Sunday!
                  </p>
                  <Badge variant="outline" className="mt-2 border-orange-500/30 text-orange-400">
                    Real rewards!
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "How to Collect Blocks 🎯",
      icon: Target,
      description: "There are two types of blocks you can collect:",
      content: (
        <div className="space-y-4">
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">🆓</div>
                <div>
                  <p className="font-bold text-blue-400">Common Blocks (FREE)</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    These spawn regularly in the Arena and can be claimed for free! Just click "Claim" when you see them.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Spawn every 2 minutes</li>
                    <li>• Can be stolen by other players</li>
                    <li>• Earn $50/minute passively</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">💳</div>
                <div>
                  <p className="font-bold text-purple-400">Premium Blocks (RARE+)</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Higher rarity blocks that must be purchased with money. Much more powerful!
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <span className="text-blue-400">Rare:</span> $5,000 (earns $150/min)</li>
                    <li>• <span className="text-purple-400">Epic:</span> $25,000 (earns $400/min)</li>
                    <li>• <span className="text-yellow-400">Legendary:</span> $100,000 (earns $1,000/min)</li>
                    <li>• <span className="text-pink-400">Secret:</span> $500,000 (earns $5,000/min!)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-sm font-bold text-green-400">Pro Tip:</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Start by collecting FREE common blocks to build passive income, then upgrade to premium blocks!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Combat System ⚔️",
      icon: Sword,
      description: "Attack other players to steal their wealth!",
      content: (
        <div className="space-y-4">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Sword className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <p className="font-bold text-red-500">Attack Power</p>
                  <p className="text-sm text-muted-foreground">
                    Your offensive strength. Must be higher than enemy defense to attempt attacks. Upgrade through leveling up and power-ups.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <p className="font-bold text-blue-500">Defense Strength</p>
                  <p className="text-sm text-muted-foreground">
                    Protects your blocks from theft. Higher defense makes it harder for others to steal from you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="font-bold text-sm">Attack Types:</p>
            <div className="grid gap-2">
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2">
                <p className="font-bold text-sm">🎭 Stealth Strike</p>
                <p className="text-xs text-muted-foreground">Lower cost, slightly lower success rate</p>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2">
                <p className="font-bold text-sm">⚡ Direct Assault</p>
                <p className="text-xs text-muted-foreground">Standard cost and success rate</p>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2">
                <p className="font-bold text-sm">🎯 Calculated Strike</p>
                <p className="text-xs text-muted-foreground">Higher cost, but higher success rate</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Progression & Rewards 🏆",
      icon: Trophy,
      description: "Multiple ways to progress and earn rewards!",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardContent className="p-3">
                <Star className="w-6 h-6 text-blue-400 mb-1" />
                <p className="font-bold text-sm">Daily Quests</p>
                <p className="text-xs text-muted-foreground">Complete tasks for rewards</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardContent className="p-3">
                <Zap className="w-6 h-6 text-purple-400 mb-1" />
                <p className="font-bold text-sm">Power-Ups</p>
                <p className="text-xs text-muted-foreground">Temporary stat boosts</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-3">
                <Trophy className="w-6 h-6 text-yellow-400 mb-1" />
                <p className="font-bold text-sm">Achievements</p>
                <p className="text-xs text-muted-foreground">Unlock special rewards</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="p-3">
                <CheckCircle className="w-6 h-6 text-green-400 mb-1" />
                <p className="font-bold text-sm">Daily Login</p>
                <p className="text-xs text-muted-foreground">Streak bonuses</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Crown className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <p className="font-bold text-yellow-500">Weekly Leaderboard Rewards</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Rank in the top 5 to win real $DEFIDASH tokens!
                  </p>
                  <div className="flex space-x-2 text-xs">
                    <Badge className="bg-yellow-500/20 text-yellow-400">🥇 1,000</Badge>
                    <Badge className="bg-gray-400/20 text-gray-300">🥈 750</Badge>
                    <Badge className="bg-orange-500/20 text-orange-400">🥉 500</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Quick Start Guide 🚀",
      icon: Zap,
      description: "Your first steps to domination!",
      content: (
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border border-neon-green/30 rounded-lg p-3">
              <div className="bg-neon-green/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-neon-green-bright">1</span>
              </div>
              <div>
                <p className="font-bold text-sm text-neon-green-bright">Collect Your First Blocks</p>
                <p className="text-xs text-muted-foreground">Go to the Arena tab and claim FREE common blocks that spawn</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-400">2</span>
              </div>
              <div>
                <p className="font-bold text-sm text-green-400">Build Passive Income</p>
                <p className="text-xs text-muted-foreground">Each block earns money automatically - watch your wealth grow!</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="bg-purple-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-400">3</span>
              </div>
              <div>
                <p className="font-bold text-sm text-purple-400">Upgrade to Premium</p>
                <p className="text-xs text-muted-foreground">Use your money to buy Rare, Epic, or Legendary blocks for more income</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-red-400">4</span>
              </div>
              <div>
                <p className="font-bold text-sm text-red-400">Battle Other Players</p>
                <p className="text-xs text-muted-foreground">Visit the Battles tab to steal money from opponents and climb the leaderboard</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="bg-yellow-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-yellow-400">5</span>
              </div>
              <div>
                <p className="font-bold text-sm text-yellow-400">Complete Daily Quests</p>
                <p className="text-xs text-muted-foreground">Earn bonus rewards and climb the rankings faster!</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30 rounded-lg p-4 text-center">
            <p className="font-bold text-lg mb-1 text-neon-green-bright">You're Ready! 🎮</p>
            <p className="text-sm text-muted-foreground">
              Jump into the game and start your journey to the top of the leaderboard!
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('dashWars_tutorial_completed', 'true')
    setIsOpen(false)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('dashWars_tutorial_completed', 'true')
    setIsOpen(false)
    onComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 border-neon-green/30">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-neon-gradient rounded-full p-3">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-neon-green-bright to-neon-blue-bright bg-clip-text text-transparent">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-neon-green-bright'
                  : index < currentStep
                  ? 'w-2 bg-neon-green/50'
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-gray-600 hover:bg-gray-800"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-neon-blue/30 hover:bg-neon-blue/10"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-neon-gradient hover:opacity-90"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Start Playing! <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
