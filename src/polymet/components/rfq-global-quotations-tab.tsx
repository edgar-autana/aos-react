import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoading } from '@/components/ui/loading';
import { 
  FileTextIcon, 
  PackageIcon, 
  CalendarIcon,
  DollarSignIcon,
  EyeIcon,
  ExternalLinkIcon,
  BuildingIcon,
  FileDownIcon
} from 'lucide-react';
import { useGlobalQuotationsByRfq } from '@/hooks/global-quotation/useGlobalQuotations';
import { GlobalQuotation } from '@/types/global-quotation/globalQuotation';
import { GlobalQuotationWithDetails } from '@/types/global-quotation/globalQuotation';
import { formatNumber, formatCurrency } from '@/utils/numberUtils';
import CreateGlobalQuotationModal from './create-global-quotation-modal';
import PDFViewerModal from './pdf-viewer/pdf-viewer-modal';
import { useToast } from '@/components/ui/use-toast';

interface RfqGlobalQuotationsTabProps {
  rfqId: string;
}

export default function RfqGlobalQuotationsTab({ rfqId }: RfqGlobalQuotationsTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { globalQuotations, loading, error, refetch } = useGlobalQuotationsByRfq(rfqId);
  const [selectedGlobalQuotation, setSelectedGlobalQuotation] = useState<GlobalQuotationWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentPdfTitle, setCurrentPdfTitle] = useState<string>('');

  // Get status color
  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle view global quotation details
  const handleViewDetails = async (globalQuotation: GlobalQuotation) => {
    try {
      const { globalQuotationApi } = await import('@/services/global-quotation/globalQuotationApi');
      const response = await globalQuotationApi.getByIdWithDetails(globalQuotation.id);
      
      if (response.error) {
        return;
      }
      
      setSelectedGlobalQuotation(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      // Error handling
    }
  };

  // Handle navigate to part number with quotation edit
  const handleNavigateToPartNumber = (partNumberId: string, quotationId?: string) => {
    let url = `/part-number/${partNumberId}`;
    if (quotationId) {
      url += `?quotation=${quotationId}`;
    }
    window.open(url, '_blank');
  };

  // Handle PDF generation or viewing
  const handlePDFAction = async (globalQuotation: GlobalQuotation) => {
    // If PDF URL already exists, open the modal directly
    if (globalQuotation.pdf_url) {
      setCurrentPdfUrl(globalQuotation.pdf_url);
      setCurrentPdfTitle(`Global Quotation: ${globalQuotation.name}`);
      setIsPdfModalOpen(true);
      return;
    }

    // If no PDF URL exists, generate PDF first
    try {
      setGeneratingPdfId(globalQuotation.id);
      setCurrentPdfTitle(`Global Quotation: ${globalQuotation.name}`);
      setCurrentPdfUrl(null);
      setIsPdfModalOpen(true); // Open modal in loading state
      
      // First get the full details
      const { globalQuotationApi } = await import('@/services/global-quotation/globalQuotationApi');
      const detailsResponse = await globalQuotationApi.getByIdWithDetails(globalQuotation.id);
      
      if (detailsResponse.error || !detailsResponse.data) {
        throw new Error(detailsResponse.error || 'Failed to fetch quotation details');
      }

      const globalQuotationDetails = detailsResponse.data;

      // Debug: Log the full structure
      console.log('🔍 Full globalQuotationDetails:', globalQuotationDetails);
      console.log('🔍 part_numbers structure:', globalQuotationDetails.part_numbers);

      // Prepare data for PDF generation
      const pdfData = {
        // Customer Info
        customer_name: 'Contact Person',
        company_name: globalQuotationDetails.company?.name || '',
        company_phone: 'Phone not available',
        company_address: 'Address not available',
        
        // Quote Info
        quote_number: globalQuotationDetails.quote_number || globalQuotation.name,
        opp_name: globalQuotationDetails.rfq_info?.name || 'RFQ',
        quote_date: new Date(globalQuotationDetails.created_at).toLocaleDateString(),
        prepared_by: globalQuotationDetails.created_by || 'AUTANA',
        exchange_rate: '19.50',
        
        // Quotations array - use the part_numbers structure from the query
        quotations: (globalQuotationDetails.part_numbers || [])?.map((item, index) => {
          // Debug logging
          console.log('🔍 Item Data:', {
            partNumber: item.part_number?.drawing_number,
            partName: item.part_number?.part_name,
            mainProcess: item.part_number?.main_process,
            quotationMoq1: item.quotation?.moq1,
            quotationCncFixtures: item.quotation?.cnc_fixtures,
            unitPrice: item.quotation?.unit_price
          });
          
          // Get values directly from database fields
          const cncFixturesValue = item.quotation?.cnc_fixtures || 0;
          const moqValue = item.quotation?.moq1 || 0;
          
          // For freight, we'll extract from notes since there's no specific field yet
          const freightMatch = item.quotation?.notes?.match(/Freight: ([\d.]+)/);
          const freightValue = freightMatch ? parseFloat(freightMatch[1]) : 0;
          
          console.log('📋 Final Values:', {
            cncFixturesValue,
            freightValue,
            moqValue
          });
          
          return {
            index_quotation: index + 1,
            part_number: item.part_number?.drawing_number || 'N/A',
            part_name: item.part_number?.part_name || 'Unknown Part',
            main_process_name: item.part_number?.main_process || 'N/A',
            estimated_anual_units: item.part_number?.estimated_anual_units || 0,
            moq_1: moqValue,
            total_cost_per_pieces_formatted: `$${(item.quotation?.unit_price || 0).toFixed(2)}`,
            freight_per_piece_formatted: `$${freightValue.toFixed(2)}`,
            total_piece_price_ddp_formated: `$${((item.quotation?.unit_price || 0) + freightValue).toFixed(2)}`,
            is_ddp: true,
            is_not_shipping: false,
            cnc_fixtures: `$${cncFixturesValue.toFixed(2)}`,
            has_tooling: false,
            has_trim_die: false
          };
        }) || [],
        
        // Additional fields
        notes: globalQuotationDetails.description || '',
        has_tooling: false,
        has_trim_die: false,
        
        // Terms
        tooling: '4-6 weeks after PO and design approval',
        fair_ppap_samples: '2-3 weeks after tooling completion',
        samples_shipping: 'Via express courier (DHL/FedEx)',
        moq: 'As specified per part',
        shipping: 'FOB or DDP as requested',
        payment_tooling: '50% advance, 50% upon approval',
        payment_components: 'Net 30 days',
        incoterms: 'DDP Customer facility',
        packaging_message: 'Standard industrial packaging unless otherwise specified',
        
        // Contact info
        full_name: 'AUTANA Sales Team',
        position: 'Sales Department',
        email: 'sales@autana.com',
        phone: '+1 (555) 123-4567'
      };

      // Call PDF generation API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/pdf-generation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_type: 'custom',
          data: pdfData,
          filename: `global_quote_${globalQuotation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
          options: {
            template_name: 'global_quotation'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate PDF');
      }

      const result = await response.json();
      
      if (result.pdf_url) {
        // Save PDF URL to database
        const updateResponse = await globalQuotationApi.updatePdfUrl(globalQuotation.id, result.pdf_url);
        
        if (updateResponse.error) {
          console.warn('Failed to save PDF URL to database:', updateResponse.error);
        }

        // Update the modal with the generated PDF
        setCurrentPdfUrl(result.pdf_url);
        
        // Refresh the quotations list to show updated data
        refetch();
        
        toast({
          title: "✅ PDF Generated!",
          description: "The quotation PDF has been generated successfully.",
        });
      } else {
        throw new Error('No PDF URL returned');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsPdfModalOpen(false); // Close modal on error
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
      });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading global quotations: {error}
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
          <h3 className="text-lg font-semibold">Global Quotations</h3>
          <p className="text-sm text-muted-foreground">
            View and manage global quotations created from this RFQ's part numbers
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Create Global Quotation
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Global Quotes</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalQuotations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalQuotations.filter(q => q.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalQuotations.filter(q => q.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalQuotations.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Global Quotations ({globalQuotations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {globalQuotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No global quotations yet</p>
              <p className="text-sm">Create global quotations from the Part Numbers tab.</p>
            </div>
          ) : (
            <div className="divide-y">
              {globalQuotations.map((globalQuotation) => (
                <div key={globalQuotation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{globalQuotation.name}</h4>
                        <Badge className={getStatusColor(globalQuotation.status)}>
                          {globalQuotation.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {globalQuotation.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {globalQuotation.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Created {formatDate(globalQuotation.created_at)}</span>
                        </div>
                        {globalQuotation.total_value && (
                          <div className="flex items-center gap-1">
                            <DollarSignIcon className="h-3 w-3" />
                            <span>Total: {formatCurrency(globalQuotation.total_value)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(globalQuotation)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePDFAction(globalQuotation)}
                        disabled={generatingPdfId === globalQuotation.id}
                      >
                        <FileDownIcon className="h-4 w-4 mr-2" />
                        {generatingPdfId === globalQuotation.id ? 'Generating...' : 'PDF'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Quotation Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGlobalQuotation && `Global Quotation: ${selectedGlobalQuotation.name}`}
            </DialogTitle>
          </DialogHeader>

          {selectedGlobalQuotation && (
            <div className="space-y-6">
              {/* Global Quotation Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Global Quotation Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Name</label>
                      <p className="text-sm font-medium">{selectedGlobalQuotation.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge className={getStatusColor(selectedGlobalQuotation.status)}>
                        {selectedGlobalQuotation.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(selectedGlobalQuotation.created_at)}</p>
                    </div>
                    {selectedGlobalQuotation.total_value && (
                      <div>
                        <label className="text-xs text-muted-foreground">Total Value</label>
                        <p className="text-sm font-medium">{formatCurrency(selectedGlobalQuotation.total_value)}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedGlobalQuotation.description && (
                    <div className="mt-4">
                      <label className="text-xs text-muted-foreground">Description</label>
                      <p className="text-sm">{selectedGlobalQuotation.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Part Numbers and Quotations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Part Numbers & Selected Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedGlobalQuotation.part_numbers && selectedGlobalQuotation.part_numbers.length > 0 ? (
                    <div className="space-y-4">
                      {selectedGlobalQuotation.part_numbers.map((partNumberItem) => (
                        <div key={partNumberItem.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-medium">
                                {partNumberItem.part_number?.part_name || 'Unknown Part'}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {partNumberItem.part_number?.drawing_number || 'No drawing number'}
                              </p>
                            </div>
                            <div>
                              <h5 className="font-medium">
                                Total Price
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(partNumberItem?.quotation?.total_price)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigateToPartNumber(
                                partNumberItem.part_number_id,
                                partNumberItem.quotation_id
                              )}
                            >
                              <ExternalLinkIcon className="h-4 w-4 mr-2" />
                              View PN quote
                            </Button>
                          </div>
                          
                          {partNumberItem.quotation && partNumberItem.supplier && (
                            <div className="bg-muted/50 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium">
                                      Version {partNumberItem.quotation.version_number}
                                    </span>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {partNumberItem.quotation.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-3">
                                    <BuildingIcon className="h-3 w-3 inline mr-1" />
                                    {partNumberItem.supplier.name}
                                    {partNumberItem.supplier.comercial_name && (
                                      <span> ({partNumberItem.supplier.comercial_name})</span>
                                    )}
                                  </div>
                                  
                                  {/* Pricing and EAU Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-white rounded p-2 border">
                                      <div className="text-xs text-muted-foreground mb-1">Unit Price ($)</div>
                                      <div className="font-medium text-green-600 text-lg">
                                        {formatCurrency(partNumberItem.quotation.unit_price)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">per unit</div>
                                    </div>
                                    
                                    {partNumberItem.quotation.total_price && (
                                      <div className="bg-white rounded p-2 border">
                                        <div className="text-xs text-muted-foreground mb-1">Total Price ($)</div>
                                        <div className="font-medium text-blue-600 text-lg">
                                          {formatCurrency(partNumberItem.quotation.total_price)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">total cost</div>
                                      </div>
                                    )}
                                    
                                    <div className="bg-white rounded p-2 border">
                                      <div className="text-xs text-muted-foreground mb-1">EAU</div>
                                      <div className="font-medium text-purple-600 text-lg">
                                        {formatNumber(partNumberItem.part_number?.estimated_anual_units)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">estimated annual units</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigateToPartNumber(
                                      partNumberItem.part_number_id,
                                      partNumberItem.quotation_id
                                    )}
                                  >
                                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                                    Edit Quote
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNavigateToPartNumber(
                                      partNumberItem.part_number_id
                                    )}
                                  >
                                    View Part
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">No part numbers in this global quotation</p>
                      <p className="text-sm">This global quotation doesn't have any part numbers yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Global Quotation Modal */}
      <CreateGlobalQuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        rfqId={rfqId}
        onSuccess={async (globalQuotationId) => {
          // Close the create modal first
          setIsCreateModalOpen(false);
          
          // If a new quotation was created, generate and show PDF
          if (globalQuotationId) {
            // Add a small delay to ensure the create modal is fully closed
            setTimeout(async () => {
              try {
                // Get the fresh quotation data
                const { globalQuotationApi } = await import('@/services/global-quotation/globalQuotationApi');
                const response = await globalQuotationApi.getById(globalQuotationId);
                
                if (response.data) {
                  // Refetch list to show updated data
                  await refetch();
                  
                  // Generate and show PDF in modal
                  await handlePDFAction(response.data);
                }
              } catch (error) {
                console.error('Error loading new quotation:', error);
                // Still refetch even if PDF generation fails
                refetch();
              }
            }, 300); // 300ms delay to ensure smooth transition
          } else {
            // Just refetch if no ID provided
            refetch();
          }
        }}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        open={isPdfModalOpen}
        onOpenChange={setIsPdfModalOpen}
        pdfUrl={currentPdfUrl}
        title={currentPdfTitle}
        isGenerating={generatingPdfId !== null}
      />
    </div>
  );
}