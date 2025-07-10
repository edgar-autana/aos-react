import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type ThreeDAnalysisResult } from "../services/three-d-analysis-service";

interface ThreeDAnalysisResultProps {
  analysis: ThreeDAnalysisResult;
}

export default function ThreeDAnalysisResult({ analysis }: ThreeDAnalysisResultProps) {
  const formatNumber = (num: number) => {
    return Number(num.toFixed(2)).toLocaleString();
  };

  const getComplexityLevel = () => {
    const volume = analysis.volume;
    const surfaceArea = analysis.surface_area;
    
    if (volume > 1000000 || surfaceArea > 100000) return 'High';
    if (volume > 100000 || surfaceArea > 10000) return 'Medium';
    return 'Low';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const complexity = getComplexityLevel();

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">3D Model Analysis</CardTitle>
              <p className="text-muted-foreground">Geometric Analysis Results</p>
            </div>
            <div className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getComplexityColor(complexity)}`}>
              {complexity} Complexity
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bounding Box Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bounding Box Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(analysis.bounding_box.x.length)}</p>
                <p className="text-sm text-muted-foreground">X Length (mm)</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analysis.bounding_box.x.min)} to {formatNumber(analysis.bounding_box.x.max)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(analysis.bounding_box.y.length)}</p>
                <p className="text-sm text-muted-foreground">Y Length (mm)</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analysis.bounding_box.y.min)} to {formatNumber(analysis.bounding_box.y.max)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(analysis.bounding_box.z.length)}</p>
                <p className="text-sm text-muted-foreground">Z Length (mm)</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analysis.bounding_box.z.min)} to {formatNumber(analysis.bounding_box.z.max)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center of Mass */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Center of Mass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">X Coordinate:</span>
                <span className="text-sm font-mono">{formatNumber(analysis.center_of_mass.x)} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Y Coordinate:</span>
                <span className="text-sm font-mono">{formatNumber(analysis.center_of_mass.y)} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Z Coordinate:</span>
                <span className="text-sm font-mono">{formatNumber(analysis.center_of_mass.z)} mm</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume and Surface Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Geometric Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-secondary rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{formatNumber(analysis.volume)}</p>
              <p className="text-sm text-muted-foreground">Volume (mm³)</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(analysis.volume / 1000)} cm³
              </p>
            </div>
            <div className="text-center p-6 bg-secondary rounded-lg">
              <p className="text-3xl font-bold text-green-600">{formatNumber(analysis.surface_area)}</p>
              <p className="text-sm text-muted-foreground">Surface Area (mm²)</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(analysis.surface_area / 100)} cm²
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-800">Model Size</p>
              <p className="text-sm text-blue-600">
                {formatNumber(analysis.bounding_box.x.length)} × {formatNumber(analysis.bounding_box.y.length)} × {formatNumber(analysis.bounding_box.z.length)} mm
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-800">Volume</p>
              <p className="text-sm text-green-600">{formatNumber(analysis.volume / 1000)} cm³</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-lg font-semibold text-purple-800">Surface Area</p>
              <p className="text-sm text-purple-600">{formatNumber(analysis.surface_area / 100)} cm²</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Key Observations:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Model spans {formatNumber(analysis.bounding_box.x.length)}mm in X direction
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Center of mass is offset by {formatNumber(Math.abs(analysis.center_of_mass.x))}mm from origin
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Surface area to volume ratio: {(analysis.surface_area / analysis.volume).toFixed(3)}
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Complexity level: {complexity} (based on volume and surface area)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 