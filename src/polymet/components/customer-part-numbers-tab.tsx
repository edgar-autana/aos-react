import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/loading';
import { Input } from '@/components/ui/input';
import { 
  FileTextIcon, 
  PackageIcon, 
  CheckCircleIcon,
  AlertCircle,
  Loader2,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  FileImageIcon,
  SearchIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { quotationApi } from '@/services/quotation/quotationApi';
import { useGlobalQuotationMutations } from '@/hooks/global-quotation/useGlobalQuotations';
import { useGlobalQuoteSelection } from '@/hooks/global-quotation/useGlobalQuoteSelection';
import { PartNumber } from '@/types/part-number/partNumber';
import { QuotationWithDetails } from '@/types/quotation/quotation';
import { GlobalQuotationPayload } from '@/types/global-quotation/globalQuotation';
import { RFQ } from '@/types/rfq/rfq';
import { rfqApi } from '@/services/rfq/rfqApi';
import { Link } from 'react-router-dom';

interface CustomerPartNumbersTabProps {
  customerId: string;
}

export default function CustomerPartNumbersTab({ customerId }: CustomerPartNumbersTabProps) {
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

  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [filteredPartNumbers, setFilteredPartNumbers] = useState<PartNumber[]>([]);
  const [rfqsMap, setRfqsMap] = useState<Map<string, RFQ>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartNumber, setSelectedPartNumber] = useState<PartNumber | null>(null);
  const [quotations, setQuotations] = useState<QuotationWithDetails[]>([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCreateGlobalModalOpen, setIsCreateGlobalModalOpen] = useState(false);
  const [globalQuoteName, setGlobalQuoteName] = useState('');

  // Fetch part numbers for the customer
  React.useEffect(() => {
    const fetchPartNumbers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch part numbers and RFQs
        const [partNumbersResponse, rfqsResponse] = await Promise.all([
          partNumberApi.getByCompanyId(customerId),
          rfqApi.getByCompanyId(customerId)
        ]);
        
        if (partNumbersResponse.error) {
          setError(partNumbersResponse.error);
        } else if (rfqsResponse.error) {
          setError(rfqsResponse.error);
        } else {
          const partNumbers = partNumbersResponse.data || [];
          const rfqs = rfqsResponse.data || [];
          
          // Create RFQs map for quick lookup
          const rfqsMap = new Map<string, RFQ>();
          rfqs.forEach(rfq => {
            rfqsMap.set(rfq.id, rfq);
          });
          
          setPartNumbers(partNumbers);
          setFilteredPartNumbers(partNumbers);
          setRfqsMap(rfqsMap);
        }
      } catch (err) {
        setError('Failed to load part numbers');
      } finally {
        setLoading(false);
      }
    };

    fetchPartNumbers();
  }, [customerId]);

  // Filter part numbers based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPartNumbers(partNumbers);
      return;
    }

    const filtered = partNumbers.filter(partNumber => {
      const searchLower = searchTerm.toLowerCase();
      
      // Get RFQ name for this part number
      const rfq = partNumber.rfq ? rfqsMap.get(partNumber.rfq) : null;
      const rfqName = rfq?.name || rfq?.slug_name || '';
      
      return (
        (partNumber.part_name?.toLowerCase().includes(searchLower)) ||
        (partNumber.drawing_number?.toLowerCase().includes(searchLower)) ||
        (partNumber.slug_name?.toLowerCase().includes(searchLower)) ||
        (partNumber.name?.toLowerCase().includes(searchLower)) ||
        (rfqName.toLowerCase().includes(searchLower))
      );
    });

    setFilteredPartNumbers(filtered);
  }, [searchTerm, partNumbers, rfqsMap]);

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

  // Handle part number row click
  const handlePartNumberClick = async (partNumber: PartNumber) => {
    setSelectedPartNumber(partNumber);
    await fetchQuotations(partNumber.id);
    setIsQuoteModalOpen(true);
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
      // Create global quotation
      const globalQuotePayload: GlobalQuotationPayload = {
        company_id: customerId,
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

  // Get part number display name
  const getPartNumberDisplayName = (partNumber: PartNumber): string => {
    return partNumber.part_name || partNumber.slug_name || `PN-${partNumber.id.slice(-6)}`;
  };

  // Get RFQ name for a part number
  const getRfqName = (partNumber: PartNumber): string => {
    if (!partNumber.rfq) return '—';
    const rfq = rfqsMap.get(partNumber.rfq);
    return rfq?.name || rfq?.slug_name || `RFQ-${partNumber.rfq.slice(-6)}`;
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

  // Format number
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString();
  };

  // Check if part number has selected quotes
  const hasSelectedQuotes = (partNumberId: string): boolean => {
    return getSelectedQuotesForPartNumber(partNumberId).length > 0;
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading part numbers: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Part Numbers ({filteredPartNumbers.length})</h3>
          <p className="text-sm text-muted-foreground">
            Browse and manage part numbers for this customer
          </p>
        </div>
        {hasAnySelections() && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={clearAllSelections}
              disabled={mutationLoading}
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Clear Selections
            </Button>
            <Button 
              onClick={() => setIsCreateGlobalModalOpen(true)}
              disabled={mutationLoading}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Global Quote ({getTotalSelectedQuotes()})
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part name, number, or RFQ..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Part Numbers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading part numbers...</p>
            </div>
          ) : filteredPartNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No part numbers found matching your search' : 'No part numbers found'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms.' : 'This customer doesn\'t have any part numbers yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium" style={{width: '25%'}}>Part Name</th>
                    <th className="text-left p-2 font-medium" style={{width: '20%'}}>RFQ</th>
                    <th className="text-left p-2 font-medium" style={{width: '15%'}}>Part Number</th>
                    <th className="text-left p-2 font-medium" style={{width: '15%'}}>Process</th>
                    <th className="text-left p-2 font-medium" style={{width: '8%'}}>2D</th>
                    <th className="text-left p-2 font-medium" style={{width: '10%'}}>Selected</th>
                    <th className="text-left p-2 font-medium" style={{width: '7%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPartNumbers.map((partNumber) => (
                    <tr 
                      key={partNumber.id} 
                      className={`hover:bg-muted/50 cursor-pointer ${
                        hasSelectedQuotes(partNumber.id) ? 'bg-blue-50 hover:bg-blue-100' : ''
                      }`}
                      onClick={() => handlePartNumberClick(partNumber)}
                    >
                      <td className="p-2" style={{width: '25%'}}>
                        <div className="font-medium text-xs leading-tight break-words">{getPartNumberDisplayName(partNumber)}</div>
                      </td>
                      <td className="p-2" style={{width: '20%'}}>
                        <div className="font-medium text-xs leading-tight break-words">{getRfqName(partNumber)}</div>
                      </td>
                      <td className="p-2" style={{width: '15%'}}>
                        <div className="text-xs font-mono leading-tight break-words">
                          {partNumber.drawing_number || '—'}
                        </div>
                      </td>
                      <td className="p-2" style={{width: '15%'}}>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {partNumber.main_process || '—'}
                        </Badge>
                      </td>
                      <td className="p-2" style={{width: '8%'}}>
                        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                          {partNumber.part_drawing_2d ? (
                            <a
                              href={partNumber.part_drawing_2d}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <FileTextIcon className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2" style={{width: '10%'}}>
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {getSelectedQuotesForPartNumber(partNumber.id).length}
                          </span>
                        </div>
                      </td>
                      <td className="p-2" style={{width: '7%'}}>
                        <Link to={`/part-number/${partNumber.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
              <input
                type="text"
                value={globalQuoteName}
                onChange={(e) => setGlobalQuoteName(e.target.value)}
                placeholder="Enter global quotation name"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
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