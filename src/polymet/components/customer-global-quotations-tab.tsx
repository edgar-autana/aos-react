import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FileIcon
} from 'lucide-react';
import { useGlobalQuotationsByCompany } from '@/hooks/global-quotation/useGlobalQuotations';
import { GlobalQuotation } from '@/types/global-quotation/globalQuotation';
import { GlobalQuotationWithDetails } from '@/types/global-quotation/globalQuotation';
import { formatNumber, formatCurrency } from '@/utils/numberUtils';

interface CustomerGlobalQuotationsTabProps {
  customerId: string;
}

export default function CustomerGlobalQuotationsTab({ customerId }: CustomerGlobalQuotationsTabProps) {
  const navigate = useNavigate();
  const { globalQuotations, loading, error, refetch } = useGlobalQuotationsByCompany(customerId);
  const [selectedGlobalQuotation, setSelectedGlobalQuotation] = useState<GlobalQuotationWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
          
        </div>
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
              <p className="text-sm">Global quotations will appear here when created from RFQs.</p>
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
                        {globalQuotation.rfq_info && (
                          <div className="flex items-center gap-1">
                            <FileIcon className="h-3 w-3" />
                            <span>From RFQ: </span>
                            <Link 
                              to={`/rfqs/${globalQuotation.rfq_info.id}`}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {globalQuotation.rfq_info.name || globalQuotation.rfq_info.slug_name || `RFQ-${globalQuotation.rfq_info.id.slice(-6)}`}
                            </Link>
                          </div>
                        )}
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
                    {selectedGlobalQuotation.rfq_info && (
                      <div>
                        <label className="text-xs text-muted-foreground">Source RFQ</label>
                        <div className="flex items-center gap-2 mt-1">
                          <FileIcon className="h-3 w-3 text-muted-foreground" />
                          <Link 
                            to={`/rfqs/${selectedGlobalQuotation.rfq_info.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            {selectedGlobalQuotation.rfq_info.name || selectedGlobalQuotation.rfq_info.slug_name || `RFQ-${selectedGlobalQuotation.rfq_info.id.slice(-6)}`}
                          </Link>
                        </div>
                      </div>
                    )}
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
    </div>
  );
} 