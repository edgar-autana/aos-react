import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">3D Model Analysis</h2>
        <p className="text-muted-foreground mt-1">
          Geometric properties from 3D analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bounding Box */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Bounding Box</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">X Axis</div>
                <div className="font-medium">{analysis.bounding_box.x.length.toFixed(1)} mm</div>
                <div className="text-xs text-muted-foreground">
                  {analysis.bounding_box.x.min.toFixed(1)} to {analysis.bounding_box.x.max.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Y Axis</div>
                <div className="font-medium">{analysis.bounding_box.y.length.toFixed(1)} mm</div>
                <div className="text-xs text-muted-foreground">
                  {analysis.bounding_box.y.min.toFixed(1)} to {analysis.bounding_box.y.max.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Z Axis</div>
                <div className="font-medium">{analysis.bounding_box.z.length.toFixed(1)} mm</div>
                <div className="text-xs text-muted-foreground">
                  {analysis.bounding_box.z.min.toFixed(1)} to {analysis.bounding_box.z.max.toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center of Mass */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Center of Mass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">X</div>
                <div className="font-medium">{analysis.center_of_mass.x.toFixed(1)} mm</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Y</div>
                <div className="font-medium">{analysis.center_of_mass.y.toFixed(1)} mm</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Z</div>
                <div className="font-medium">{analysis.center_of_mass.z.toFixed(1)} mm</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volume */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.volume.toLocaleString()} mm³
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(analysis.volume / 1000).toFixed(2)} cm³
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surface Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Surface Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.surface_area.toLocaleString()} mm²
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(analysis.surface_area / 100).toFixed(2)} cm²
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surface to Volume Ratio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Surface/Volume Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(analysis.surface_area / analysis.volume).toFixed(3)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                mm²/mm³
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This 3D model has a volume of <span className="font-medium">{analysis.volume.toLocaleString()} mm³</span> 
              and a surface area of <span className="font-medium">{analysis.surface_area.toLocaleString()} mm²</span>.
            </p>
            <p>
              The bounding box dimensions are {analysis.bounding_box.x.length.toFixed(1)} × {analysis.bounding_box.y.length.toFixed(1)} × {analysis.bounding_box.z.length.toFixed(1)} mm,
              with the center of mass located at ({analysis.center_of_mass.x.toFixed(1)}, {analysis.center_of_mass.y.toFixed(1)}, {analysis.center_of_mass.z.toFixed(1)}) mm.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 