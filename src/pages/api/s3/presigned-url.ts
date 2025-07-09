import { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

// AWS Configuration - using environment variables
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "us-east-2";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "wer24-files";

// Configure AWS
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Generate unique file name to avoid conflicts
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    // Create presigned URL for PUT operation
    const presignedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      Expires: 3600, // URL expires in 1 hour
    });

    res.status(200).json({
      presignedUrl,
      fileName: uniqueFileName,
      bucket: BUCKET_NAME,
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
} 