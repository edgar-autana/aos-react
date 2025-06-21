import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, FileTextIcon, UploadIcon } from "lucide-react";
import FileUploadZone from "@/polymet/components/file-upload-zone";
import TechnicalAnalysisResult, {
  PartAnalysis,
} from "@/polymet/components/technical-analysis-result";
import MachinistChat from "@/polymet/components/machinist-chat";

export default function TechnicalAnalysisPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [activeResultTab, setActiveResultTab] = useState("analysis");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PartAnalysis | null>(
    null
  );

  const handleAnalyze = () => {
    if (!pdfFile || !cadFile) return;

    setIsAnalyzing(true);
    setActiveTab("results");

    // Simulate API call with timeout
    setTimeout(() => {
      setAnalysisResult({
        partName: "Hydraulic Valve Housing",
        partNumber: "HVH-2023-A42",
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
          "This hydraulic valve housing requires precision machining with tight tolerances. The part features complex internal channels and threaded connections that require 5-axis CNC machining capabilities. Special attention needed for the O-ring grooves to ensure proper sealing.",
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
              details: '1/4" ball nose end mill at 6000 RPM, 0.05mm step-over',
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
      setIsAnalyzing(false);
    }, 2000);
  };

  const canAnalyze = pdfFile && cadFile && !isAnalyzing;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Technical Analysis</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">2D Drawing</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  accept=".pdf"
                  label="Upload 2D PDF Drawing"
                  icon={<FileTextIcon className="h-6 w-6 text-primary" />}
                  onFileChange={setPdfFile}
                  file={pdfFile}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">3D Model</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  accept=".stp,.step,.stl,.obj"
                  label="Upload 3D CAD Model"
                  icon={<FileIcon className="h-6 w-6 text-primary" />}
                  onFileChange={setCadFile}
                  file={cadFile}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full sm:w-auto"
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Analyze Files
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Tabs
            value={activeResultTab}
            onValueChange={setActiveResultTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
              <TabsTrigger value="chat">Machinist Assistant</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              <TechnicalAnalysisResult
                analysis={analysisResult}
                isLoading={isAnalyzing}
              />
            </TabsContent>
            <TabsContent value="chat">
              <MachinistChat
                analysis={analysisResult}
                isLoading={isAnalyzing}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
