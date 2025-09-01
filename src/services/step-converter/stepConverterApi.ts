export interface StepConverterResponse {
  success: boolean;
  urn?: string;
  error?: string;
}

// Get the AOS API base URL from environment variables (now centralized)
const AOS_API_BASE_URL = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';

export const stepConverterApi = {
  // Convert STEP file to URN for 3D viewer
  async convertStepToUrn(fileUrl: string): Promise<StepConverterResponse> {
    try {
      
      // Log file URL details for debugging
      const url = new URL(fileUrl);
      
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
      
      
      const response = await fetch(`${AOS_API_BASE_URL}/api/v1/autodesk/upload-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STEP conversion error:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response status text:', response.statusText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success && data.urn) {
        return {
          success: true,
          urn: data.urn,
        };
      } else {
        // When success is false, prioritize the error field over message
        const errorMessage = data.error || data.message || 'No URN returned from conversion service';
        console.error('❌ Conversion failed:', errorMessage);
        console.error('❌ Full response data:', data);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('❌ STEP conversion failed:', error);
      
      // More detailed error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Network error - possible CORS issue');
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