import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import S3UploadZone from "./s3-upload-zone";

interface ThreeDAnalysisState {
  file: File | null;
  s3Url: string | null;
  isProcessing: boolean;
  currentStep: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error: string | null;
  analysisResult: any | null;
}

interface ThreeDAnalysisResult {
  partName: string;
  partNumber: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  volume: number;
  surfaceArea: number;
  weight: number;
  weightUnit: string;
  material: string;
  complexity: 'Low' | 'Medium' | 'High';
  features: {
    holes: number;
    threads: number;
    pockets: number;
    fillets: number;
    chamfers: number;
  };
  machiningStrategy: {
    approach: string;
    tooling: string[];
    fixturing: string;
    estimatedTime: number;
  };
  costEstimation: {
    materialCost: number;
    machiningCost: number;
    totalCost: number;
    currency: string;
  };
  recommendations: string[];
}

export default function ThreeDAnalysis() {
  const [state, setState] = useState<ThreeDAnalysisState>({
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
    
    // Start 3D model processing
    process3DModel(fileUrl);
  };

  const process3DModel = async (fileUrl: string) => {
    try {
      setState(prev => ({ ...prev, progress: 50 }));
      
      // Call 3D model analysis service
      const analysisResponse = await fetch('/api/3d/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          analysisType: '3d-model',
          includeFeatures: true,
          includeCosting: true,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('3D model analysis failed');
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
      console.error('3D analysis error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '3D analysis failed',
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
    link.download = '3d-analysis-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">3D Model Analysis</h2>
          <p className="text-muted-foreground">
            Upload 3D CAD models to analyze geometry, features, and generate machining strategies
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
            accept=".stp,.step,.stl,.obj,.iges,.igs,.x_t,.x_b"
            label="3D CAD Model"
            description="Upload STEP, STL, OBJ, IGES, or Parasolid files"
            icon={<span className="text-2xl text-primary">📁</span>}
            onFileChange={handleFileChange}
            onUploadComplete={handleUploadComplete}
            file={state.file}
            maxSize={50}
          />

          {/* Progress Section */}
          {state.isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Processing 3D Model</h3>
                    <span className="text-sm text-muted-foreground">{state.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {state.currentStep === 'processing' && 'Analyzing geometry and features...'}
                    {state.currentStep === 'analyzing' && 'Generating machining strategy...'}
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
              {/* Header Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{state.analysisResult.partName}</CardTitle>
                      <p className="text-muted-foreground">Part Number: {state.analysisResult.partNumber}</p>
                    </div>
                    <Badge className={getComplexityColor(state.analysisResult.complexity)}>
                      {state.analysisResult.complexity} Complexity
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dimensions and Properties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">📏</span>
                      Dimensions & Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{state.analysisResult.dimensions.length}</p>
                        <p className="text-sm text-muted-foreground">Length ({state.analysisResult.dimensions.unit})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{state.analysisResult.dimensions.width}</p>
                        <p className="text-sm text-muted-foreground">Width ({state.analysisResult.dimensions.unit})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{state.analysisResult.dimensions.height}</p>
                        <p className="text-sm text-muted-foreground">Height ({state.analysisResult.dimensions.unit})</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Volume:</span>
                        <span className="text-sm">{state.analysisResult.volume} cm³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Surface Area:</span>
                        <span className="text-sm">{state.analysisResult.surfaceArea} cm²</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Weight:</span>
                        <span className="text-sm">{state.analysisResult.weight} {state.analysisResult.weightUnit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Material:</span>
                        <span className="text-sm">{state.analysisResult.material}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">🧊</span>
                      Geometric Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold">{state.analysisResult.features.holes}</p>
                        <p className="text-sm text-muted-foreground">Holes</p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold">{state.analysisResult.features.threads}</p>
                        <p className="text-sm text-muted-foreground">Threads</p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold">{state.analysisResult.features.pockets}</p>
                        <p className="text-sm text-muted-foreground">Pockets</p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold">{state.analysisResult.features.fillets}</p>
                        <p className="text-sm text-muted-foreground">Fillets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Machining Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Machining Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Approach:</p>
                    <p className="text-sm text-muted-foreground">{state.analysisResult.machiningStrategy.approach}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Tooling:</p>
                    <ul className="space-y-1">
                      {state.analysisResult.machiningStrategy.tooling.map((tool: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Fixturing:</p>
                    <p className="text-sm text-muted-foreground">{state.analysisResult.machiningStrategy.fixturing}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Estimated Machining Time:</p>
                    <p className="text-sm text-muted-foreground">{state.analysisResult.machiningStrategy.estimatedTime} minutes</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Estimation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">💰</span>
                    Cost Estimation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <p className="text-2xl font-bold">{state.analysisResult.costEstimation.currency} {state.analysisResult.costEstimation.materialCost}</p>
                      <p className="text-sm text-muted-foreground">Material Cost</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <p className="text-2xl font-bold">{state.analysisResult.costEstimation.currency} {state.analysisResult.costEstimation.machiningCost}</p>
                      <p className="text-sm text-muted-foreground">Machining Cost</p>
                    </div>
                    <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
                      <p className="text-2xl font-bold">{state.analysisResult.costEstimation.currency} {state.analysisResult.costEstimation.totalCost}</p>
                      <p className="text-sm">Total Cost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manufacturing Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {state.analysisResult.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-muted-foreground">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 