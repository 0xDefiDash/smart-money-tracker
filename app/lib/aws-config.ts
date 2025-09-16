
// AWS S3 Configuration for file uploads

export interface BucketConfig {
  bucketName: string
  folderPrefix: string
}

export function getBucketConfig(): BucketConfig {
  const bucketName = process.env.AWS_BUCKET_NAME
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || ""

  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  return {
    bucketName,
    folderPrefix
  }
}

import { S3Client } from "@aws-sdk/client-s3"

export function createS3Client(): S3Client {
  return new S3Client({})
}
