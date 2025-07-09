import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TwoDAnalysisResult } from "../services/assistant-service";

interface TwoDAnalysisResultProps {
  analysis: TwoDAnalysisResult;
}

export default function TwoDAnalysisResult({ analysis }: TwoDAnalysisResultProps) {
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
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{analysis.partName}</CardTitle>
              <p className="text-muted-foreground">Part Number: {analysis.partNumber}</p>
            </div>
            <Badge className={getComplexityColor(analysis.complexity)}>
              {analysis.complexity} Complexity
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dimensions and Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimensions & Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{analysis.dimensions.height}</p>
                <p className="text-sm text-muted-foreground">Height ({analysis.dimensions.unit})</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{analysis.dimensions.width}</p>
                <p className="text-sm text-muted-foreground">Width ({analysis.dimensions.unit})</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{analysis.dimensions.length}</p>
                <p className="text-sm text-muted-foreground">Length ({analysis.dimensions.unit})</p>
              </div>
            </div>
            
            <Separator />
            
            {analysis.weight && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weight:</span>
                <span className="text-sm">{analysis.weight} {analysis.weightUnit}</span>
              </div>
            )}
            
            {analysis.rawMaterial && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Material:</span>
                <span className="text-sm">{analysis.rawMaterial}</span>
              </div>
            )}
            
            {analysis.surfaceFinish && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Surface Finish:</span>
                <span className="text-sm">{analysis.surfaceFinish}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tolerances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tolerances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">General Tolerance:</p>
              <p className="text-sm text-muted-foreground">{analysis.tolerances.general}</p>
            </div>
            
            {analysis.tolerances.critical.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Critical Tolerances:</p>
                <ul className="space-y-1">
                  {analysis.tolerances.critical.map((tolerance, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      {tolerance}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Machining Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm">{instruction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {analysis.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.notes.map((note, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <p className="text-sm">{note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 