export interface TranslationJob {
  urn: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  progress?: number;
  message?: string;
  jobId?: string;
}

export interface TranslationResponse {
  success: boolean;
  urn?: string;
  jobId?: string;
  error?: string;
}

// Get the 3D API base URL from environment variables
const API_3D_BASE_URL = import.meta.env.VITE_API_3D_BASE_URL || 'http://localhost:3001';

export const forgeTranslationApi = {
  // Translate STEP file to SVF format
  async translateStepToSvf(urn: string): Promise<TranslationResponse> {
    try {
      console.log('Starting translation for URN:', urn);
      
      const response = await fetch(`${API_3D_BASE_URL}/api/forge/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urn: urn,
          targetFormat: 'svf'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Translation error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Translation response:', data);

      if (data.success) {
        return {
          success: true,
          urn: data.urn,
          jobId: data.jobId
        };
      } else {
        return {
          success: false,
          error: data.message || 'Translation failed'
        };
      }
    } catch (error) {
      console.error('Translation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to translate model'
      };
    }
  },

  // Check translation status
  async getTranslationStatus(jobId: string): Promise<TranslationJob> {
    try {
      const response = await fetch(`${API_3D_BASE_URL}/api/forge/translate/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking translation status:', error);
      throw error;
    }
  }
}; 