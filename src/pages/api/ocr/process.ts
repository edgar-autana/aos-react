import { NextApiRequest, NextApiResponse } from 'next';

const OCR_API_KEY = import.meta.env.VITE_OCR_KEY;
const OCR_API_URL = "https://apipro1.ocr.space/parse/image";

interface OCRWord {
  WordText: string;
  MinLeft: number;
  MinTop: number;
  MaxRight: number;
  MaxBottom: number;
}

interface OCRLine {
  MinTop: number;
  Words: OCRWord[];
}

interface OCRPageResult {
  FileParseExitCode: number;
  TextOverlay: {
    Lines: OCRLine[];
  };
}

interface OCRResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
  ParsedResults: OCRPageResult[];
}

interface StructuredContent {
  type: string;
  text: string;
  position: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

interface PageData {
  page_number: number;
  structured_content: StructuredContent[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 OCR API - API Key:', OCR_API_KEY ? 'Set' : 'Not set');
  console.log('🔍 OCR API - API Key length:', OCR_API_KEY?.length || 0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OCR_API_KEY) {
    return res.status(500).json({ error: 'OCR API key not configured. Please set VITE_OCR_KEY in your .env file.' });
  }

  try {
    const { fileUrl, language = 'eng', engine = '2' } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl is required' });
    }

    console.log(`🚀 Processing OCR for: ${fileUrl}`);

    // Prepare OCR.space API payload
    const payload = {
      url: fileUrl,
      apikey: OCR_API_KEY,
      language: language,
      isOverlayRequired: 'true',
      isTable: 'false',
      scale: 'true',
      detectOrientation: 'true',
      isCreateSearchablePdf: 'false',
      isSearchablePdfHideTextLayer: 'false',
      filetype: 'pdf',
      OCREngine: engine
    };

    // Make request to OCR.space API
    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload),
    });

    if (!response.ok) {
      throw new Error(`OCR API responded with status: ${response.status}`);
    }

    const result: OCRResponse = await response.json();

    // Check if OCR processing was successful
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || 'OCR processing failed');
    }

    // Process the overlay data to structure the text
    const structuredResults: PageData[] = [];
    
    for (const pageResult of result.ParsedResults || []) {
      const pageData: PageData = {
        page_number: pageResult.FileParseExitCode || 0,
        structured_content: []
      };

      // Get the lines of text with their positions
      const lines = pageResult.TextOverlay?.Lines || [];

      // Sort lines by vertical position (top to bottom)
      lines.sort((a, b) => (a.MinTop || 0) - (b.MinTop || 0));

      // Group lines by vertical proximity to form paragraphs
      let currentParagraph: OCRWord[] = [];
      let currentTop: number | null = null;
      const paragraphSpacing = 20; // Adjust this value based on your needs

      for (const line of lines) {
        const lineTop = line.MinTop || 0;

        // Start new paragraph if there's significant vertical spacing
        if (currentTop !== null && (lineTop - currentTop) > paragraphSpacing) {
          if (currentParagraph.length > 0) {
            // Sort words in paragraph by horizontal position
            currentParagraph.sort((a, b) => (a.MinLeft || 0) - (b.MinLeft || 0));
            const paragraphText = currentParagraph.map(word => word.WordText || '').join(' ');
            
            pageData.structured_content.push({
              type: 'paragraph',
              text: paragraphText,
              position: {
                top: currentParagraph[0]?.MinTop || 0,
                left: currentParagraph[0]?.MinLeft || 0,
                bottom: currentParagraph[currentParagraph.length - 1]?.MaxBottom || 0,
                right: currentParagraph[currentParagraph.length - 1]?.MaxRight || 0
              }
            });
            currentParagraph = [];
          }
        }

        // Add words from this line
        const words = line.Words || [];
        currentParagraph.push(...words);
        currentTop = lineTop;
      }

      // Add the last paragraph if any
      if (currentParagraph.length > 0) {
        currentParagraph.sort((a, b) => (a.MinLeft || 0) - (b.MinLeft || 0));
        const paragraphText = currentParagraph.map(word => word.WordText || '').join(' ');
        
        pageData.structured_content.push({
          type: 'paragraph',
          text: paragraphText,
          position: {
            top: currentParagraph[0]?.MinTop || 0,
            left: currentParagraph[0]?.MinLeft || 0,
            bottom: currentParagraph[currentParagraph.length - 1]?.MaxBottom || 0,
            right: currentParagraph[currentParagraph.length - 1]?.MaxRight || 0
          }
        });
      }

      structuredResults.push(pageData);
    }

    // Extract all text for the assistant
    const allText = structuredResults
      .flatMap(page => page.structured_content)
      .map(content => content.text)
      .join('\n');

    res.status(200).json({
      success: true,
      structured_results: structuredResults,
      text: allText,
      confidence: 0.95 // You can calculate this from OCR results if needed
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'OCR processing failed'
    });
  }
} 