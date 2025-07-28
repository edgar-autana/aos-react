import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Hash,
  Tag,
  Ruler,
  Gauge,
  Wrench,
  AlertTriangle
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
  // Extract critical tolerances (<0.01)
  const criticalTolerances = analysis.tolerances.filter(tol => {
    const numMatch = tol.toString().match(/[±]?(\d+\.?\d*)/);
    if (numMatch) {
      const value = parseFloat(numMatch[1]);
      return value < 0.01;
    }
    return false;
  });

  // Combine all manufacturing notes
  const manufacturingNotes = [
    ...analysis.special_requirements,
    ...analysis.secondary_processes.map(p => `${p.process}: ${p.details}`),
    ...(analysis.requires_deburring ? ['Deburring required'] : []),
    ...(analysis.requires_cleaning ? ['Cleaning required'] : []),
    ...(analysis.requires_engineering_review ? ['Engineering review required'] : []),
    ...(analysis.has_thread ? [`Threading: ${analysis.thread_spec}`] : [])
  ].filter(note => note && note.trim() !== '');

  return (
    <div className="space-y-4">
      {/* Prominent Header with Part Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analysis.part_name || 'Technical Drawing Analysis'}
              </h2>
              {analysis.part_number && (
                <p className="text-lg text-gray-600 dark:text-gray-400 font-mono">
                  #{analysis.part_number}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {analysis.material || 'Material not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {criticalTolerances.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 px-3 py-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Tolerances
            </Badge>
          )}
        </div>
      </div>

      {/* Critical Tolerances */}
      {criticalTolerances.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Gauge className="h-4 w-4" />
              Critical Tolerances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {criticalTolerances.map((tol, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {tol}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manufacturing Notes */}
      {manufacturingNotes.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Wrench className="h-4 w-4" />
              Manufacturing Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {manufacturingNotes.map((note, index) => (
                <div key={index} className="text-xs p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 