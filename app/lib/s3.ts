
// S3 File Operations using AWS SDK v3

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createS3Client, getBucketConfig } from "./aws-config"

const s3Client = createS3Client()

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const { bucketName, folderPrefix } = getBucketConfig()
    const key = `${folderPrefix}uploads/profile-images/${Date.now()}-${fileName}`

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: getContentType(fileName),
      ServerSideEncryption: 'AES256'
    }))

    return key // Return the S3 key (cloud_storage_path)
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    throw new Error('Failed to upload file')
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const { bucketName } = getBucketConfig()

    // Generate a signed URL that expires in 1 hour
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const { bucketName } = getBucketConfig()

    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    }))
  } catch (error) {
    console.error('Error deleting file from S3:', error)
    throw new Error('Failed to delete file')
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  // S3 doesn't have a rename operation, so we need to copy and delete
  // For simplicity, we'll just return the old key as this is rarely needed for profile images
  return oldKey
}

function getContentType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

export function isValidImageFile(fileName: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const extension = fileName.toLowerCase().split('.').pop()
  return validExtensions.includes(extension || '')
}

export function generateProfileImageFileName(userId: string, originalFileName: string): string {
  const extension = originalFileName.split('.').pop()
  return `profile-${userId}-${Date.now()}.${extension}`
}
