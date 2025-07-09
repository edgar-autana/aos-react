import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import S3UploadZone from "./s3-upload-zone";
import ThreeDAnalysisProgress from "./three-d-analysis-progress";
import ThreeDAnalysisResult from "./three-d-analysis-result";
import { use3DAnalysis } from "../hooks/use-3d-analysis";

export default function ThreeDAnalysisUpdated() {
  const {
    file,
    isProcessing,
    currentStep,
    progress,
    error,
    analysisResult,
    setFile,
    startAnalysis,
    reset,
  } = use3DAnalysis();

  const canAnalyze = file && !isProcessing;

  const exportResults = () => {
    if (!analysisResult) return;
    
    const dataStr = JSON.stringify(analysisResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3d-analysis-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">3D CAD Model</CardTitle>
        </CardHeader>
        <CardContent>
          <S3UploadZone
            accept=".stp,.step,.stl,.obj,.iges,.igs,.x_t,.x_b"
            label="Upload 3D Model (STEP, STL, OBJ, IGES, Parasolid)"
            description="Upload 3D CAD models for geometry analysis and manufacturing insights"
            icon={<span className="text-2xl text-primary">📁</span>}
            onFileChange={setFile}
            file={file}
            maxSize={50}
          />
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            onClick={startAnalysis}
            disabled={!canAnalyze}
            className="w-full sm:w-auto"
          >
            <span className="mr-2">📤</span>
            Analyze 3D Model
          </Button>
          
          {analysisResult && (
            <Button
              onClick={reset}
              className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <span className="mr-2">🔄</span>
              New Analysis
            </Button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {isProcessing && (
        <ThreeDAnalysisProgress
          currentStep={currentStep}
          progress={progress}
          error={error}
        />
      )}

      {/* Results Section */}
      {analysisResult && currentStep === 'complete' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
            <Button 
              onClick={exportResults} 
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-3 py-1"
            >
              <span className="mr-2">💾</span>
              Export Results
            </Button>
          </div>
          <ThreeDAnalysisResult analysis={analysisResult} />
        </div>
      )}

      {/* Error Display */}
      {error && currentStep === 'error' && (
        <Card className="border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-sm font-medium">Analysis failed:</span>
              <span className="text-sm">{error}</span>
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
    </div>
  );
} 