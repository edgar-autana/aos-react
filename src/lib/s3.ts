// S3 bucket configuration and upload service
// Environment variables to be set in .env file:
// VITE_AWS_ACCESS_KEY_ID=your_access_key
// VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
// VITE_AWS_REGION=your_region (e.g., us-east-1)
// VITE_AWS_BUCKET_NAME=aos-files-bucket

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Use browser's built-in crypto.randomUUID() for generating UUIDs

// AWS S3 configuration
const AWS_CONFIG = {
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  bucketName: import.meta.env.VITE_AWS_BUCKET_NAME || 'aos-files-bucket',
};

// Validate required environment variables
const validateConfig = () => {
  if (!AWS_CONFIG.accessKeyId) {
    console.error('VITE_AWS_ACCESS_KEY_ID is not configured. Please set it in your .env file.');
    throw new Error('VITE_AWS_ACCESS_KEY_ID is not configured. Please set it in your .env file.');
  }
  if (!AWS_CONFIG.secretAccessKey) {
    console.error('VITE_AWS_SECRET_ACCESS_KEY is not configured. Please set it in your .env file.');
    throw new Error('VITE_AWS_SECRET_ACCESS_KEY is not configured. Please set it in your .env file.');
  }
};

// Upload response interface
export interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  originalFilename?: string;
  error?: string;
}

// File upload interface
export interface FileUploadOptions {
  file: File;
  folder?: string;
  customFilename?: string;
  contentType?: string;
}

// S3 Upload service using fetch (since AWS SDK might be heavy for frontend)
export const s3Service = {
  // Generate presigned URL for upload (requires backend implementation)
  async getPresignedUrl(key: string, contentType: string): Promise<string> {
    // This would typically call your backend to generate a presigned URL
    // For now, we'll implement direct upload using a library like aws-sdk/client-s3
    throw new Error('Presigned URL generation requires backend implementation');
  },

  // Direct upload using AWS SDK
  async uploadFile(options: FileUploadOptions): Promise<UploadResponse> {
    let key = '';
    try {
      validateConfig();
      
      const { file, folder = '', customFilename } = options;
      
      // Generate unique filename by concatenating UUID with original filename
      const originalFilename = file.name;
      const uuid = crypto.randomUUID();
      const filename = customFilename || `${uuid}_${originalFilename}`;
      key = folder ? `${folder}/${filename}` : filename;
      
      // Create S3 client
      const s3Client = new S3Client({
        region: AWS_CONFIG.region,
        credentials: {
          accessKeyId: AWS_CONFIG.accessKeyId,
          secretAccessKey: AWS_CONFIG.secretAccessKey,
        },
      });
      
      // Convert file to buffer/array buffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: AWS_CONFIG.bucketName,
        Key: key,
        Body: body,
        ContentType: file.type,
        ContentDisposition: 'inline',
      });
      
      await s3Client.send(command);
      
      // Generate the file URL
      const url = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
      
      
      return {
        success: true,
        url,
        key,
        originalFilename,
        error: undefined
      };
      
    } catch (error: any) {
      
      let errorMessage = 'Upload failed';
      
      if (error.name === 'NoSuchBucket') {
        errorMessage = `S3 bucket "${AWS_CONFIG.bucketName}" does not exist`;
      } else if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
        errorMessage = 'Access denied. Check AWS credentials and bucket permissions';
      } else if (error.name === 'NetworkingError' || error.message?.includes('CORS')) {
        errorMessage = 'CORS error. Please configure your S3 bucket CORS policy';
      } else if (error.name === 'CredentialsProviderError') {
        errorMessage = 'Invalid AWS credentials. Please check your environment variables';
      } else {
        errorMessage = error.message || 'Upload failed';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Upload company profile image
  async uploadCompanyImage(file: File, companyId: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      folder: `companies/${companyId}/profile`,
      contentType: file.type
    });
  },

  // Upload company presentation file
  async uploadCompanyPresentation(file: File, companyId: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      folder: `companies/${companyId}/presentations`,
      contentType: file.type
    });
  },

  // Upload supplier profile image
  async uploadSupplierImage(file: File, supplierId: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      folder: `suppliers/${supplierId}/profile`,
      contentType: file.type
    });
  },

  // Upload contact profile image
  async uploadContactImage(file: File, contactId: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      folder: `contacts/${contactId}/profile`,
      contentType: file.type
    });
  },

  // Upload RM supplier profile image
  async uploadRMSupplierImage(file: File, supplierId: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      folder: `rm-suppliers/${supplierId}/profile`,
      contentType: file.type
    });
  },

  // Delete file from S3
  async deleteFile(key: string): Promise<boolean> {
    try {
      validateConfig();
      
      // Create S3 client
      const s3Client = new S3Client({
        region: AWS_CONFIG.region,
        credentials: {
          accessKeyId: AWS_CONFIG.accessKeyId,
          secretAccessKey: AWS_CONFIG.secretAccessKey,
        },
      });
      
      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: AWS_CONFIG.bucketName,
        Key: key,
      });
      
      await s3Client.send(command);
      
      return true;
      
    } catch (error) {
      return false;
    }
  },

  // Get file URL
  getFileUrl(key: string): string {
    return `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
  },

  // Test S3 connection and permissions
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      validateConfig();
      
      // Create a small test file
      const testFile = new File(['test'], 'connection-test.txt', { type: 'text/plain' });
      
      const result = await this.uploadFile({
        file: testFile,
        folder: 'test',
        customFilename: 'connection-test.txt'
      });
      
      if (result.success && result.key) {
        // Clean up test file
        await this.deleteFile(result.key);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Connection test failed' 
      };
    }
  },

  // Get CORS configuration instructions
  getCORSConfiguration(): string {
    return `
CORS Configuration for S3 Bucket "${AWS_CONFIG.bucketName}":

1. Go to AWS S3 Console
2. Select your bucket: ${AWS_CONFIG.bucketName}
3. Go to "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Add this configuration:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]

Note: Replace "*" in AllowedOrigins with your actual domain for production.
    `;
  }
};

// Utility function to validate file type for images
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { valid: true };
};

// Utility function to validate presentation files
export const validatePresentationFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid file (PDF, DOC, DOCX, PPT, or PPTX)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB'
    };
  }

  return { valid: true };
}; 