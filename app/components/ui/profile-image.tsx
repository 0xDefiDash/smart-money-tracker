
'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileImageProps {
  user: {
    id?: string
    name?: string | null
    username?: string | null
    profileImage?: string | null
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showFallback?: boolean
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
}

export function ProfileImage({ 
  user, 
  size = 'md', 
  className, 
  showFallback = true 
}: ProfileImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (user.profileImage && user.id) {
      setLoading(true)
      setError(false)
      
      // For S3 images, we need to get a signed URL
      const fetchImageUrl = async () => {
        try {
          const response = await fetch(`/api/user/profile-image?key=${encodeURIComponent(user.profileImage!)}`)
          if (response.ok) {
            setImageUrl(response.url)
          } else {
            setError(true)
          }
        } catch (error) {
          console.error('Error fetching profile image:', error)
          setError(true)
        } finally {
          setLoading(false)
        }
      }

      fetchImageUrl()
    }
  }, [user.profileImage, user.id])

  const initials = getInitials(user.name || user.username || 'U')

  if (loading) {
    return (
      <div className={cn(
        sizeMap[size],
        'rounded-full bg-muted animate-pulse',
        className
      )} />
    )
  }

  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {!error && imageUrl && (
        <AvatarImage 
          src={imageUrl} 
          alt={`${user.name || user.username}'s profile`}
          className="object-cover"
          onError={() => setError(true)}
        />
      )}
      <AvatarFallback className={cn(
        'bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-semibold',
        textSizeMap[size]
      )}>
        {showFallback ? (
          initials || <User className={cn(
            size === 'sm' ? 'h-3 w-3' : 
            size === 'md' ? 'h-4 w-4' :
            size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        ) : (
          <User className={cn(
            size === 'sm' ? 'h-3 w-3' : 
            size === 'md' ? 'h-4 w-4' :
            size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        )}
      </AvatarFallback>
    </Avatar>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
