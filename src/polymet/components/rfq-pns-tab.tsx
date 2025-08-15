import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { TablePagination } from "@/components/ui/table-pagination";
import { TableLoading } from "@/components/ui/loading";
import { 
  FileTextIcon, 
  CalendarIcon, 
  EyeIcon, 
  PlusIcon, 
  UserIcon, 
  FileIcon, 
  DownloadIcon, 
  FileImageIcon,
  DollarSignIcon,
  CheckCircleIcon,
  AlertCircle,
  Loader2,
  Trash2Icon
} from "lucide-react";
import { usePartNumbersByRfqPaginated } from "@/hooks/part-number/usePartNumbers";
import { PartNumber } from "@/types/part-number/partNumber";
import { QuotationWithDetails } from '@/types/quotation/quotation';
import { GlobalQuotationPayload } from '@/types/global-quotation/globalQuotation';
import { formatNumber } from "@/utils/dateUtils";
import PartNumberCreateModal from "./part-number-create-modal";
import { useToast } from '@/hooks/use-toast';
import { quotationApi } from '@/services/quotation/quotationApi';
import { useGlobalQuotationMutations } from '@/hooks/global-quotation/useGlobalQuotations';
import { useGlobalQuoteSelection } from '@/hooks/global-quotation/useGlobalQuoteSelection';

interface RfqPnsTabProps {
  rfqId: string;
  companyId: string;
}

