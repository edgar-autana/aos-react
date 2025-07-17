import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers } from '@/hooks/supplier/useSuppliers';
import { useQuotationMutations } from '@/hooks/quotation/useQuotations';
import { QuotationWithDetails } from '@/types/quotation/quotation';

// Validation schema
const quotationSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  unit_price: z.number().min(0, "Unit price must be positive").nullable(),
  total_price: z.number().min(0, "Total price must be positive").nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1").nullable(),
  lead_time_days: z.number().min(0, "Lead time must be positive").nullable(),
  validity_days: z.number().min(1, "Validity days must be at least 1").nullable(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  status: z.enum(['draft', 'completed'], {
    required_error: "Status is required",
  })
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partNumberId: string;
  partNumber: {
    id: string;
    part_name: string;
    drawing_number: string;
    estimated_anual_units?: number;
  };
  editingQuotation?: QuotationWithDetails | null;
  isCreatingVersion?: boolean;
  companyInfo?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  rfqInfo?: {
    id: string;
    name: string;
  } | null;
}

export default function QuotationFormModal({
  isOpen,
  onClose,
  onSuccess,
  partNumberId,
  partNumber,
  editingQuotation,
  isCreatingVersion: externalIsCreatingVersion,
  companyInfo,
  rfqInfo
}: QuotationFormModalProps) {
  const { toast } = useToast();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { createQuotation, createVersion, updateQuotation, loading: mutationLoading } = useQuotationMutations();
  const [error, setError] = useState<string | null>(null);
  const [internalIsCreatingVersion, setInternalIsCreatingVersion] = useState(false);
  
  // Use external prop if provided, otherwise use internal state
  const isCreatingVersion = externalIsCreatingVersion !== undefined ? externalIsCreatingVersion : internalIsCreatingVersion;

  const isEditing = !!editingQuotation && !isCreatingVersion;
  const isNewVersion = isCreatingVersion && editingQuotation;
  const isCreatingVersionFrom = !!editingQuotation && isCreatingVersion; // When editingQuotation is passed and we're creating a version

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      supplier_id: editingQuotation?.supplier_id || '',
      unit_price: editingQuotation?.unit_price || null,
      total_price: editingQuotation?.total_price || null,
      quantity: editingQuotation?.quantity || partNumber.estimated_anual_units || null,
      lead_time_days: editingQuotation?.lead_time_days || null,
      validity_days: editingQuotation?.validity_days || 30,
      notes: editingQuotation?.notes || '',
      internal_notes: editingQuotation?.internal_notes || '',
      status: (editingQuotation?.status === 'draft' || editingQuotation?.status === 'completed') ? editingQuotation.status : 'draft'
    }
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchQuantity = watch('quantity');
  const watchUnitPrice = watch('unit_price');

  // Auto-calculate total price when quantity or unit price changes
  useEffect(() => {
    const quantity = watchQuantity || 0;
    const unitPrice = watchUnitPrice || 0;
    const totalPrice = quantity * unitPrice;
    
    if (totalPrice > 0) {
      setValue('total_price', totalPrice);
    }
  }, [watchQuantity, watchUnitPrice, setValue]);

  // Format number with commas
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('en-US');
  };

  // Parse formatted number back to number
  const parseFormattedNumber = (value: string): number | null => {
    if (!value) return null;
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInternalIsCreatingVersion(false); // Reset internal state
      form.reset({
        supplier_id: editingQuotation?.supplier_id || '',
        unit_price: editingQuotation?.unit_price || null,
        total_price: editingQuotation?.total_price || null,
        quantity: editingQuotation?.quantity || partNumber.estimated_anual_units || null,
        lead_time_days: editingQuotation?.lead_time_days || null,
        validity_days: editingQuotation?.validity_days || 30,
        notes: editingQuotation?.notes || '',
        internal_notes: editingQuotation?.internal_notes || '',
        status: (editingQuotation?.status === 'draft' || editingQuotation?.status === 'completed') ? editingQuotation.status : 'draft'
      });
    }
  }, [isOpen, editingQuotation, partNumber.estimated_anual_units, form]);

  const onSubmit = async (data: QuotationFormData) => {
    setError(null);

    try {
      const quotationPayload = {
        ...data,
        part_number_id: partNumberId,
        unit_price: data.unit_price || null,
        total_price: data.total_price || null,
        quantity: data.quantity || null,
        lead_time_days: data.lead_time_days || null,
        validity_days: data.validity_days || null,
        notes: data.notes || null,
        internal_notes: data.internal_notes || null,
      };

      let response;

      if (isNewVersion || isCreatingVersionFrom) {
        // Create new version
        const rootId = editingQuotation?.parent_id || editingQuotation?.id;
        response = await createVersion(rootId!, quotationPayload);
      } else if (isEditing) {
        // Update existing quotation
        response = await updateQuotation(editingQuotation.id, quotationPayload);
      } else {
        // Create new quotation
        response = await createQuotation(quotationPayload);
      }

      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      const action = (isNewVersion || isCreatingVersionFrom) ? 'Version created' : isEditing ? 'updated' : 'created';
      toast({
        title: `Quotation ${action}`,
        description: `Quotation for "${partNumber.part_name}" has been ${action} successfully.`,
      });

      onSuccess();
    } catch (err) {
      console.error('Error in quotation form:', err);
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getModalTitle = () => {
    if (isNewVersion || isCreatingVersionFrom) return 'Create New Version';
    if (isEditing) return 'Edit Quotation';
    return 'Generate Quote';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || supplier?.comercial_name || 'Unknown Supplier';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Part Number Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Part Number Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Part Name</Label>
                    <p className="text-sm font-medium">{partNumber.part_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Drawing Number</Label>
                    <p className="text-sm font-medium">{partNumber.drawing_number}</p>
                  </div>
                  {partNumber.estimated_anual_units && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Estimated Annual Units</Label>
                      <p className="text-sm font-medium">{partNumber.estimated_anual_units.toLocaleString()}</p>
                    </div>
                  )}
                  {companyInfo && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Company</Label>
                      <p className="text-sm font-medium">{companyInfo.name}</p>
                    </div>
                  )}
                  {rfqInfo && (
                    <div>
                      <Label className="text-xs text-muted-foreground">RFQ</Label>
                      <p className="text-sm font-medium">{rfqInfo.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Supplier */}
                  <FormField
                    control={control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isEditing && !isNewVersion}
                        >
                          <FormControl>
                            <SelectTrigger {...{} as any}>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent {...{} as any}>
                            {suppliersLoading ? (
                              <SelectItem value="loading" disabled {...{} as any}>
                                Loading suppliers...
                              </SelectItem>
                            ) : (
                              suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id} {...{} as any}>
                                  {supplier.name}
                                  {supplier.comercial_name && (
                                    <span className="text-muted-foreground ml-2">
                                      ({supplier.comercial_name})
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger {...{} as any}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent {...{} as any}>
                            <SelectItem value="draft" {...{} as any}>Draft</SelectItem>
                            <SelectItem value="completed" {...{} as any}>Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quantity */}
                  <FormField
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            value={formatNumber(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit Price */}
                  <FormField
                    control={control}
                    name="unit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter unit price"
                            {...field}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            value={formatNumber(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Price */}
                  <FormField
                    control={control}
                    name="total_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter total price"
                            {...field}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            value={formatNumber(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lead Time */}
                  <FormField
                    control={control}
                    name="lead_time_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Time (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter lead time"
                            {...field}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            value={formatNumber(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Validity Days */}
                  <FormField
                    control={control}
                    name="validity_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validity (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter validity period"
                            {...field}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            value={formatNumber(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any customer-facing notes..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Internal Notes */}
                <FormField
                  control={control}
                  name="internal_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add internal notes (not visible to customer)..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

                        <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutationLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              {isEditing && externalIsCreatingVersion === undefined && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setInternalIsCreatingVersion(true)}
                  disabled={mutationLoading}
                >
                  Create New Version
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={mutationLoading}
              >
                {mutationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {(isNewVersion || isCreatingVersionFrom) ? 'Create Version' : isEditing ? 'Update Quote' : 'Generate Quote'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 