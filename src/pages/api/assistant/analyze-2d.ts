import { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = "asst_57pPyhjXgD5z8K5XhMGn0x91";

interface TwoDAnalysisResult {
  part_number: string;
  part_name: string;
  material: string;
  finish: string;
  has_thread: boolean;
  thread_spec: string;
  dimensions: (string | number)[];
  tolerances: (string | number)[];
  radii: (string | number)[];
  angles: (string | number)[];
  special_requirements: string[];
  secondary_processes: {
    process: string;
    details: string;
  }[];
  requires_deburring: boolean;
  requires_cleaning: boolean;
  inspection_points: any[];
  requires_engineering_review: boolean;
  process_type: "casting" | "cnc" | "unknown";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { ocrText, fileUrl, analysisType } = req.body;

    if (!ocrText) {
      return res.status(400).json({ error: 'ocrText is required' });
    }

    console.log(`🚀 Sending to OpenAI Assistant: ${ASSISTANT_ID}`);

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!threadResponse.ok) {
      throw new Error(`Failed to create thread: ${threadResponse.status}`);
    }

    const thread = await threadResponse.json();
    const threadId = thread.id;

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: `Eres un ingeniero mecánico experto en manufactura. Recibirás el contenido de un plano técnico en formato de texto, como si lo extrajera un sistema OCR desde un PDF.

Tu tarea es analizar el plano y devolver un objeto JSON con la siguiente estructura:

{
  "part_number": "",              // Número de parte identificado
  "part_name": "",                // Nombre de la pieza si aparece
  "material": "",                 // Material base especificado con nombre y serie ek stainless steel 400 o 304, Aluminio 6061, Cobre 110 etc 
  "finish": "",                   // Acabado o recubrimiento final
  "has_thread": true/false,       // Si existen roscas
  "thread_spec": "",              // Detalles de las roscas (ej. M8x1.25)
  "dimensions": [],               // Lista de cotas numéricas extraídas
  "tolerances": [],               // Lista de tolerancias, numéricas o simbólicas
  "radii": [],                    // Radios encontrados en el plano
  "angles": [],                   // Ángulos en grados
  "special_requirements": [],     // Requisitos especiales (ej. prueba con pin, fluido, limpieza)
  "secondary_processes": [
    {
      "process": "",        // Nombre del proceso, por ejemplo "anodizado", "honeado", "plateado"
      "details": ""         // Detalles relevantes como material, espesor, color, norma aplicable, etc.
    }
  ],
  "requires_deburring": true/false, // Si el plano sugiere rebabeo o corte de filos
  "requires_cleaning": true/false,  // Si requiere limpieza técnica explícita
  "inspection_points": [],        // Coordenadas de puntos de inspección (opcional)
  "requires_engineering_review": true/false, // Si se requiere análisis adicional
  "process_type": "casting | cnc| unknown" // Inferido según material, tolerancias, notas, es necesario saber que proceso es
}

Para asignar correctamente el campo "process_type", sigue estas reglas:

- Si el material es acero inoxidable, aluminio 6061, 7075, similar, o hay tolerancias ajustadas como ±0.001, roscas, acabados como TiN, instrucciones como "machined surfaces", "break sharp corners", o inspección con pin, entonces el proceso es "cnc" o un material o proceso adecuado solo para CNC.
- Si el material es ADC12, A356, similar, o se mencionan fundición, "gate marks", "ejector pins", "porosity", o "casting allowance", el proceso es "casting".
- Si la información es ambigua o insuficiente, responde "unknown".

No expliques nada. Solo devuelve el JSON., si no encuentras un dato regres unknown pero siempre todos los campos

Contenido del plano técnico:
${ocrText}`
      })
    });

    if (!messageResponse.ok) {
      throw new Error(`Failed to add message: ${messageResponse.status}`);
    }

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      throw new Error(`Failed to start run: ${runResponse.status}`);
    }

    const run = await runResponse.json();
    const runId = run.id;

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`);
      }

      const runStatus = await statusResponse.json();
      
      if (runStatus.status === 'completed') {
        completed = true;
      } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }

      attempts++;
    }

    if (!completed) {
      throw new Error('Analysis timed out');
    }

    // Get the messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${messagesResponse.status}`);
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data[0]; // Get the most recent message (assistant's response)

    if (!assistantMessage || !assistantMessage.content || assistantMessage.content.length === 0) {
      throw new Error('No response from assistant');
    }

    const responseText = assistantMessage.content[0].text.value;

    // Try to parse the JSON response
    let analysisResult: TwoDAnalysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from assistant');
    }

    // Validate required fields
    const requiredFields = [
      'part_number', 'part_name', 'material', 'finish', 'has_thread', 
      'thread_spec', 'dimensions', 'tolerances', 'radii', 'angles',
      'special_requirements', 'secondary_processes', 'requires_deburring',
      'requires_cleaning', 'inspection_points', 'requires_engineering_review', 'process_type'
    ];

    for (const field of requiredFields) {
      if (!(field in analysisResult)) {
        analysisResult[field as keyof TwoDAnalysisResult] = field === 'process_type' ? 'unknown' : 
          field.includes('requires_') ? false : 
          field.includes('has_') ? false : 
          Array.isArray(analysisResult[field as keyof TwoDAnalysisResult]) ? [] : 'unknown';
      }
    }

    res.status(200).json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Assistant analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
} 