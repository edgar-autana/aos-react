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
import { SummaryCard } from "@/components/ui/summary-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useRfqWithCompany } from "@/hooks/rfq/useRfqs";
import { getRfqDisplayName, getRfqStatusColor, getRfqStatusText, formatRfqDate } from "@/utils/rfq/rfqUtils";
import { partNumberApi } from "@/services/part-number/partNumberApi";
import { globalQuotationApi } from "@/services/global-quotation/globalQuotationApi";
import { quotationApi } from "@/services/quotation/quotationApi";
import { formatCurrency } from "@/utils/numberUtils";
import RfqPnsTab from "@/polymet/components/rfq-pns-tab";
import RfqBidsTab from "@/polymet/components/rfq-bids-tab";
import RfqInfoTab from "@/polymet/components/rfq-info-tab";
import RfqGlobalQuotationsTab from "@/polymet/components/rfq-global-quotations-tab";

export default function RfqDetailsPage() {
  const { rfqId = "" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pns");
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    partNumbersCount: 0,
    quotesCreated: 0,
    purchaseOrders: 0,
    piecesQuoted: 0,
    quotedValue: "$0"
  });

  const { rfq, loading, error } = useRfqWithCompany(rfqId);

  // Fetch RFQ statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!rfqId) return;
      
      setStatsLoading(true);
      
      try {
        // Fetch Part Numbers count
        const partNumbersResponse = await partNumberApi.getByRfqId(rfqId);
        const partNumbers = partNumbersResponse.data || [];
        const partNumbersCount = partNumbers.length;
        
        // Fetch Global Quotations count
        const globalQuotationsResponse = await globalQuotationApi.getByRfqId(rfqId);
        const globalQuotations = globalQuotationsResponse.data || [];
        const quotesCreated = globalQuotations.length;
        
        // Calculate total pieces quoted and quoted value from part numbers
        let totalPiecesQuoted = 0;
        let totalQuotedValue = 0;
        
        for (const partNumber of partNumbers) {
          if (partNumber.estimated_anual_units) {
            totalPiecesQuoted += partNumber.estimated_anual_units;
          }
          
          // Get quotations for this part number to calculate total value
          const quotationsResponse = await quotationApi.getAll({ part_number_id: partNumber.id });
          const quotations = quotationsResponse.data || [];
          
          // Sum up the total prices from all quotations
          quotations.forEach(quotation => {
            if (quotation.total_price) {
              totalQuotedValue += quotation.total_price;
            }
          });
        }
        
        setStats({
          partNumbersCount,
          quotesCreated,
          purchaseOrders: 0, // TODO: Add when purchase orders API is available
          piecesQuoted: totalPiecesQuoted,
          quotedValue: formatCurrency(totalQuotedValue)
        });
      } catch (err) {
        // Failed to fetch statistics - will show 0 values
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [rfqId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Loading state
  if (loading) {
    return <PageLoading text="Loading RFQ details..." />;
  }

  // Error or not found state
  if (error || !rfq) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rfqs">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">RFQ Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">RFQ Not Found</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              {error || "The RFQ you're looking for doesn't exist or has been removed."}
            </CardDescription>
            <Button asChild>
              <Link to="/rfqs">Return to RFQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const company = rfq.company_info;

  return (
    <div className="container mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate(`/customers/${rfq.company}`)}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Company
      </Button>

      {/* RFQ header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border">
            {company?.image ? (
              <AvatarImage src={company.image} alt={company?.name || 'Company'} />
            ) : (
              <AvatarFallback className="text-xl">
                <FileTextIcon className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{getRfqDisplayName(rfq)}</h1>
            <Badge className={getRfqStatusColor(rfq.status)}>
              {getRfqStatusText(rfq.status)}
            </Badge>
            {rfq.priority && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                High Priority
              </Badge>
            )}
            <Badge
              variant={rfq.enabled ? "default" : "secondary"}
              className={
                rfq.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {rfq.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {company && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/customers/${rfq.company}`}
                  className="text-blue-600 hover:underline"
                >
                  {company.name}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Created {formatDate(rfq.created_at)}</span>
            </div>
            {rfq.due_date && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Due {formatRfqDate(rfq.due_date)}</span>
              </div>
            )}
            {rfq.assigned && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>Assigned: {rfq.assigned}</span>
              </div>
            )}
            {rfq.slug && (
              <div className="flex items-center gap-1">
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                <span>RFQ #{rfq.slug}</span>
              </div>
            )}
          </div>
          {rfq.description && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Description:</span> {rfq.description}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div onClick={() => setActiveTab("pns")} className="cursor-pointer">
          <SummaryCard 
            title="Part Numbers"
            value={statsLoading ? "..." : stats.partNumbersCount}
            isActive={activeTab === "pns"}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>}
          />
        </div>
        <div onClick={() => setActiveTab("global-quotations")} className="cursor-pointer">
          <SummaryCard 
            title="Quotes Created"
            value={statsLoading ? "..." : stats.quotesCreated}
            isActive={activeTab === "global-quotations"}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />
        </div>
        <SummaryCard 
          title="Purchase Orders"
          value={statsLoading ? "..." : stats.purchaseOrders}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>}
        />
        <SummaryCard 
          title="Pieces Quoted"
          value={statsLoading ? "..." : stats.piecesQuoted >= 1000 ? `${Math.round(stats.piecesQuoted / 1000)}K` : stats.piecesQuoted.toLocaleString()}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>}
        />
        <SummaryCard 
          title="Quoted Value"
          value={statsLoading ? "..." : stats.quotedValue}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="pns">PNs</TabsTrigger>
          <TabsTrigger value="bids">BIDs</TabsTrigger>
          <TabsTrigger value="global-quotations">Global Quotations</TabsTrigger>
          <TabsTrigger value="info">INFO</TabsTrigger>
        </TabsList>

        <TabsContent value="pns" className="space-y-6 mt-6">
          <RfqPnsTab rfqId={rfqId} companyId={rfq.company} />
        </TabsContent>

        <TabsContent value="bids" className="space-y-6 mt-6">
          <RfqBidsTab rfqId={rfqId} />
        </TabsContent>

        <TabsContent value="global-quotations" className="space-y-6 mt-6">
          <RfqGlobalQuotationsTab rfqId={rfqId} />
        </TabsContent>

        <TabsContent value="info" className="space-y-6 mt-6">
          <RfqInfoTab rfqId={rfqId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
