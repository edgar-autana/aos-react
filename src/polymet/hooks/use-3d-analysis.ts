import { useState, useCallback } from 'react';
import { S3UploadService, S3UploadResponse } from '../services/s3-upload-service';
import { ThreeDAnalysisService, ThreeDAnalysisResponse, ThreeDAnalysisResult } from '../services/three-d-analysis-service';

export interface ThreeDAnalysisState {
  file: File | null;
  isProcessing: boolean;
  currentStep: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error: string | null;
  s3Url: string | null;
  analysisResult: ThreeDAnalysisResult | null;
}

export interface ThreeDAnalysisActions {
  setFile: (file: File | null) => void;
  startAnalysis: () => Promise<void>;
  reset: () => void;
}

export function use3DAnalysis(): ThreeDAnalysisState & ThreeDAnalysisActions {
  const [state, setState] = useState<ThreeDAnalysisState>({
    file: null,
    isProcessing: false,
    currentStep: 'idle',
    progress: 0,
    error: null,
    s3Url: null,
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
        currentStep: 'processing',
        progress: 30,
      }));

      // Step 2: 3D Model Analysis
      setState(prev => ({ ...prev, progress: 50 }));
      const analysisResult: ThreeDAnalysisResponse = await ThreeDAnalysisService.analyzeModel(
        uploadResult.fileUrl,
        '3d-model',
        true,
        true
      );

      if (!analysisResult.success || !analysisResult.analysis) {
        throw new Error(analysisResult.error || '3D analysis failed');
      }

      setState(prev => ({
        ...prev,
        analysisResult: analysisResult.analysis,
        currentStep: 'complete',
        progress: 100,
        isProcessing: false,
      }));

    } catch (error) {
      console.error('3D Analysis error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '3D analysis failed',
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