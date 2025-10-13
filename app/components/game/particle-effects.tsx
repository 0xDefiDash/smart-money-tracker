
'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface ParticleEffectsProps {
  trigger: boolean
  type: 'success' | 'failure' | 'levelup' | 'combo'
  position?: { x: number; y: number }
}

export function ParticleEffects({ trigger, type, position }: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!trigger || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles based on type
    const colors = {
      success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      failure: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
      levelup: ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
      combo: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
    }

    const particleCount = type === 'levelup' ? 100 : 50
    const selectedColors = colors[type]
    const centerX = position?.x || canvas.width / 2
    const centerY = position?.y || canvas.height / 2

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 5 + 2
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        life: 1,
        color: selectedColors[Math.floor(Math.random() * selectedColors.length)],
        size: Math.random() * 4 + 2
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.2 // Gravity
        particle.life -= 0.02

        if (particle.life <= 0) return false

        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        return true
      })

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [trigger, type, position])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: trigger ? 1 : 0 }}
    />
  )
}