export default function RfqPnsTab({ rfqId, companyId }: RfqPnsTabProps) {
  const { toast } = useToast();
  const { createGlobalQuotation, addPartNumberToGlobalQuotation, loading: mutationLoading } = useGlobalQuotationMutations();
  const {
    quoteSelection,
    selectQuote,
    deselectQuote,
    clearAllSelections,
    isQuoteSelected,
    getSelectedQuotesForPartNumber,
    getTotalSelectedQuotes,
    hasAnySelections
  } = useGlobalQuoteSelection();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState<PartNumber | null>(null);
  const [quotations, setQuotations] = useState<QuotationWithDetails[]>([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCreateGlobalModalOpen, setIsCreateGlobalModalOpen] = useState(false);
  const [globalQuoteName, setGlobalQuoteName] = useState('');
  
  const {
    partNumbers,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    refetch
  } = usePartNumbersByRfqPaginated(rfqId);

  const getPartNumberDisplayName = (partNumber: PartNumber): string => {
    return partNumber.part_name || partNumber.slug_name || `PN-${partNumber.id.slice(-6)}`;
  };

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

  const handleCreateSuccess = () => {
    refetch();
  };

  // Fetch quotations for a part number
  const fetchQuotations = async (partNumberId: string) => {
    setQuotationLoading(true);
    try {
      const response = await quotationApi.getByPartNumberIdWithDetails(partNumberId);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setQuotations(response.data || []);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch quotations",
        variant: "destructive",
      });
    } finally {
      setQuotationLoading(false);
    }
  };

  // Handle quotation button click
  const handleQuotationClick = async (partNumber: PartNumber, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedPartNumber(partNumber);
    await fetchQuotations(partNumber.id);
    setIsQuoteModalOpen(true);
  };

  // Handle quote selection
  const handleQuoteSelection = (quotationId: string) => {
    if (!selectedPartNumber) return;

    if (isQuoteSelected(selectedPartNumber.id, quotationId)) {
      deselectQuote(selectedPartNumber.id, quotationId);
    } else {
      selectQuote(selectedPartNumber.id, quotationId);
    }
  };

  // Handle create global quotation
  const handleCreateGlobalQuotation = async () => {
    if (!globalQuoteName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the global quotation",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create global quotation with RFQ relationship
      const globalQuotePayload: GlobalQuotationPayload = {
        company_id: companyId,
        rfq: rfqId, // Add RFQ relationship
        name: globalQuoteName,
        status: 'draft'
      };

      const response = await createGlobalQuotation(globalQuotePayload);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      if (response.data) {
        // Add selected part numbers to the global quotation
        const addPromises = Object.entries(quoteSelection).map(([partNumberId, quotationIds]) => {
          return (quotationIds as string[]).map(quotationId => 
            addPartNumberToGlobalQuotation(response.data!.id, partNumberId, quotationId)
          );
        }).flat();

        await Promise.all(addPromises);

        toast({
          title: "Success",
          description: `Global quotation "${globalQuoteName}" created successfully with ${getTotalSelectedQuotes()} selected quotes.`,
        });

        // Clear selections and close modal
        clearAllSelections();
        setGlobalQuoteName('');
        setIsCreateGlobalModalOpen(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create global quotation",
        variant: "destructive",
      });
    }
  };

  // Check if part number has selected quotes
  const hasSelectedQuotes = (partNumberId: string): boolean => {
    return getSelectedQuotesForPartNumber(partNumberId).length > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Part Numbers ({totalItems})</CardTitle>
            <div className="flex gap-2">
              {hasAnySelections() && (
                <>
                  <Button 
                    variant="outline"
                    onClick={clearAllSelections}
                    disabled={mutationLoading}
                    size="sm"
                  >
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Clear ({getTotalSelectedQuotes()})
                  </Button>
                  <Button 
                    onClick={() => setIsCreateGlobalModalOpen(true)}
                    disabled={mutationLoading}
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Global Quote
                  </Button>
                </>
              )}
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Part Number
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="text-center py-4 text-red-500">
              Error loading part numbers: {error}
            </div>
          )}
          
          {loading ? (
            <TableLoading />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Drawing Number</th>
                      <th className="text-left p-4 font-medium">Process</th>
                      <th className="text-left p-4 font-medium">Feasibility</th>
                      <th className="text-left p-4 font-medium">Documents</th>
                      <th className="text-left p-4 font-medium">EAU</th>
                      <th className="text-left p-4 font-medium">Piece Price</th>
                      <th className="text-left p-4 font-medium">Quote</th>
                      <th className="text-left p-4 font-medium">Selected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {partNumbers.length > 0 ? (
                      partNumbers.map((partNumber: PartNumber) => (
                        <tr 
                          key={partNumber.id} 
                          className={`hover:bg-muted/50 ${
                            hasSelectedQuotes(partNumber.id) ? 'bg-blue-50 hover:bg-blue-100' : ''
                          }`}
                        >
                          <td className="p-4">
                            <Link to={`/part-number/${partNumber.id}`} className="font-medium hover:text-primary transition-colors">
                              {getPartNumberDisplayName(partNumber)}
                            </Link>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-mono">
                              {partNumber.drawing_number || '—'}
                            </div>
                          </td>
                         
                          <td className="p-4">
                            <Badge className={getMainProcessColor(partNumber.main_process)}>
                              {partNumber.main_process}
                            </Badge>
                          </td>
                         
                          <td className="p-4">
                            <div className="text-sm">
                            {(partNumber?.feasibility || '—')}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              {partNumber.part_drawing_2d && (
                                <a
                                  href={partNumber.part_drawing_2d}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <FileTextIcon className="h-3 w-3" />
                                  2D Drawing
                                </a>
                              )}
                              {partNumber.part_drawing_3d && (
                                <a
                                  href={partNumber.part_drawing_3d}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <FileImageIcon className="h-3 w-3" />
                                  3D Model
                                </a>
                              )}
                              {!partNumber.part_drawing_2d && !partNumber.part_drawing_3d && (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {formatNumber(partNumber.estimated_anual_units)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {formatNumber(partNumber.piece_price)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleQuotationClick(partNumber, e)}
                              className="h-8 w-8 p-0"
                              title="View quotations"
                            >
                              <DollarSignIcon className="h-4 w-4" />
                            </Button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {getSelectedQuotesForPartNumber(partNumber.id).length}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <div className="mb-4">
                              <FileTextIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                            </div>
                            <p className="text-lg font-medium">No Part Numbers found</p>
                            <p className="text-sm">This RFQ doesn't have any part numbers yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalItems > 0 && (
                <div className="p-4 border-t">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Part Number Create Modal */}
      <PartNumberCreateModal
        rfqId={rfqId}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Quote Selection Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPartNumber && `Quotations for ${getPartNumberDisplayName(selectedPartNumber)}`}
            </DialogTitle>
          </DialogHeader>

          {quotationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading quotations...</span>
            </div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No quotations found</p>
              <p className="text-sm">This part number doesn't have any quotations yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className={`p-4 border rounded-lg ${
                    isQuoteSelected(selectedPartNumber?.id || '', quotation.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isQuoteSelected(selectedPartNumber?.id || '', quotation.id)}
                        onCheckedChange={() => handleQuoteSelection(quotation.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            Version {quotation.version_number}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {quotation.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quotation.supplier?.name} • ${quotation.unit_price || 0}/unit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Global Quotation Modal */}
      <Dialog open={isCreateGlobalModalOpen} onOpenChange={setIsCreateGlobalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Global Quotation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Global Quotation Name</label>
              <Input
                type="text"
                value={globalQuoteName}
                onChange={(e) => setGlobalQuoteName(e.target.value)}
                placeholder="Enter global quotation name"
                className="w-full mt-1"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will create a global quotation with {getTotalSelectedQuotes()} selected quotes from {Object.keys(quoteSelection).length} part numbers.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateGlobalModalOpen(false)}
              disabled={mutationLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGlobalQuotation}
              disabled={mutationLoading || !globalQuoteName.trim()}
            >
              {mutationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusIcon className="h-4 w-4 mr-2" />
              )}
              Create Global Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 