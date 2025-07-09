import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import PriceEstimation, {
  PriceEstimationData,
} from "@/polymet/components/price-estimation";
import { Badge } from "@/components/ui/badge";

export interface TechnicalAnalysisResultProps {
  isLoading: boolean;
  analysis: PartAnalysis | null;
}

export interface PartAnalysis {
  partName: string;
  partNumber: string;
  dimensions: {
    height: number;
    width: number;
    length: number;
    unit: string;
  };
  weight: number;
  weightUnit: string;
  rawMaterial: string;
  instructions: string[];
  surfaceFinish: string;
  summary: string;
  complexity: "Low" | "Medium" | "High";
  recommendedMachine: {
    name: string;
    type: string;
    capabilities: string[];
  };
  cycleTime: {
    total: number;
    operations: {
      name: string;
      time: number;
      details: string;
    }[];
  };
  machiningStrategy: {
    approach: string;
    tooling: string[];
    fixturing: string;
    notes: string;
  };
  costEstimation?: {
    totalPrice: number;
    pricePerPiece: number;
    batchSize: number;
    breakdown: {
      machiningCosts: {
        hourlyRate: number;
        totalMachiningTime: number; // in minutes
        cost: number;
      };
      materialCosts: {
        pricePerUnit: number;
        unitsRequired: number;
        cost: number;
        materialType: string;
        unit: string;
      };
      toolingCosts: {
        name: string;
        cost: number;
        isSpecialty: boolean;
      }[];
      fixtureCosts: {
        name: string;
        cost: number;
        isCustom: boolean;
      }[];
      setupCosts: number;
      overheadCosts: number;
    };
    currency: string;
  };
  features: {
    holes: number;
    threads: number;
    pockets: number;
    fillets: number;
    chamfers: number;
  };
  recommendations: string[];
}

export default function TechnicalAnalysisResult({
  analysis,
  isLoading,
}: TechnicalAnalysisResultProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Technical Analysis</span>
            <div className="bg-muted text-xs px-2 py-1 rounded-md">
              Processing
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <span>📄</span>

            <AlertDescription>
              Upload both 2D PDF drawing and 3D CAD model to generate technical
              analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const {
    partName,
    partNumber,
    dimensions,
    weight,
    weightUnit,
    rawMaterial,
    instructions,
    surfaceFinish,
    summary,
    complexity,
    recommendedMachine,
    cycleTime,
    machiningStrategy,
    costEstimation,
    features,
    recommendations,
  } = analysis;

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
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
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{partNumber}</CardTitle>
              <p className="text-muted-foreground">Material: {rawMaterial}</p>
            </div>
            <div className={getComplexityColor(complexity) + " px-2 py-1 rounded-md text-sm"}>
              {complexity} Complexity
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">📏</span>
              Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{dimensions.length}</p>
                <p className="text-sm text-muted-foreground">Length ({dimensions.unit})</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dimensions.width}</p>
                <p className="text-sm text-muted-foreground">Width ({dimensions.unit})</p>
              </div>
            </div>
            
            {dimensions.height && (
              <>
                <Separator />
                <div className="text-center">
                  <p className="text-2xl font-bold">{dimensions.height}</p>
                  <p className="text-sm text-muted-foreground">Height ({dimensions.unit})</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">⚖️</span>
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weight:</span>
                <span className="text-sm">{weight} {weightUnit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estimated Time:</span>
                <span className="text-sm">{cycleTime.total} minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">🔧</span>
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold">{features.holes}</p>
              <p className="text-sm text-muted-foreground">Holes</p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold">{features.threads}</p>
              <p className="text-sm text-muted-foreground">Threads</p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold">{features.pockets}</p>
              <p className="text-sm text-muted-foreground">Pockets</p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold">{features.fillets}</p>
              <p className="text-sm text-muted-foreground">Fillets</p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold">{features.chamfers}</p>
              <p className="text-sm text-muted-foreground">Chamfers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">💡</span>
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-sm text-muted-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="specifications">
        <TabsList className="mb-4">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="machining">Machining Strategy</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="space-y-6">
          {/* Part Information */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Part Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span>📏</span>

                  <h4 className="text-sm font-medium">Dimensions</h4>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Length
                      </div>
                      <div className="font-medium">
                        {dimensions.length} mm
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Width
                      </div>
                      <div className="font-medium">{dimensions.width} mm</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Height
                      </div>
                      <div className="font-medium">
                        {dimensions.height} mm
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span>⚖️</span>

                  <h4 className="text-sm font-medium">Material</h4>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Type
                      </div>
                      <div className="font-medium">{rawMaterial}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Weight
                      </div>
                      <div className="font-medium">{weight} kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Specifications */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Recommended Machine
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="mb-2">
                <div className="text-xs text-muted-foreground">Machine</div>
                <div className="font-medium">{recommendedMachine.name}</div>
              </div>
              <div className="mb-2">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-medium">{recommendedMachine.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Capabilities
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {recommendedMachine.capabilities.map(
                    (capability, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {capability}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Time */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span>⏱️</span>

              <h3 className="text-sm font-medium text-muted-foreground">
                Estimated Cycle Time
              </h3>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Total Time:</span>
                <span className="text-sm font-bold">
                  {formatTime(cycleTime.total)}
                </span>
              </div>
              <Separator className="my-3" />

              <div className="space-y-3">
                {cycleTime.operations.map((operation, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{operation.name}:</span>
                      <span className="text-sm font-medium">
                        {formatTime(operation.time)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {operation.details}
                    </p>
                    {index < cycleTime.operations.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manufacturing Instructions */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Manufacturing Instructions
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <ul className="space-y-2">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 h-5 w-5 text-xs font-medium text-primary mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-3" />

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Surface Finish
                </div>
                <div className="text-sm">{surfaceFinish}</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Summary
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">{summary}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="machining" className="space-y-6">
          {/* Machining Approach */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Machining Approach
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">{machiningStrategy.approach}</p>
            </div>
          </div>

          {/* Tooling */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span>🔧</span>

              <h3 className="text-sm font-medium text-muted-foreground">
                Tooling
              </h3>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <ul className="space-y-2">
                {machiningStrategy.tooling.map((tool, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 h-5 w-5 text-xs font-medium text-primary mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fixturing */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span>🔩</span>

              <h3 className="text-sm font-medium text-muted-foreground">
                Fixturing
              </h3>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">{machiningStrategy.fixturing}</p>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Additional Notes
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">{machiningStrategy.notes}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {costEstimation ? (
            <PriceEstimation
              estimationData={costEstimation}
              isLoading={false}
            />
          ) : (
            <Alert>
              <span>📋</span>

              <AlertDescription>
                Cost estimation is not available for this part. Please contact
                our team for a custom quote.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
