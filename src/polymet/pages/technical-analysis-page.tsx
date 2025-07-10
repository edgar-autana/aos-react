import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, FileTextIcon, UploadIcon, SearchIcon } from "lucide-react";
import S3UploadZone from "@/polymet/components/s3-upload-zone";
import TechnicalAnalysisResult, {
  PartAnalysis,
} from "@/polymet/components/technical-analysis-result";
import MachinistChat from "@/polymet/components/machinist-chat";
import AssistantAnalysisResult from "@/polymet/components/assistant-analysis-result";
import ThreeDAnalysisResult from "@/polymet/components/three-d-analysis-result";
import { OCRService } from "@/polymet/services/ocr-service";
import { AssistantService } from "@/polymet/services/assistant-service";
import { ThreeDAnalysisService } from "@/polymet/services/three-d-analysis-service";

export default function TechnicalAnalysisPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [activeResultTab, setActiveResultTab] = useState("analysis");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [cadFileUrl, setCadFileUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PartAnalysis | null>(
    null
  );
  const [assistantResult, setAssistantResult] = useState<any | null>(null);
  
  // 3D Analysis state
  const [is3DAnalyzing, setIs3DAnalyzing] = useState(false);
  const [threeDResult, setThreeDResult] = useState<any | null>(null);

  const handleOcrAnalysis = async () => {
    if (!pdfFileUrl) return;
    
    setIsAnalyzing(true);
    setAssistantResult(null);
    
    try {
      // Step 1: Use the existing OCR service
      const result = await OCRService.extractText(pdfFileUrl);
      
      // Step 2: If OCR was successful, send to assistant
              if (result.success && result.text) {
          try {
            const assistantData = await AssistantService.analyzeDrawing(result.text, pdfFileUrl);
            setAssistantResult(assistantData);
          } catch (assistantError) {
          console.error('Assistant error:', assistantError);
          setAssistantResult({ 
            success: false, 
            error: assistantError instanceof Error ? assistantError.message : 'Assistant analysis failed' 
          });
        }
      } else {
        setAssistantResult({ 
          success: false, 
          error: result.error || 'OCR failed to extract text' 
        });
      }
    } catch (error) {
      console.error('OCR error:', error);
      setAssistantResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'OCR failed' 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handle3DAnalysis = async () => {
    if (!cadFileUrl) return;
    
    setIs3DAnalyzing(true);
    setThreeDResult(null);
    
    try {
      const result = await ThreeDAnalysisService.analyzeModel(cadFileUrl);
      setThreeDResult(result);
    } catch (error) {
      console.error('3D Analysis error:', error);
      setThreeDResult({ 
        success: false, 
        error: error instanceof Error ? error.message : '3D analysis failed' 
      });
    } finally {
      setIs3DAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (!pdfFileUrl || !cadFileUrl) return;

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
          unit: "mm",
        },
        weight: 0.85,
        weightUnit: "kg",
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
        features: {
          holes: 4,
          threads: 2,
          pockets: 1,
          fillets: 8,
          chamfers: 12,
        },
        recommendations: [
          "Use high-speed machining for improved surface finish",
          "Consider using coolant for better chip evacuation",
          "Implement probing for critical dimensions",
          "Use thread milling for precise thread creation",
        ],
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const canAnalyze = pdfFileUrl && cadFileUrl && !isAnalyzing;

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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="upload">Technical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">2D Drawing & OCR Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <S3UploadZone
                  accept=".pdf"
                  label="Upload 2D PDF Drawing"
                  description="Upload PDF technical drawings for analysis"
                  icon={<FileTextIcon className="h-6 w-6 text-primary" />}
                  onFileChange={setPdfFile}
                  onUploadComplete={setPdfFileUrl}
                  file={pdfFile}
                  maxSize={15}
                />
                
                {/* Analysis Button - appears after file upload */}
                {pdfFileUrl && !isAnalyzing && !assistantResult && (
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <SearchIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Ready for Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Extract text and analyze your technical drawing
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleOcrAnalysis}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Start Analysis
                    </Button>
                  </div>
                )}
                
                {/* Analysis Processing */}
                {isAnalyzing && (
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium text-sm">Analyzing Drawing...</p>
                        <p className="text-xs text-muted-foreground">
                          Extracting text and analyzing with AI assistant
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">3D Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <S3UploadZone
                  accept=".stp,.step,.stl,.obj,.iges,.igs,.x_t,.x_b"
                  label="Upload 3D CAD Model"
                  description="Upload 3D CAD models for analysis"
                  icon={<FileIcon className="h-6 w-6 text-primary" />}
                  onFileChange={setCadFile}
                  onUploadComplete={setCadFileUrl}
                  file={cadFile}
                  maxSize={50}
                />
                
                {/* 3D Analysis Button - appears after file upload */}
                {cadFileUrl && !is3DAnalyzing && !threeDResult && (
                  <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Ready for 3D Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Analyze geometry and properties of your 3D model
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handle3DAnalysis}
                      disabled={is3DAnalyzing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FileIcon className="mr-2 h-4 w-4" />
                      Start 3D Analysis
                    </Button>
                  </div>
                )}
                
                {/* 3D Analysis Processing */}
                {is3DAnalyzing && (
                  <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <div>
                        <p className="font-medium text-sm">Analyzing 3D Model...</p>
                        <p className="text-xs text-muted-foreground">
                          Processing geometry and calculating properties
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                

              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          {(assistantResult || threeDResult) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Analysis Results</CardTitle>
                <Button
                  onClick={() => {
                    setAssistantResult(null);
                    setThreeDResult(null);
                    setPdfFile(null);
                    setPdfFileUrl(null);
                    setCadFile(null);
                    setCadFileUrl(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Restart Analysis
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2D Analysis Results */}
                {assistantResult && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">2D Drawing Analysis</h3>
                    {assistantResult.success ? (
                      <AssistantAnalysisResult analysis={assistantResult.analysis} />
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-red-600 text-lg font-medium">
                          Analysis Failed
                        </div>
                        <div className="text-muted-foreground">
                          {assistantResult.error || 'An error occurred during analysis'}
                        </div>
                        <Button
                          onClick={() => setAssistantResult(null)}
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3D Analysis Results */}
                {threeDResult && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">3D Model Analysis</h3>
                    {!threeDResult.success || threeDResult.error ? (
                      <div className="text-center space-y-4">
                        <div className="text-red-600 text-lg font-medium">
                          Analysis Failed
                        </div>
                        <div className="text-muted-foreground">
                          {threeDResult.error || 'An error occurred during analysis'}
                        </div>
                        <Button
                          onClick={() => setThreeDResult(null)}
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <ThreeDAnalysisResult analysis={threeDResult.analysis} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Uploaded Files Summary */}
          {(pdfFileUrl || cadFileUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pdfFileUrl && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileTextIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">2D Drawing (PDF)</p>
                        <p className="text-xs text-muted-foreground">Successfully uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(pdfFileUrl)}
                        className="h-8 px-3 text-xs"
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-3 text-xs"
                      >
                        <a href={pdfFileUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
                
                {cadFileUrl && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">3D Model (CAD)</p>
                        <p className="text-xs text-muted-foreground">Successfully uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(cadFileUrl)}
                        className="h-8 px-3 text-xs"
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-3 text-xs"
                      >
                        <a href={cadFileUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}



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
      </Tabs>
    </div>
  );
}
