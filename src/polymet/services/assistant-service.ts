export interface AssistantAnalysis {
  success: boolean;
  analysis?: TwoDAnalysisResult;
  error?: string;
}

export interface TwoDAnalysisResult {
  partName: string;
  partNumber: string;
  dimensions: {
    height: number;
    width: number;
    length: number;
    unit: string;
  };
  weight?: number;
  weightUnit?: string;
  rawMaterial?: string;
  instructions: string[];
  surfaceFinish?: string;
  summary: string;
  complexity: 'Low' | 'Medium' | 'High';
  tolerances: {
    general: string;
    critical: string[];
  };
  notes: string[];
}

export class AssistantService {
  private static readonly API_URL = '/api/assistant/analyze-2d';

  static async analyzeDrawing(ocrText: string, fileUrl: string): Promise<AssistantAnalysis> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText,
          fileUrl,
          analysisType: '2d-drawing',
        }),
      });

      if (!response.ok) {
        throw new Error(`Assistant API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      return {
        success: true,
        analysis: data.analysis,
      };
    } catch (error) {
      console.error('Assistant analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  static async getAnalysisPrompt(ocrText: string): Promise<string> {
    return `You are a manufacturing engineer analyzing a 2D technical drawing. 
    
Please analyze the following OCR text extracted from a technical drawing and provide a structured analysis:

OCR Text:
${ocrText}

Please provide the analysis in the following JSON format:
{
  "partName": "string",
  "partNumber": "string", 
  "dimensions": {
    "height": number,
    "width": number,
    "length": number,
    "unit": "mm or in"
  },
  "weight": number (if specified),
  "weightUnit": "kg or lb",
  "rawMaterial": "string",
  "instructions": ["array of machining instructions"],
  "surfaceFinish": "string",
  "summary": "detailed description",
  "complexity": "Low|Medium|High",
  "tolerances": {
    "general": "general tolerance",
    "critical": ["array of critical tolerances"]
  },
  "notes": ["array of important notes"]
}

Focus on extracting:
- Part identification and dimensions
- Material specifications
- Tolerances and surface finish requirements
- Machining instructions and critical features
- Complexity assessment based on features and tolerances`;
  }
} 