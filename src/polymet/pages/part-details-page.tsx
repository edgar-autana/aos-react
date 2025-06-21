import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  BarChartIcon,
  FileTextIcon,
  FileIcon,
  MessageSquareIcon,
} from "lucide-react";
import { FilePreviewTabs } from "@/polymet/components/file-preview";
import TechnicalAnalysisResult from "@/polymet/components/technical-analysis-result";
import MachinistChat from "@/polymet/components/machinist-chat";
import StatusBadge from "@/polymet/components/status-badge";
import { getRfqById, getPartNumberById } from "@/polymet/data/rfqs-data";

export default function PartDetailsPage() {
  const { rfqId = "", partId = "" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("files");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const rfq = getRfqById(rfqId);
  const part = rfq ? getPartNumberById(rfqId, partId) : undefined;

  // Simulate loading technical analysis data
  useEffect(() => {
    if (part?.technicalAnalysisId) {
      setIsAnalysisLoading(true);
      // Simulate API call to fetch analysis data
      const timer = setTimeout(() => {
        setAnalysisData({
          partName: part.name,
          partNumber: "PN-" + Math.floor(Math.random() * 10000),
          dimensions: {
            height: 45.5,
            width: 78.2,
            length: 120.3,
          },
          weight: 0.85,
          rawMaterial: "Aluminum 6061-T6",
          instructions: [
            "Machine all surfaces to a tolerance of ±0.05mm",
            "Drill 4 mounting holes at specified locations",
            "Thread internal channels with M8x1.25 threads",
            "Chamfer all external edges at 0.5mm x 45°",
          ],

          surfaceFinish: "Ra 1.6 μm",
          summary:
            "This part requires precision machining with tight tolerances. The part features complex internal channels and threaded connections that require 5-axis CNC machining capabilities. Special attention needed for the O-ring grooves to ensure proper sealing.",
          complexity: "Medium",
          recommendedMachine: {
            name: "DMG MORI DMU 50",
            type: "5-Axis CNC Milling Machine",
            capabilities: [
              "5-Axis Simultaneous",
              "High-Speed Machining",
              "Rigid Tapping",
              "Probing",
            ],
          },
          cycleTime: {
            total: 78.5,
            operations: [
              {
                name: "Setup & Fixturing",
                time: 12.0,
                details:
                  "Custom fixture with hydraulic clamps to minimize distortion",
              },
              {
                name: "Roughing Operations",
                time: 25.5,
                details: '3/8" carbide end mill at 4500 RPM, 0.2mm step-down',
              },
              {
                name: "Finishing Operations",
                time: 18.0,
                details:
                  '1/4" ball nose end mill at 6000 RPM, 0.05mm step-over',
              },
              {
                name: "Drilling & Threading",
                time: 15.0,
                details:
                  "Carbide drill bits followed by thread mills for M8x1.25 threads",
              },
              {
                name: "Final Inspection",
                time: 8.0,
                details: "On-machine probing for critical dimensions",
              },
            ],
          },
          machiningStrategy: {
            approach:
              "3+2 positioning with continuous 5-axis for complex surfaces. Two setups required to access all features.",
            tooling: [
              '3/8" Carbide Square End Mill for roughing',
              '1/4" Carbide Ball Nose End Mill for finishing',
              "6mm Carbide Drill Bit for mounting holes",
              "M8x1.25 Thread Mill for internal threads",
              "45° Chamfer Tool for edge breaking",
            ],

            fixturing:
              "Custom aluminum fixture plate with hydraulic clamps and locating pins",
            notes:
              "Coolant pressure should be maintained at 70 PSI minimum to ensure chip evacuation from deep pockets",
          },
          costEstimation: {
            totalPrice: 4250.0,
            pricePerPiece: 85.0,
            batchSize: 50,
            breakdown: {
              machiningCosts: {
                hourlyRate: 75.0,
                totalMachiningTime: 78.5, // in minutes
                cost: 98.13,
              },
              materialCosts: {
                pricePerUnit: 12.5,
                unitsRequired: 1.2,
                cost: 15.0,
                materialType: "Aluminum 6061-T6",
                unit: "kg",
              },
              toolingCosts: [
                {
                  name: "Standard End Mill",
                  cost: 0.0,
                  isSpecialty: false,
                },
                {
                  name: "PVD Coated Face Mill",
                  cost: 3.75,
                  isSpecialty: true,
                },
                {
                  name: "Custom Profile Cutter",
                  cost: 8.5,
                  isSpecialty: true,
                },
              ],

              fixtureCosts: [
                {
                  name: "Standard Vise",
                  cost: 0.0,
                  isCustom: false,
                },
                {
                  name: "Custom Fixture Plate",
                  cost: 12.5,
                  isCustom: true,
                },
              ],

              setupCosts: 10.0,
              overheadCosts: 15.87,
            },
            currency: "USD",
          },
        });
        setIsAnalysisLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [part]);

  if (!rfq || !part) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rfqs")}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Part Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />

            <CardTitle className="text-xl mb-2">Part Not Found</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              The part you're looking for doesn't exist or has been removed.
            </CardDescription>
            <Button asChild>
              <Link to={`/rfqs/${rfqId}`}>Return to RFQ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create file URLs based on file names
  const pdfUrl = part.files.drawingFile
    ? `/api/files/${part.files.drawingFile}`
    : undefined;
  const cadUrl = part.files.modelFile
    ? `/api/files/${part.files.modelFile}`
    : undefined;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/rfqs/${rfqId}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Part Details</h1>
      </div>

      {/* Part Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{part.name}</h2>
                <StatusBadge status={part.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {part.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Quantity:</span> {part.quantity}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">RFQ:</span> {rfq.name}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!part.technicalAnalysisId && (
                <Button variant="outline" asChild>
                  <Link to={`/rfqs/${rfqId}/parts/${partId}/analyze`}>
                    <BarChartIcon className="mr-2 h-4 w-4" />
                    Analyze Part
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="files">
            <FileTextIcon className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!part.technicalAnalysisId}>
            <BarChartIcon className="h-4 w-4 mr-2" />
            Technical Analysis
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!part.technicalAnalysisId}>
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Machinist Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <FilePreviewTabs
            pdfUrl={pdfUrl}
            pdfName={part.files.drawingFile}
            cadUrl={cadUrl}
            cadName={part.files.modelFile}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <TechnicalAnalysisResult
            analysis={analysisData}
            isLoading={isAnalysisLoading}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <MachinistChat
            analysis={analysisData}
            isLoading={isAnalysisLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
