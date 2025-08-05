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
import { PageLoading } from "@/components/ui/loading";
import { usePartNumber } from "@/hooks/part-number/usePartNumbers";
import { useRfqWithCompany } from "@/hooks/rfq/useRfqs";
import { PartNumber } from "@/types/part-number/partNumber";
import { RFQWithCompany } from "@/types/rfq/rfq";
import { getRfqDisplayName, getRfqStatusColor, getRfqStatusText, formatRfqDate } from "@/utils/rfq/rfqUtils";
import PartNumberAnalysisForm from "@/polymet/components/part-number-analysis-form";
import PartNumberQuotesTab from "@/polymet/components/part-number-quotes-tab";
import AIAnalysisModal from "@/polymet/components/ai-analysis-modal";

export default function PartNumberDetailsPage() {
  const { id = "" } = useParams();
  console.log('🔄 PartNumberDetailsPage rendering - id:', id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rfqData, setRfqData] = useState<RFQWithCompany | null>(null);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  // Get quotation ID from URL params for auto-opening edit modal
  const quotationId = searchParams.get('quotation');

  // Fetch part number by ID
  const { partNumber, loading: partLoading, error: partError, refetch: refetchPartNumber } = usePartNumber(id);
  
  // Memoize the refetch function to prevent unnecessary re-renders - DISABLED to prevent infinite loop
  // const memoizedRefetch = useCallback(() => {
  //   console.log('🔄 PartNumberDetailsPage memoizedRefetch called');
  //   refetchPartNumber();
  // }, [refetchPartNumber]);

  // Memoize the part number object to prevent unnecessary re-renders
  const memoizedPartNumber = useMemo(() => {
    console.log('🔄 PartNumberDetailsPage memoizedPartNumber recalculating - partNumber.id:', partNumber?.id);
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
        console.log('No RFQ found for part number:', partNumber);
        return;
      }

      console.log('Fetching RFQ data for RFQ ID:', partNumber.rfq);
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
          console.log('RFQ data loaded successfully:', response.data);
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
            console.log('Navigating to RFQ:', rfqData.id);
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
            console.log('Navigating to RFQ with fallback ID:', partNumber.rfq);
            navigate(`/rfqs/${partNumber.rfq}`);
          }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to RFQ
        </Button>
      ) : null}

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Part Number Details</h1>
      </div>

      {/* Part Number Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{getPartNumberDisplayName(partNumber)}</h2>
                {partNumber.main_process && (
                  <Badge className={getMainProcessColor(partNumber.main_process)}>
                    {partNumber.main_process}
                  </Badge>
                )}
              </div>
              
              {/* Part Number Details */}
              <div className="text-sm text-muted-foreground space-y-1">
                {partNumber.drawing_number && (
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    <span>Part Number: {partNumber.drawing_number}</span>
                  </div>
                )}
                {partNumber.estimated_anual_units && (
                  <div className="flex items-center gap-2">
                    <Package2Icon className="h-4 w-4" />
                    <span>EAU: {partNumber.estimated_anual_units.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Company and RFQ Information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-6 text-sm text-muted-foreground pt-2 border-t">
                {company && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={company.image || undefined} />
                        <AvatarFallback>
                          {company.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <Link 
                        to={`/customers/${company.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {company.name || "Unknown Company"}
                      </Link>
                    </div>
                  </div>
                )}
                
                {rfqData && (
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    <Link 
                      to={`/rfqs/${rfqData.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      RFQ: {getRfqDisplayName(rfqData)}
                    </Link>
                  </div>
                )}
                
                {partNumber.created_at_atos && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created: {formatDate(partNumber.created_at_atos)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Button */}
            <div className="flex flex-col gap-2 md:items-end">
              <Button
                onClick={() => {
                  console.log('🔄 PartNumberDetailsPage AI Analysis button clicked - setting showAIAnalysis to true');
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
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="quotes" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="quotes">QUOTES</TabsTrigger>
          <TabsTrigger value="analysis">DETAILS</TabsTrigger>
        </TabsList>

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

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <PartNumberAnalysisForm />
        </TabsContent>
      </Tabs>

      {/* AI Analysis Modal */}
      {memoizedPartNumber && (
        <AIAnalysisModal
          isOpen={showAIAnalysis}
          onClose={() => {
            console.log('🔄 PartNumberDetailsPage AI Analysis modal onClose called - setting showAIAnalysis to false');
            setShowAIAnalysis(false);
          }}
          partNumber={memoizedPartNumber}
        />
      )}
    </div>
  );
} 