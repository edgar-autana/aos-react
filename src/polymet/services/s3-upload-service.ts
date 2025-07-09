export interface S3UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export class S3UploadService {
  private static async getPresignedUrl(fileName: string, fileType: string): Promise<string> {
    // This would call your backend API to get a presigned URL
    const response = await fetch('/api/s3/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        bucket: 'polymet-uploads', // Your S3 bucket name
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const data = await response.json();
    return data.presignedUrl;
  }

  static async uploadFile(file: File): Promise<S3UploadResponse> {
    try {
      // Get presigned URL for upload
      const presignedUrl = await this.getPresignedUrl(file.name, file.type);
      
      // Upload file directly to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Extract the file URL from the presigned URL
      const fileUrl = presignedUrl.split('?')[0];

      return {
        success: true,
        fileUrl,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
} 