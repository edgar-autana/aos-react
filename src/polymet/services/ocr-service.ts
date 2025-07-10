export interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
  confidence?: number;
  pages?: OCRPage[];
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  confidence: number;
}

export class OCRService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY || "f1f68ea46a88957";
  private static readonly API_URL = 'https://api.ocr.space/parse/image';

  static async extractText(fileUrl: string): Promise<OCRResult> {
    try {
      const formData = new FormData();
      formData.append('url', fileUrl);
      formData.append('apikey', this.API_KEY || '');
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('filetype', 'pdf');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // More accurate engine

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage || 'OCR processing failed');
      }

      // Extract text from all pages
      const pages: OCRPage[] = [];
      let fullText = '';
      let totalConfidence = 0;

      if (data.ParsedResults && data.ParsedResults.length > 0) {
        data.ParsedResults.forEach((result: any, index: number) => {
          const pageText = result.ParsedText || '';
          const confidence = result.TextOverlay?.Lines?.[0]?.Words?.[0]?.Confidence || 0;
          
          pages.push({
            pageNumber: index + 1,
            text: pageText,
            confidence,
          });
          
          fullText += pageText + '\n';
          totalConfidence += confidence;
        });
      }

      const averageConfidence = pages.length > 0 ? totalConfidence / pages.length : 0;

      return {
        success: true,
        text: fullText.trim(),
        confidence: averageConfidence,
        pages,
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
      };
    }
  }
} 