import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  CalendarIcon,
  FileTextIcon,
  UserIcon,
  Package2Icon,
  BrainIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageLoading } from "@/components/ui/loading";
import { usePartNumber } from "@/hooks/part-number/usePartNumbers";
import { useRfqWithCompany } from "@/hooks/rfq/useRfqs";
import { PartNumber } from "@/types/part-number/partNumber";
import { RFQWithCompany } from "@/types/rfq/rfq";
import { getRfqDisplayName, getRfqStatusColor, getRfqStatusText, formatRfqDate } from "@/utils/rfq/rfqUtils";
import PartNumberAnalysisForm from "@/polymet/components/part-number-analysis-form";
import PartNumberQuotesTab from "@/polymet/components/part-number-quotes-tab";
import AIAnalysisModal from "@/polymet/components/ai-analysis-modal";
import PDFViewerModal from "@/polymet/components/pdf-viewer/pdf-viewer-modal";
import ThreeDViewerModal from "@/polymet/components/3d-viewer-modal";

export default function PartNumberDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rfqData, setRfqData] = useState<RFQWithCompany | null>(null);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
  const [threeDViewerModalOpen, setThreeDViewerModalOpen] = useState(false);
  const [convertingToUrn, setConvertingToUrn] = useState(false);
  
  // Get quotation ID from URL params for auto-opening edit modal
  const quotationId = searchParams.get('quotation');

  // Fetch part number by ID
  const { partNumber, loading: partLoading, error: partError, refetch: refetchPartNumber } = usePartNumber(id);
  
  // Memoize the refetch function to prevent unnecessary re-renders - DISABLED to prevent infinite loop
  // const memoizedRefetch = useCallback(() => {
  //   refetchPartNumber();
  // }, [refetchPartNumber]);

  // Memoize the part number object to prevent unnecessary re-renders
  const memoizedPartNumber = useMemo(() => {
    if (!partNumber) return null;
    return {
      id: partNumber.id,
      part_drawing_2d: partNumber.part_drawing_2d,
      part_name: partNumber.part_name,
      drawing_number: partNumber.drawing_number
    };
  }, [partNumber?.id, partNumber?.part_drawing_2d, partNumber?.part_name, partNumber?.drawing_number]);

  // Fetch RFQ data when part number is loaded
  useEffect(() => {
    const fetchRfqData = async () => {
      if (!partNumber?.rfq) {
        return;
      }

      setRfqLoading(true);
      setRfqError(null);

      try {
        // Import the rfqApi to get RFQ with company info
        const { rfqApi } = await import('@/services/rfq/rfqApi');
        const response = await rfqApi.getByIdWithCompany(partNumber.rfq);

        if (response.error) {
          console.error('Error fetching RFQ:', response.error);
          setRfqError(response.error);
        } else {
          setRfqData(response.data);
        }
      } catch (error) {
        console.error('Exception fetching RFQ:', error);
        setRfqError('Failed to fetch RFQ information');
      } finally {
        setRfqLoading(false);
      }
    };

    fetchRfqData();
  }, [partNumber?.rfq]);

  // Get part number display name
  const getPartNumberDisplayName = (partNumber: PartNumber): string => {
    return partNumber.part_name || partNumber.slug_name || `PN-${partNumber.id.slice(-6)}`;
  };

  // Function to open PDF modal
  const openPdfModal = () => {
    if (partNumber?.part_drawing_2d) {
      setSelectedPdfUrl(partNumber.part_drawing_2d);
      setSelectedPdfTitle(`${getPartNumberDisplayName(partNumber)} - 2D Drawing`);
      setIsPdfViewerOpen(true);
    }
  };

  // Function to open 3D modal
  const open3DModal = () => {
    if (partNumber?.part_drawing_3d) {
      setThreeDViewerModalOpen(true);
    }
  };

  // Get part number status color
  const getPartNumberStatusColor = (status: string | null): string => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    const statusColors: { [key: string]: string } = {
      "pending": "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800", 
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800"
    };
    
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Get main process color
  const getMainProcessColor = (mainProcess: string | null): string => {
    if (!mainProcess) return "bg-gray-100 text-gray-800";
    
    const processColors: { [key: string]: string } = {
      "CNC": "bg-red-100 text-red-800",
      "MACHINING": "bg-blue-100 text-blue-800",
      "HPDC": "bg-green-100 text-green-800",
      "IM": "bg-cyan-100 text-cyan-800"
    };
    
    const process = mainProcess.toUpperCase();
    return processColors[process] || "bg-gray-100 text-gray-800";
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Loading state
  if (partLoading || rfqLoading) {
    return <PageLoading text="Loading part number details..." />;
  }

  // Error or not found state
  if (partError || !partNumber) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rfqs">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Part Number Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package2Icon className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">Part Number Not Found</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              {partError || "The part number you're looking for doesn't exist or has been removed."}
            </CardDescription>
            <Button asChild>
              <Link to="/rfqs">Return to RFQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const company = rfqData?.company_info;

  return (
    <div className="container mx-auto space-y-6">
      {/* Back button */}
      {rfqData ? (
        <Button 
          variant="ghost" 
          className="pl-0 mb-2" 
          onClick={() => {
            navigate(`/rfqs/${rfqData.id}`);
          }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to RFQ
        </Button>
      ) : partNumber?.rfq ? (
        <Button 
          variant="ghost" 
          className="pl-0 mb-2" 
          onClick={() => {
            navigate(`/rfqs/${partNumber.rfq}`);
          }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to RFQ
        </Button>
      ) : null}

      {/* Part Number header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border">
            {company?.image ? (
              <AvatarImage src={company.image} alt={company?.name || 'Company'} />
            ) : (
              <AvatarFallback className="text-xl">
                <Package2Icon className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{getPartNumberDisplayName(partNumber)}</h1>
            {partNumber.main_process && (
              <Badge className={getMainProcessColor(partNumber.main_process)}>
                {partNumber.main_process}
              </Badge>
            )}
            {partNumber.feasibility && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {partNumber.feasibility}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {company && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/customers/${company.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {company.name}
                </Link>
              </div>
            )}
            {rfqData && (
              <div className="flex items-center gap-1">
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/rfqs/${rfqData.id}`}
                  className="text-blue-600 hover:underline"
                >
                  RFQ: {getRfqDisplayName(rfqData)}
                </Link>
              </div>
            )}
            {partNumber.created_at_atos && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDate(partNumber.created_at_atos)}</span>
              </div>
            )}
            {partNumber.drawing_number && (
              <div className="flex items-center gap-1">
                <Package2Icon className="h-4 w-4 text-muted-foreground" />
                <span>PN #{partNumber.drawing_number}</span>
              </div>
            )}
            {partNumber.estimated_anual_units && (
              <div className="flex items-center gap-1">
                <Package2Icon className="h-4 w-4 text-muted-foreground" />
                <span>EAU: {partNumber.estimated_anual_units.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Analysis Button */}
        <div className="flex flex-col gap-2 items-center md:items-end">
          <Button
            onClick={() => {
              setShowAIAnalysis(true);
            }}
            disabled={!partNumber.part_drawing_2d}
            className={`gap-2 ${
              partNumber.part_drawing_2d 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition-all duration-200`}
            size="lg"
          >
            <BrainIcon className="h-5 w-5" />
            AI Analysis
          </Button>
          <p className={`text-xs text-center md:text-right ${
            partNumber.part_drawing_2d ? "text-muted-foreground" : "text-gray-400"
          }`}>
            {partNumber.part_drawing_2d 
              ? "Analyze technical drawing with AI" 
              : "Upload a 2D drawing to enable AI Analysis"
            }
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={`relative overflow-hidden transition-all duration-300 ${
                  partNumber.part_drawing_2d 
                    ? "hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600 cursor-pointer" 
                    : "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/30 cursor-not-allowed opacity-60"
                }`}
                onClick={() => {
                  if (partNumber.part_drawing_2d) {
                    openPdfModal();
                  }
                }}
              >
          <div className={`absolute inset-0 bg-gradient-to-tr to-transparent ${
            partNumber.part_drawing_2d ? "from-blue-500/10 via-cyan-500/5" : "from-gray-500/5 via-gray-500/3"
          }`} />
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${
            partNumber.part_drawing_2d ? "bg-blue-500/10" : "bg-gray-500/5"
          }`} />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              partNumber.part_drawing_2d ? "text-slate-300" : "text-slate-500"
            }`}>
              2D Drawing
            </CardTitle>
            <div className={partNumber.part_drawing_2d ? "text-slate-400" : "text-slate-600"}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="flex items-center justify-start">
              {partNumber.part_drawing_2d ? (
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              ) : (
                <span className="text-slate-400 text-xs">--</span>
              )}
            </div>
          </CardContent>
              </Card>
            </TooltipTrigger>
            {!partNumber.part_drawing_2d && (
              <TooltipContent>
                <p>Upload a 2D drawing to enable preview</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={`relative overflow-hidden transition-all duration-300 ${
                  partNumber.part_drawing_3d 
                    ? "hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600 cursor-pointer" 
                    : "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/30 cursor-not-allowed opacity-60"
                }`}
                onClick={() => {
                  if (partNumber.part_drawing_3d) {
                    open3DModal();
                  }
                }}
              >
          <div className={`absolute inset-0 bg-gradient-to-tr to-transparent ${
            partNumber.part_drawing_3d ? "from-blue-500/10 via-cyan-500/5" : "from-gray-500/5 via-gray-500/3"
          }`} />
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${
            partNumber.part_drawing_3d ? "bg-blue-500/10" : "bg-gray-500/5"
          }`} />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              partNumber.part_drawing_3d ? "text-slate-300" : "text-slate-500"
            }`}>
              3D Drawing
            </CardTitle>
            <div className={partNumber.part_drawing_3d ? "text-slate-400" : "text-slate-600"}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="flex items-center justify-start">
              {partNumber.part_drawing_3d ? (
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              ) : (
                <span className="text-slate-400 text-xs">--</span>
              )}
            </div>
          </CardContent>
              </Card>
            </TooltipTrigger>
            {!partNumber.part_drawing_3d && (
              <TooltipContent>
                <p>Upload a 3D model to enable preview</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-tr to-transparent from-blue-500/10 via-cyan-500/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-blue-500/10" />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              PN Value
            </CardTitle>
            <div className="text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              $ 227K
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-tr to-transparent from-blue-500/10 via-cyan-500/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-blue-500/10" />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Feasibility
            </CardTitle>
            <div className="text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {partNumber.feasibility || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-tr to-transparent from-blue-500/10 via-cyan-500/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-blue-500/10" />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Can't Do Reason
            </CardTitle>
            <div className="text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {partNumber.reason_feasibility || "--"}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-tr to-transparent from-blue-500/10 via-cyan-500/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-blue-500/10" />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              EAU
            </CardTitle>
            <div className="text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {partNumber.estimated_anual_units?.toLocaleString() || "--"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="details">DETAILS</TabsTrigger>
          <TabsTrigger value="quotes">QUOTES</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <PartNumberAnalysisForm onDataUpdate={() => {
            refetchPartNumber();
          }} />
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6 mt-6">
          <PartNumberQuotesTab 
            partNumberId={id} 
            partNumber={{
              id: partNumber.id,
              part_name: partNumber.part_name || 'Unknown Part',
              drawing_number: partNumber.drawing_number || 'Unknown',
              estimated_anual_units: partNumber.estimated_anual_units || undefined
            }}
            companyInfo={rfqData?.company_info ? {
              id: rfqData.company_info.id,
              name: rfqData.company_info.name,
              image: rfqData.company_info.image || undefined
            } : null}
            rfqInfo={rfqData ? {
              id: rfqData.id,
              name: rfqData.name || 'Unknown RFQ'
            } : null}
            initialQuotationId={quotationId}
          />
        </TabsContent>
      </Tabs>

      {/* AI Analysis Modal */}
      {memoizedPartNumber && (
        <AIAnalysisModal
          isOpen={showAIAnalysis}
          onClose={() => {
            setShowAIAnalysis(false);
          }}
          partNumber={memoizedPartNumber}
        />
      )}

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        open={isPdfViewerOpen}
        onOpenChange={setIsPdfViewerOpen}
        pdfUrl={selectedPdfUrl}
        title={selectedPdfTitle}
      />

      {/* 3D Viewer Modal */}
      <ThreeDViewerModal
        isOpen={threeDViewerModalOpen}
        onClose={() => setThreeDViewerModalOpen(false)}
        urn={partNumber?.urn || null}
        isLoading={convertingToUrn}
        conversionError={null}
      />
    </div>
  );
} 