import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TwoDAnalysisResult {
  part_number: string;
  part_name: string;
  material: string;
  finish: string;
  has_thread: boolean;
  thread_spec: string;
  dimensions: (string | number)[];
  tolerances: (string | number)[];
  radii: (string | number)[];
  angles: (string | number)[];
  special_requirements: string[];
  secondary_processes: {
    process: string;
    details: string;
  }[];
  requires_deburring: boolean;
  requires_cleaning: boolean;
  inspection_points: any[];
  requires_engineering_review: boolean;
  process_type: "casting" | "cnc" | "unknown";
}

interface TwoDAnalysisResultNewProps {
  analysis: TwoDAnalysisResult;
}

export default function TwoDAnalysisResultNew({ analysis }: TwoDAnalysisResultNewProps) {
  const getProcessTypeColor = (processType: string) => {
    switch (processType) {
      case 'cnc': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'casting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'unknown': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <span className="text-green-600">✓</span>
    ) : (
      <span className="text-red-600">✗</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{analysis.part_name || "Unknown Part"}</CardTitle>
              <p className="text-muted-foreground">Part Number: {analysis.part_number || "N/A"}</p>
            </div>
            <Badge className={getProcessTypeColor(analysis.process_type)}>
              {analysis.process_type.toUpperCase()} Process
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Material:</p>
              <p className="text-sm text-muted-foreground">{analysis.material || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Finish:</p>
              <p className="text-sm text-muted-foreground">{analysis.finish || "Unknown"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dimensions and Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimensions & Measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.dimensions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Dimensions:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.dimensions.map((dim, index) => (
                    <Badge key={index} variant="secondary">
                      {dim}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.tolerances.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tolerances:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.tolerances.map((tol, index) => (
                    <Badge key={index} variant="outline">
                      {tol}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.radii.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Radii:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.radii.map((radius, index) => (
                    <Badge key={index} variant="secondary">
                      R{radius}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.angles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Angles:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.angles.map((angle, index) => (
                    <Badge key={index} variant="outline">
                      {angle}°
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threading and Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Threading & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Has Threads:</span>
              <span className="text-sm">{getBooleanIcon(analysis.has_thread)}</span>
            </div>

            {analysis.has_thread && analysis.thread_spec && (
              <div>
                <p className="text-sm font-medium mb-2">Thread Specification:</p>
                <p className="text-sm text-muted-foreground">{analysis.thread_spec}</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requires Deburring:</span>
              <span className="text-sm">{getBooleanIcon(analysis.requires_deburring)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requires Cleaning:</span>
              <span className="text-sm">{getBooleanIcon(analysis.requires_cleaning)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engineering Review:</span>
              <span className="text-sm">{getBooleanIcon(analysis.requires_engineering_review)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Requirements */}
      {analysis.special_requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Special Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.special_requirements.map((requirement, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <p className="text-sm">{requirement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secondary Processes */}
      {analysis.secondary_processes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Secondary Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.secondary_processes.map((process, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{process.process}</h4>
                  </div>
                  {process.details && (
                    <p className="text-sm text-muted-foreground">{process.details}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Points */}
      {analysis.inspection_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspection Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.inspection_points.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span className="text-sm">{JSON.stringify(point)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 