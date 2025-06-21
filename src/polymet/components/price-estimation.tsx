import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSignIcon,
  ClockIcon,
  WrenchIcon,
  Settings2Icon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export interface PriceEstimationProps {
  isLoading: boolean;
  estimationData: PriceEstimationData | null;
}

export interface PriceEstimationData {
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
}

export default function PriceEstimation({
  estimationData,
  isLoading,
}: PriceEstimationProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cost Estimation</span>
            <Badge variant="outline" className="bg-muted">
              Processing
            </Badge>
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

  if (!estimationData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cost Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />

            <AlertDescription>
              Upload both 2D PDF drawing and 3D CAD model to generate cost
              estimation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { totalPrice, pricePerPiece, batchSize, breakdown, currency } =
    estimationData;

  // Calculate totals for specialty tools and custom fixtures
  const specialtyToolsCost = breakdown.toolingCosts
    .filter((tool) => tool.isSpecialty)
    .reduce((sum, tool) => sum + tool.cost, 0);

  const customFixturesCost = breakdown.fixtureCosts
    .filter((fixture) => fixture.isCustom)
    .reduce((sum, fixture) => sum + fixture.cost, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSignIcon className="h-5 w-5 mr-2 text-primary" />

            <span>Cost Estimation</span>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {formatCurrency(pricePerPiece)} per piece
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Price per piece:</span>
              <span className="text-lg font-bold">
                {formatCurrency(pricePerPiece)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Total for batch of {batchSize}:
              </span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Cost Breakdown
            </h3>

            {/* Machining Costs */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />

                <h4 className="text-sm font-medium">Machining Time</h4>
              </div>

              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Machine hourly rate:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(breakdown.machiningCosts.hourlyRate)}/hr
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Total machining time:</span>
                  <span className="text-sm font-medium">
                    {formatTime(breakdown.machiningCosts.totalMachiningTime)}
                  </span>
                </div>
                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Machining cost:</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(breakdown.machiningCosts.cost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Material Costs */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium">Material</h4>
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">
                    {breakdown.materialCosts.materialType} (
                    {breakdown.materialCosts.unit}):
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(breakdown.materialCosts.pricePerUnit)}/
                    {breakdown.materialCosts.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Quantity required:</span>
                  <span className="text-sm font-medium">
                    {breakdown.materialCosts.unitsRequired}{" "}
                    {breakdown.materialCosts.unit}
                  </span>
                </div>
                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Material cost:</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(breakdown.materialCosts.cost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Specialty Tools */}
            {specialtyToolsCost > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <WrenchIcon className="h-4 w-4 text-muted-foreground" />

                  <h4 className="text-sm font-medium">Specialty Tools</h4>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  {breakdown.toolingCosts
                    .filter((tool) => tool.isSpecialty)
                    .map((tool, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-1"
                      >
                        <span className="text-sm">{tool.name}:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(tool.cost)}
                        </span>
                      </div>
                    ))}
                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Specialty tools cost:
                    </span>
                    <span className="text-sm font-bold">
                      {formatCurrency(specialtyToolsCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Fixtures */}
            {customFixturesCost > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Settings2Icon className="h-4 w-4 text-muted-foreground" />

                  <h4 className="text-sm font-medium">Custom Fixtures</h4>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  {breakdown.fixtureCosts
                    .filter((fixture) => fixture.isCustom)
                    .map((fixture, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-1"
                      >
                        <span className="text-sm">{fixture.name}:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(fixture.cost)}
                        </span>
                      </div>
                    ))}
                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Custom fixtures cost:
                    </span>
                    <span className="text-sm font-bold">
                      {formatCurrency(customFixturesCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Costs */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Other Costs</h4>
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Setup cost:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(breakdown.setupCosts)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Overhead:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(breakdown.overheadCosts)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total Cost */}
          <div className="flex justify-between items-center">
            <span className="font-medium">Total cost per piece:</span>
            <span className="text-lg font-bold">
              {formatCurrency(pricePerPiece)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
