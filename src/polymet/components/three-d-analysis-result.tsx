import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ThreeDAnalysisResult {
  bounding_box: {
    x: {
      length: number;
      max: number;
      min: number;
    };
    y: {
      length: number;
      max: number;
      min: number;
    };
    z: {
      length: number;
      max: number;
      min: number;
    };
  };
  center_of_mass: {
    x: number;
    y: number;
    z: number;
  };
  surface_area: number;
  volume: number;
}

interface ThreeDAnalysisResultProps {
  analysis: ThreeDAnalysisResult;
}

export default function ThreeDAnalysisResult({ analysis }: ThreeDAnalysisResultProps) {
  // Calculate volume more accurately using bounding box dimensions
  const calculatedVolume = analysis.bounding_box.x.length * analysis.bounding_box.y.length * analysis.bounding_box.z.length;
  const volumeToUse = analysis.volume > 0 ? analysis.volume : calculatedVolume;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              3D Model Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precise geometric measurements
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {(volumeToUse / 1000).toFixed(1)} cm³
        </Badge>
      </div>

      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dimensions Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Length:</span>
              <span className="text-sm font-medium">{analysis.bounding_box.x.length.toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Width:</span>
              <span className="text-sm font-medium">{analysis.bounding_box.y.length.toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Height:</span>
              <span className="text-sm font-medium">{analysis.bounding_box.z.length.toFixed(1)} mm</span>
            </div>
          </CardContent>
        </Card>

        {/* Volume Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {(volumeToUse / 1000).toFixed(1)} cm³
              </div>
              <div className="text-xs text-gray-500">
                {volumeToUse.toLocaleString()} mm³
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surface Area Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Surface Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {(analysis.surface_area / 100).toFixed(1)} cm²
              </div>
              <div className="text-xs text-gray-500">
                {analysis.surface_area.toLocaleString()} mm²
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              Volume: <span className="font-medium">{(volumeToUse / 1000).toFixed(1)} cm³</span> • 
              Surface: <span className="font-medium">{(analysis.surface_area / 100).toFixed(1)} cm²</span>
            </p>
            <p>
              Dimensions: <span className="font-medium">{analysis.bounding_box.x.length.toFixed(1)} × {analysis.bounding_box.y.length.toFixed(1)} × {analysis.bounding_box.z.length.toFixed(1)} mm</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 