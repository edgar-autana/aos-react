import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

export default function PartNumberDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [rfqData, setRfqData] = useState<RFQWithCompany | null>(null);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);

  // Fetch part number by ID
  const { partNumber, loading: partLoading, error: partError } = usePartNumber(id);

  // Fetch RFQ data when part number is loaded
  useEffect(() => {
    const fetchRfqData = async () => {
      if (!partNumber?.rfq) return;

      setRfqLoading(true);
      setRfqError(null);

      try {
        // Import the rfqApi to get RFQ with company info
        const { rfqApi } = await import('@/services/rfq/rfqApi');
        const response = await rfqApi.getByIdWithCompany(partNumber.rfq);

        if (response.error) {
          setRfqError(response.error);
        } else {
          setRfqData(response.data);
        }
      } catch (error) {
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
      {rfqData && (
        <Button 
          variant="ghost" 
          className="pl-0 mb-2" 
          onClick={() => navigate(`/rfq/${rfqData.id}`)}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to RFQ
        </Button>
      )}

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Part Number Details</h1>
      </div>

      {/* Part Number Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
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
                    <UserIcon className="h-4 w-4" />
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={company.image || undefined} />
                        <AvatarFallback>
                          {company.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{company.name || "Unknown Company"}</span>
                    </div>
                  </div>
                )}
                
                {rfqData && (
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    <span>RFQ: {getRfqDisplayName(rfqData)}</span>
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
            
            <div className="flex gap-2">
              <Button variant="outline">Edit Part</Button>
              <Button variant="default">Generate Quote</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="quotes" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="quotes">QUOTES</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>
                Quotes and pricing information for this part number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package2Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No quotes available</p>
                <p className="text-sm">Quotes for this part number will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <PartNumberAnalysisForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 