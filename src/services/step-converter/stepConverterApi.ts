export interface StepConverterResponse {
  success: boolean;
  urn?: string;
  error?: string;
}

// Get the 3D API base URL from environment variables
const API_3D_BASE_URL = import.meta.env.VITE_API_3D_BASE_URL || 'http://localhost:3001';

export const stepConverterApi = {
  // Convert STEP file to URN for 3D viewer
  async convertStepToUrn(fileUrl: string): Promise<StepConverterResponse> {
    try {
      console.log('Converting STEP to URN for file:', fileUrl);
      console.log('Using 3D API base URL:', API_3D_BASE_URL);
      
      const requestBody = {
        file_url: fileUrl,
        scopes: [
          "data:read",
          "data:write", 
          "data:create",
          "bucket:read",
          "bucket:create"
        ]
      };
      
      const response = await fetch(`${API_3D_BASE_URL}/api/aps/v2/upload-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('STEP conversion error:', errorText);
        console.error('Response status:', response.status);
        console.error('Response status text:', response.statusText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('STEP conversion response:', data);

      if (data.success && data.urn) {
        return {
          success: true,
          urn: data.urn,
        };
      } else {
        return {
          success: false,
          error: data.message || 'No URN returned from conversion service',
        };
      }
    } catch (error) {
      console.error('STEP conversion failed:', error);
      
      // More detailed error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - possible CORS issue');
        return {
          success: false,
          error: 'Network error - check if the 3D API server is running and CORS is configured',
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert STEP to URN',
      };
    }
  }
}; 