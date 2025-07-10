import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ThreeDAnalysisProgressProps {
  currentStep: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string | null;
}

const stepConfig = {
  idle: { label: 'Ready to Upload', icon: '📁' },
  uploading: { label: 'Uploading to S3', icon: '📤' },
  processing: { label: 'Processing 3D Model', icon: '⚙️' },
  analyzing: { label: 'Analyzing Geometry', icon: '🔍' },
  complete: { label: 'Analysis Complete', icon: '✅' },
  error: { label: 'Analysis Failed', icon: '❌' },
};

export default function ThreeDAnalysisProgress({ 
  currentStep, 
  progress, 
  error 
}: ThreeDAnalysisProgressProps) {
  const config = stepConfig[currentStep];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h3 className="text-lg font-semibold">{config.label}</h3>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          
          <Progress value={progress} className="w-full" />
          
          <div className="text-sm text-muted-foreground">
            {currentStep === 'uploading' && 'Uploading your 3D model to secure cloud storage...'}
            {currentStep === 'processing' && 'Converting and validating 3D model format...'}
            {currentStep === 'analyzing' && 'Analyzing geometry, features, and generating machining strategy...'}
            {currentStep === 'complete' && 'Analysis completed successfully!'}
            {currentStep === 'error' && 'An error occurred during analysis. Please try again.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 