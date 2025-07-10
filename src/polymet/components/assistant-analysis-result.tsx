import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Ruler, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Hash,
  Tag,
  Zap,
  Wrench,
  Eye,
  Target,
  Gauge,
  Circle,
  Square,
  Triangle,
  CornerDownRight
} from "lucide-react";

interface AssistantAnalysis {
  part_number: string;
  part_name: string;
  material: string;
  finish: string;
  has_thread: boolean;
  thread_spec: string;
  dimensions: number[];
  tolerances: string[];
  radii: string[];
  angles: number[];
  special_requirements: string[];
  secondary_processes: Array<{
    process: string;
    details: string;
  }>;
  requires_deburring: boolean;
  requires_cleaning: boolean;
  inspection_points: any[];
  requires_engineering_review: boolean;
  process_type: string;
}

interface AssistantAnalysisResultProps {
  analysis: AssistantAnalysis;
}

export default function AssistantAnalysisResult({ analysis }: AssistantAnalysisResultProps) {
  const getProcessTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cnc':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'casting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProcessTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cnc':
        return <Settings className="h-4 w-4" />;
      case 'casting':
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {analysis.part_name || 'Technical Drawing Analysis'}
          </h2>
          {analysis.part_number && (
            <p className="text-muted-foreground mt-1">
              Part Number: <span className="font-mono">{analysis.part_number}</span>
            </p>
          )}
        </div>
        <Badge className={`px-3 py-1 text-sm font-medium ${getProcessTypeColor(analysis.process_type)}`}>
          <div className="flex items-center gap-1">
            {getProcessTypeIcon(analysis.process_type)}
            {analysis.process_type.toUpperCase()}
          </div>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Material & Finish */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Material & Finish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Material:</span>
              <p className="font-medium">{analysis.material || 'Not specified'}</p>
            </div>
            {analysis.finish && (
              <div>
                <span className="text-xs text-muted-foreground">Finish:</span>
                <p className="font-medium">{analysis.finish}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimensions ({analysis.dimensions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              {analysis.dimensions.slice(0, 9).map((dim, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {dim}
                </Badge>
              ))}
              {analysis.dimensions.length > 9 && (
                <Badge variant="outline" className="text-xs">
                  +{analysis.dimensions.length - 9} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tolerances */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Tolerances ({analysis.tolerances.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analysis.tolerances.slice(0, 3).map((tol, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tol}
                </Badge>
              ))}
              {analysis.tolerances.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{analysis.tolerances.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Threading */}
        {analysis.has_thread && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Threading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {analysis.thread_spec || 'Threaded'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Radii */}
        {analysis.radii.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Circle className="h-4 w-4" />
                Radii ({analysis.radii.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {analysis.radii.map((radius, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {radius}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Angles */}
        {analysis.angles.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CornerDownRight className="h-4 w-4" />
                Angles ({analysis.angles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                {analysis.angles.map((angle, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {angle}°
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Requirements & Processes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {analysis.requires_deburring ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Deburring Required</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.requires_cleaning ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Cleaning Required</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.requires_engineering_review ? (
                    <CheckCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Engineering Review</span>
                </div>
              </div>
              
              {analysis.secondary_processes.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Secondary Processes:</span>
                  <div className="space-y-1 mt-1">
                    {analysis.secondary_processes.map((process, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {process.process}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Special Requirements */}
        {analysis.special_requirements.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.special_requirements.map((req, index) => (
                  <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    {req}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 