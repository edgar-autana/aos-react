import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, FileTextIcon, BarChartIcon } from "lucide-react";
import StatusBadge from "@/polymet/components/status-badge";
import { PartNumber } from "@/polymet/data/rfqs-data";

interface PartNumberListItemProps {
  part: PartNumber;
  rfqId: string;
}

export default function PartNumberListItem({
  part,
  rfqId,
}: PartNumberListItemProps) {
  const hasAnalysis = !!part.technicalAnalysisId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">{part.name}</h3>
              <StatusBadge status={part.status} />
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {part.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">Quantity:</span> {part.quantity}
              </div>

              <div className="flex items-center gap-2">
                {part.files.drawingFile && (
                  <div className="flex items-center text-muted-foreground">
                    <FileTextIcon className="h-4 w-4 mr-1" />

                    <span>Drawing</span>
                  </div>
                )}

                {part.files.modelFile && (
                  <div className="flex items-center text-muted-foreground">
                    <FileIcon className="h-4 w-4 mr-1" />

                    <span>3D Model</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {hasAnalysis ? (
              <Button variant="default" asChild>
                <Link
                  to={`/rfqs/${rfqId}/parts/${part.id}/analysis`}
                  className="flex items-center"
                >
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  View Analysis
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link
                  to={`/rfqs/${rfqId}/parts/${part.id}/analyze`}
                  className="flex items-center"
                >
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  Analyze Part
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
