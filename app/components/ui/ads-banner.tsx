
'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Ad {
  id: string
  title: string
  description: string
  link: string
  badge?: string
  bgGradient: string
  icon?: string
}

export function AdsBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Placeholder ads - replace with real ads when you have advertisers
  const ads: Ad[] = [
    {
      id: '1',
      title: '🚀 Featured Trading Bot',
      description: 'Automated crypto trading with AI-powered strategies. Join 10,000+ traders.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-blue-600/20 to-purple-600/20',
      icon: '🤖'
    },
    {
      id: '2',
      title: '💎 Premium Crypto Signals',
      description: 'Get exclusive whale alerts and market insights. 95% accuracy rate.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-emerald-600/20 to-teal-600/20',
      icon: '📊'
    },
    {
      id: '3',
      title: '🔥 NFT Marketplace Launch',
      description: 'Trade rare NFTs with zero gas fees. Early access available now.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-orange-600/20 to-red-600/20',
      icon: '🎨'
    },
    {
      id: '4',
      title: '⚡ DeFi Lending Platform',
      description: 'Earn up to 20% APY on your crypto. Secure & audited smart contracts.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-violet-600/20 to-pink-600/20',
      icon: '💰'
    },
    {
      id: '5',
      title: '🎯 Crypto Portfolio Tracker',
      description: 'Track 10,000+ coins across 50+ exchanges. Real-time portfolio analytics.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-cyan-600/20 to-blue-600/20',
      icon: '📈'
    },
    {
      id: '6',
      title: '🛡️ Hardware Wallet Sale',
      description: 'Secure your crypto with military-grade security. 30% off limited time.',
      link: '#',
      badge: 'SPONSORED',
      bgGradient: 'from-slate-600/20 to-gray-600/20',
      icon: '🔐'
    }
  ]

  // Handle mounting and localStorage
  useEffect(() => {
    setIsMounted(true)
    const hidden = localStorage.getItem('ads-banner-hidden')
    if (hidden === 'true') {
      setIsVisible(false)
    }
  }, [])

  // Rotate ads every 5 seconds
  useEffect(() => {
    if (!isVisible || !isMounted) return

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible, isMounted, ads.length])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('ads-banner-hidden', 'true')
  }

  const handleAdClick = (ad: Ad) => {
    // Track ad click - integrate with your analytics
    console.log('Ad clicked:', ad.id, ad.title)
    // window.open(ad.link, '_blank')
  }

  // Don't render until mounted to prevent hydration errors
  if (!isMounted) return null
  
  if (!isVisible) return null

  const currentAd = ads[currentAdIndex]

  return (
    <div className="relative w-full bg-gradient-to-r from-background via-muted/10 to-background border-b border-border/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Ad Content */}
      <div className="relative flex items-center justify-between px-4 lg:px-6 py-2.5 gap-4">
        {/* Left Side - Ad Content */}
        <button
          onClick={() => handleAdClick(currentAd)}
          className={cn(
            "flex-1 flex items-center gap-3 lg:gap-4 text-left transition-all duration-300 hover:scale-[1.01] group",
            "rounded-lg px-3 py-1.5 bg-gradient-to-r",
            currentAd.bgGradient
          )}
        >
          {/* Icon */}
          {currentAd.icon && (
            <div className="text-2xl lg:text-3xl animate-bounce-slow">
              {currentAd.icon}
            </div>
          )}

          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {currentAd.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">
                  {currentAd.badge}
                </span>
              )}
              <h3 className="text-sm lg:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {currentAd.title}
              </h3>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
              {currentAd.description}
            </p>
          </div>

          {/* CTA Icon */}
          <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
        </button>

        {/* Right Side - Ad Indicators & Close */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {/* Ad Position Indicators */}
          <div className="hidden sm:flex items-center gap-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  currentAdIndex === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Close ads banner"
          >
            <X className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/20">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress"
          style={{
            animation: 'progress 5s linear infinite'
          }}
        />
      </div>
    </div>
  )
}
