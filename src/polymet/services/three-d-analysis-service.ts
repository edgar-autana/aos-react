export interface ThreeDAnalysisResult {
  bounding_box: {
    x: {
      length: number;
      max: number;
      min: number;
    };
    y: {
      length: number;
      max: number;
      min: number;
    };
    z: {
      length: number;
      max: number;
      min: number;
    };
  };
  center_of_mass: {
    x: number;
    y: number;
    z: number;
  };
  surface_area: number;
  volume: number;
}

export interface ThreeDAnalysisResponse {
  success: boolean;
  analysis?: ThreeDAnalysisResult;
  error?: string;
}

export class ThreeDAnalysisService {
  private static readonly API_URL = '/api/3d/analyze';

  static async analyzeModel(
    fileUrl: string, 
    analysisType: string = '3d-model',
    includeFeatures: boolean = true,
    includeCosting: boolean = true
  ): Promise<ThreeDAnalysisResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          analysisType,
          includeFeatures,
          includeCosting,
        }),
      });

      if (!response.ok) {
        throw new Error(`3D Analysis API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '3D analysis failed');
      }

      return {
        success: true,
        analysis: data.analysis,
      };
    } catch (error) {
      console.error('3D Analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '3D analysis failed',
      };
    }
  }

  static async validateFileFormat(file: File): Promise<boolean> {
    const supportedFormats = [
      '.stp', '.step', '.stl', '.obj', '.iges', '.igs', '.x_t', '.x_b'
    ];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return supportedFormats.includes(fileExtension);
  }

  static async validateFileSize(file: File, maxSizeMB: number = 50): Promise<boolean> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
} 