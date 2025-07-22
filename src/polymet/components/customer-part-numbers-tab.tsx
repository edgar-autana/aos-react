import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileTextIcon, 
  PackageIcon, 
  CheckCircleIcon,
  AlertCircle,
  Loader2,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  FileImageIcon
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

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState<PartNumber | null>(null);
  const [quotations, setQuotations] = useState<QuotationWithDetails[]>([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCreateGlobalModalOpen, setIsCreateGlobalModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [pendingRfqId, setPendingRfqId] = useState<string>('');
  const [globalQuoteName, setGlobalQuoteName] = useState('');

  // Fetch RFQs for the customer
  React.useEffect(() => {
    const fetchRfqs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Import rfqApi to get RFQs by company
        const { rfqApi } = await import('@/services/rfq/rfqApi');
        const response = await rfqApi.getByCompanyId(customerId);
        
        if (response.error) {
          setError(response.error);
        } else {
          setRfqs(response.data || []);
        }
      } catch (err) {
        setError('Failed to load RFQs');
      } finally {
        setLoading(false);
      }
    };

    fetchRfqs();
  }, [customerId]);

  // Fetch part numbers when RFQ is selected
  React.useEffect(() => {
    const fetchPartNumbers = async () => {
      if (!selectedRfqId) {
        setPartNumbers([]);
        return;
      }

      setRfqLoading(true);
      setError(null);
      
      try {
        const response = await partNumberApi.getByRfqId(selectedRfqId);
        
        if (response.error) {
          setError(response.error);
        } else {
          setPartNumbers(response.data || []);
        }
      } catch (err) {
        setError('Failed to load part numbers for selected RFQ');
      } finally {
        setRfqLoading(false);
      }
    };

    fetchPartNumbers();
  }, [selectedRfqId]);

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

  // Handle RFQ selection
  const handleRfqSelection = (rfqId: string) => {
    if (hasAnySelections() && getTotalSelectedQuotes() > 0) {
      setPendingRfqId(rfqId);
      setIsWarningModalOpen(true);
      return;
    }
    setSelectedRfqId(rfqId);
  };

  // Handle warning modal accept
  const handleWarningAccept = () => {
    clearAllSelections();
    setSelectedRfqId(pendingRfqId);
    setPendingRfqId('');
    setIsWarningModalOpen(false);
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
          <h3 className="text-lg font-semibold">Part Numbers</h3>
          <p className="text-sm text-muted-foreground">
            Select an RFQ to view and manage part numbers and their quotations
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

      {/* RFQ Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select RFQ</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRfqId} onValueChange={handleRfqSelection}>
            <SelectTrigger {...{} as any}>
              <SelectValue placeholder="Choose an RFQ to view part numbers" />
            </SelectTrigger>
            <SelectContent {...{} as any}>
              {rfqs.map((rfq) => (
                <SelectItem key={rfq.id} value={rfq.id} {...{} as any}>
                  {rfq.name || `RFQ-${rfq.id.slice(-6)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Part Numbers</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partNumbers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Quotes</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalSelectedQuotes()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Part Numbers with Selections</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(quoteSelection).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Part Numbers Table */}
      {selectedRfqId && (
        <Card>
          <CardHeader>
            <CardTitle>Part Numbers ({partNumbers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rfqLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading part numbers...</p>
              </div>
            ) : partNumbers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No part numbers found</p>
                <p className="text-sm">This RFQ doesn't have any part numbers yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Part Name</th>
                      <th className="text-left p-4 font-medium">Part Number</th>
                      <th className="text-left p-4 font-medium">Process</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Documents</th>
                      <th className="text-left p-4 font-medium">EAU</th>
                      <th className="text-left p-4 font-medium">Piece Price</th>
                      <th className="text-left p-4 font-medium">Selection</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {partNumbers.map((partNumber) => (
                      <tr 
                        key={partNumber.id} 
                        className={`hover:bg-muted/50 cursor-pointer ${
                          hasSelectedQuotes(partNumber.id) ? 'bg-blue-50 hover:bg-blue-100' : ''
                        }`}
                        onClick={() => handlePartNumberClick(partNumber)}
                      >
                        <td className="p-4">
                          <div className="font-medium">{getPartNumberDisplayName(partNumber)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-mono">
                            {partNumber.drawing_number || '—'}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            {partNumber.main_process || '—'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getPartNumberStatusColor(partNumber.status)}>
                            {partNumber.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
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
                          <div className="flex items-center gap-2">
                            {hasSelectedQuotes(partNumber.id) && (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {getSelectedQuotesForPartNumber(partNumber.id).length} selected
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
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
      )}

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

      {/* Warning Modal for RFQ Change */}
      <Dialog open={isWarningModalOpen} onOpenChange={setIsWarningModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Change RFQ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have already selected quotes from another RFQ. Changing the RFQ will clear all your current selections.
            </p>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will remove {getTotalSelectedQuotes()} selected quotes from {Object.keys(quoteSelection).length} part numbers.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWarningModalOpen(false);
                setPendingRfqId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWarningAccept}
              variant="destructive"
            >
              Clear Selections & Change RFQ
            </Button>
          </DialogFooter>
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