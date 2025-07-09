import { NextApiRequest, NextApiResponse } from 'next';

const ANALYSIS_API_URL = "https://api-3d.autana.ai/api/analyze";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileUrl, analysisType, includeFeatures, includeCosting } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl is required' });
    }

    // Prepare the request payload matching your Python code exactly
    const payload = {
      s3_url: fileUrl
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log(`🚀 Sending analysis request for: ${fileUrl}`);
    console.log("⏳ Waiting for response...");

    // Make the request to your 3D analysis API with 5-minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    const response = await fetch(ANALYSIS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Analysis API responded with status: ${response.status}`);
    }

    const result = await response.json();

    console.log("✅ Analysis completed successfully");

    res.status(200).json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error('Error in 3D analysis:', error);
    
    let errorMessage = 'Analysis failed';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request exceeded timeout (5 minutes)';
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage
    });
  }
} 