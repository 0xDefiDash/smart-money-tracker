
'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileImage } from '@/components/ui/profile-image'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ProfileImageUploadProps {
  user: {
    id?: string
    name?: string | null
    username?: string | null
    profileImage?: string | null
  }
  onImageUpdate?: (imageUrl: string | null) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ProfileImageUpload({ 
  user, 
  onImageUpdate, 
  size = 'lg',
  className 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError(null)
    setSuccess(null)

    // Upload the file
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setSuccess('Profile image updated successfully!')
      onImageUpdate?.(data.user.profileImage)
      
      // Clear preview after successful upload
      setTimeout(() => {
        setPreviewUrl(null)
        setSuccess(null)
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to upload image')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('profileImage', '') // Send empty to remove

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove image')
      }

      setSuccess('Profile image removed successfully!')
      onImageUpdate?.(null)
      setPreviewUrl(null)
      
      setTimeout(() => {
        setSuccess(null)
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to remove image')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative inline-block">
        {/* Profile Image Display */}
        {previewUrl ? (
          <div className={cn(
            'relative rounded-full overflow-hidden border-2 border-dashed border-purple-500',
            size === 'sm' ? 'h-12 w-12' :
            size === 'md' ? 'h-16 w-16' :
            size === 'lg' ? 'h-20 w-20' : 'h-24 w-24'
          )}>
            <img 
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <ProfileImage user={user} size={size} />
        )}

        {/* Upload/Camera Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0 shadow-lg border border-background"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Camera className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          Change Photo
        </Button>

        {(user.profileImage || previewUrl) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700 text-sm">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Instructions */}
      <p className="text-xs text-muted-foreground">
        Upload JPG, PNG, GIF, or WebP images up to 5MB
      </p>
    </div>
  )
}
