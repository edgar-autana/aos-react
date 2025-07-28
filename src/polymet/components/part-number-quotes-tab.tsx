import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageLoading } from '@/components/ui/loading';
import { 
  PlusIcon, 
  EditIcon, 
  FileTextIcon, 
  CalendarIcon, 
  DollarSignIcon,
  ClockIcon,
  BuildingIcon,
  PackageIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuotationsWithDetails } from '@/hooks/quotation/useQuotations';
import { QuotationWithDetails } from '@/types/quotation/quotation';
import QuotationFormModal from './quotation-form-modal';

interface PartNumberQuotesTabProps {
  partNumberId: string;
  partNumber: {
    id: string;
    part_name: string;
    drawing_number: string;
    estimated_anual_units?: number;
  };
  companyInfo?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  rfqInfo?: {
    id: string;
    name: string;
  } | null;
  initialQuotationId?: string | null;
}

export default function PartNumberQuotesTab({ partNumberId, partNumber, companyInfo, rfqInfo, initialQuotationId }: PartNumberQuotesTabProps) {
  const { quotations, loading, error, refetch } = useQuotationsWithDetails(partNumberId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationWithDetails | null>(null);
  const [creatingVersionFrom, setCreatingVersionFrom] = useState<QuotationWithDetails | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  // Auto-open edit modal for specific quotation if initialQuotationId is provided
  React.useEffect(() => {
    if (initialQuotationId && quotations.length > 0) {
      const targetQuotation = quotations.find(q => q.id === initialQuotationId);
      if (targetQuotation) {
        setEditingQuotation(targetQuotation);
        setIsCreatingVersion(false);
      }
    }
  }, [initialQuotationId, quotations]);

  // Get status color
  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
      'sent': 'bg-blue-100 text-blue-800',
      'responded': 'bg-purple-100 text-purple-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  // Get supplier initials
  const getSupplierInitials = (supplier: any): string => {
    if (!supplier?.name) return 'S';
    return supplier.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle edit quotation
  const handleEditQuotation = (quotation: QuotationWithDetails) => {
    setEditingQuotation(quotation);
    setIsCreatingVersion(false);
  };

  // Handle create version from quotation
  const handleCreateVersion = (quotation: QuotationWithDetails) => {
    setCreatingVersionFrom(quotation);
    setIsCreatingVersion(true);
  };

  // Handle success (create or update)
  const handleSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
    setEditingQuotation(null);
    setCreatingVersionFrom(null);
    setIsCreatingVersion(false);
  };

  // Group quotations by supplier and parent
  const groupedQuotations = quotations.reduce((acc, quotation) => {
    const key = `${quotation.supplier_id}-${quotation.parent_id || quotation.id}`;
    
    if (!acc[key]) {
      acc[key] = {
        supplier: quotation.supplier,
        rootQuotation: quotation.parent_id ? null : quotation,
        versions: []
      };
    }
    
    if (quotation.parent_id) {
      acc[key].versions.push(quotation);
    } else {
      acc[key].rootQuotation = quotation;
    }
    
    return acc;
  }, {} as Record<string, any>);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading quotations: {error}
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
          <h3 className="text-lg font-semibold">Quotations</h3>
          <p className="text-sm text-muted-foreground">
            Manage quotes and versions for this part number
          </p>
        </div>
        {quotations.length === 0 && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Quote
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <EditIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter(q => q.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter(q => q.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedQuotations).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations ({quotations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {quotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No quotations yet</p>
              <p className="text-sm">Start by generating a quote for this part number.</p>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedQuotations).map(([key, group]) => (
                <div key={key} className="p-4">
                  {/* Supplier Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={group.supplier?.image} />
                      <AvatarFallback>
                        {getSupplierInitials(group.supplier)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{group.supplier?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {group.supplier?.comercial_name}
                      </p>
                    </div>
                  </div>

                  {/* Root Quotation */}
                  {group.rootQuotation && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                Version {group.rootQuotation.version_number}
                              </span>
                              <Badge className={getStatusColor(group.rootQuotation.status)}>
                                {group.rootQuotation.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSignIcon className="h-3 w-3" />
                                <span>
                                  {formatCurrency(group.rootQuotation.total_price)} / unit
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                <span>
                                  {group.rootQuotation.lead_time_days || '—'} days
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>
                                  {formatDate(group.rootQuotation.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuotation(group.rootQuotation)}
                                >
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit quotation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCreateVersion(group.rootQuotation)}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Create new version</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Versions */}
                  {group.versions.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {group.versions.map((version: QuotationWithDetails) => (
                        <div
                          key={version.id}
                          className="border rounded-lg p-3 bg-background"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    Version {version.version_number}
                                  </span>
                                  <Badge className={getStatusColor(version.status)}>
                                    {version.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <DollarSignIcon className="h-3 w-3" />
                                    <span>
                                      {formatCurrency(version.total_price)} / unit
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" />
                                    <span>
                                      {version.lead_time_days || '—'} days
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>
                                      {formatDate(version.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditQuotation(version)}
                                    >
                                      <EditIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit quotation</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCreateVersion(version)}
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Create new version</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <QuotationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
        partNumberId={partNumberId}
        partNumber={partNumber}
        companyInfo={companyInfo}
        rfqInfo={rfqInfo}
      />

      {/* Edit Modal */}
      {editingQuotation && (
        <QuotationFormModal
          isOpen={true}
          onClose={() => setEditingQuotation(null)}
          onSuccess={handleSuccess}
          partNumberId={partNumberId}
          partNumber={partNumber}
          editingQuotation={editingQuotation}
          isCreatingVersion={isCreatingVersion}
          companyInfo={companyInfo}
          rfqInfo={rfqInfo}
        />
      )}

      {/* Create Version Modal */}
      {creatingVersionFrom && (
        <QuotationFormModal
          isOpen={true}
          onClose={() => setCreatingVersionFrom(null)}
          onSuccess={handleSuccess}
          partNumberId={partNumberId}
          partNumber={partNumber}
          editingQuotation={creatingVersionFrom}
          isCreatingVersion={isCreatingVersion}
          companyInfo={companyInfo}
          rfqInfo={rfqInfo}
        />
      )}
    </div>
  );
} 