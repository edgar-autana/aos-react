import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import S3UploadZone from "./s3-upload-zone";

interface TwoDAnalysisState {
  file: File | null;
  s3Url: string | null;
  isProcessing: boolean;
  currentStep: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error: string | null;
  analysisResult: any | null;
}

export default function TwoDAnalysisUpdated() {
  const [state, setState] = useState<TwoDAnalysisState>({
    file: null,
    s3Url: null,
    isProcessing: false,
    currentStep: 'idle',
    progress: 0,
    error: null,
    analysisResult: null,
  });

  const handleFileChange = (file: File | null) => {
    setState(prev => ({
      ...prev,
      file,
      error: null,
      currentStep: 'idle',
      progress: 0,
      analysisResult: null,
    }));
  };

  const handleUploadComplete = (fileUrl: string) => {
    setState(prev => ({
      ...prev,
      s3Url: fileUrl,
      currentStep: 'processing',
      progress: 30,
    }));
    
    // Start 2D drawing analysis
    process2DDrawing(fileUrl);
  };

  const process2DDrawing = async (fileUrl: string) => {
    try {
      setState(prev => ({ ...prev, progress: 50 }));
      
      // Call 2D drawing analysis service
      const analysisResponse = await fetch('/api/2d/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          analysisType: '2d-drawing',
          includeInspection: true,
          includeManufacturing: true,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('2D drawing analysis failed');
      }

      const analysisResult = await analysisResponse.json();
      
      setState(prev => ({
        ...prev,
        analysisResult: analysisResult.analysis,
        currentStep: 'complete',
        progress: 100,
        isProcessing: false,
      }));

    } catch (error) {
      console.error('2D analysis error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '2D analysis failed',
        currentStep: 'error',
        isProcessing: false,
      }));
    }
  };

  const reset = () => {
    setState({
      file: null,
      s3Url: null,
      isProcessing: false,
      currentStep: 'idle',
      progress: 0,
      error: null,
      analysisResult: null,
    });
  };

  const exportResults = () => {
    if (!state.analysisResult) return;
    
    const dataStr = JSON.stringify(state.analysisResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2d-analysis-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">2D Drawing Analysis</h2>
          <p className="text-muted-foreground">
            Upload 2D CAD drawings to analyze dimensions, features, and manufacturing requirements
          </p>
        </div>
        {state.analysisResult && (
          <div className="flex space-x-2">
            <Button onClick={exportResults} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-3 py-1">
              <span className="mr-2">💾</span>
              Export Results
            </Button>
            <Button onClick={reset} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-3 py-1">
              <span className="mr-2">🔄</span>
              New Analysis
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="results" disabled={!state.analysisResult}>
            Analysis Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <S3UploadZone
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
            label="2D CAD Drawing"
            description="Upload PDF, PNG, JPG, TIFF, or BMP files"
            icon={<span className="text-2xl text-primary">📄</span>}
            onFileChange={handleFileChange}
            onUploadComplete={handleUploadComplete}
            file={state.file}
            maxSize={15}
          />

          {/* Progress Section */}
          {state.isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Processing 2D Drawing</h3>
                    <span className="text-sm text-muted-foreground">{state.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {state.currentStep === 'processing' && 'Extracting text and dimensions...'}
                    {state.currentStep === 'analyzing' && 'Analyzing features and requirements...'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {state.error && (
            <Card className="border-red-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <span className="text-sm font-medium">Analysis failed:</span>
                  <span className="text-sm">{state.error}</span>
                </div>
                <Button
                  onClick={reset}
                  className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 mt-3"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {state.analysisResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Analysis Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your 2D drawing has been successfully analyzed. View the detailed results below.
                  </p>
                </CardContent>
              </Card>
              
              {/* Add your results display here */}
              <Card>
                <CardContent className="p-6">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(state.analysisResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 