import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon } from "lucide-react";
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
    console.log('Upload complete, fileUrl:', fileUrl);
    setState(prev => ({
      ...prev,
      s3Url: fileUrl,
      currentStep: 'idle',
      progress: 0,
    }));
  };

  const handleStartOCR = () => {
    if (!state.s3Url) return;
    
    setState(prev => ({
      ...prev,
      currentStep: 'processing',
      progress: 30,
      isProcessing: true,
      error: null,
    }));
    
    // Start 2D drawing analysis
    process2DDrawing(state.s3Url);
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

          {/* Uploaded File Display */}
          {state.s3Url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded 2D Drawing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileTextIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">2D CAD Drawing</p>
                      <p className="text-xs text-muted-foreground">Successfully uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(state.s3Url!)}
                      className="h-8 px-3 text-xs"
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-3 text-xs"
                    >
                      <a href={state.s3Url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          <Card className="border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div>s3Url: {state.s3Url ? '✅ Set' : '❌ Not set'}</div>
                <div>isProcessing: {state.isProcessing ? '✅ True' : '❌ False'}</div>
                <div>analysisResult: {state.analysisResult ? '✅ Set' : '❌ Not set'}</div>
                <div>Button should show: {state.s3Url && !state.isProcessing && !state.analysisResult ? '✅ Yes' : '❌ No'}</div>
              </div>
            </CardContent>
          </Card>

          {/* OCR Trigger Button */}
          {state.s3Url && !state.isProcessing && !state.analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OCR Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="font-medium text-sm">Ready for OCR Analysis</p>
                      <p className="text-xs text-muted-foreground">
                        Click the button below to start text extraction and analysis
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartOCR}
                    disabled={state.isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <span className="mr-2">🔍</span>
                    Start OCR Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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