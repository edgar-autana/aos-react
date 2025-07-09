import { useState, useCallback } from 'react';
import { S3UploadService, S3UploadResponse } from '../services/s3-upload-service';
import { OCRService, OCRResult } from '../services/ocr-service';
import { AssistantService, AssistantAnalysis, TwoDAnalysisResult } from '../services/assistant-service';

export interface TwoDAnalysisState {
  file: File | null;
  isProcessing: boolean;
  currentStep: 'idle' | 'uploading' | 'ocr-processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error: string | null;
  s3Url: string | null;
  ocrResult: OCRResult | null;
  analysisResult: TwoDAnalysisResult | null;
}

export interface TwoDAnalysisActions {
  setFile: (file: File | null) => void;
  startAnalysis: () => Promise<void>;
  reset: () => void;
}

export function use2DAnalysis(): TwoDAnalysisState & TwoDAnalysisActions {
  const [state, setState] = useState<TwoDAnalysisState>({
    file: null,
    isProcessing: false,
    currentStep: 'idle',
    progress: 0,
    error: null,
    s3Url: null,
    ocrResult: null,
    analysisResult: null,
  });

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({
      ...prev,
      file,
      error: null,
      currentStep: 'idle',
      progress: 0,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      file: null,
      isProcessing: false,
      currentStep: 'idle',
      progress: 0,
      error: null,
      s3Url: null,
      ocrResult: null,
      analysisResult: null,
    });
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: 'No file selected' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'uploading',
      progress: 0,
      error: null,
    }));

    try {
      // Step 1: Upload to S3
      setState(prev => ({ ...prev, progress: 10 }));
      const uploadResult: S3UploadResponse = await S3UploadService.uploadFile(state.file);
      
      if (!uploadResult.success || !uploadResult.fileUrl) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setState(prev => ({
        ...prev,
        s3Url: uploadResult.fileUrl,
        currentStep: 'ocr-processing',
        progress: 30,
      }));

      // Step 2: OCR Processing
      const ocrResult: OCRResult = await OCRService.extractText(uploadResult.fileUrl);
      
      if (!ocrResult.success || !ocrResult.text) {
        throw new Error(ocrResult.error || 'OCR processing failed');
      }

      setState(prev => ({
        ...prev,
        ocrResult,
        currentStep: 'analyzing',
        progress: 60,
      }));

      // Step 3: Assistant Analysis
      const analysisResult: AssistantAnalysis = await AssistantService.analyzeDrawing(
        ocrResult.text,
        uploadResult.fileUrl
      );

      if (!analysisResult.success || !analysisResult.analysis) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      setState(prev => ({
        ...prev,
        analysisResult: analysisResult.analysis,
        currentStep: 'complete',
        progress: 100,
        isProcessing: false,
      }));

    } catch (error) {
      console.error('2D Analysis error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        currentStep: 'error',
        isProcessing: false,
      }));
    }
  }, [state.file]);

  return {
    ...state,
    setFile,
    startAnalysis,
    reset,
  };
} 