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
import { useMaterialAlloys } from '@/hooks/material/useMaterialAlloys';
import { useCNCMachines } from '@/hooks/cnc/useCNCMachines';
import { QuotationWithDetails } from '@/types/quotation/quotation';
import QuotationRawMaterialSection from './quotation-raw-material-section';
import QuotationCNCMachiningSection from './quotation-cnc-machining-section';
import { Badge } from '@/components/ui/badge';

// Validation schema
const quotationSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  unit_price: z.number().min(0, "Unit price must be positive").nullable(),
  total_price: z.number().min(0, "Total price must be positive").nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1").nullable(),
  moq1: z.number().min(0, "MOQ must be positive").nullable(),
  moq_margin_1: z.number().min(0, "MOQ margin must be positive").nullable(),
  material_alloy: z.string().nullable(),
  cost_of_plate: z.number().min(0, "Cost of plate must be positive").nullable(),
  cavities: z.number().min(0, "Cavities must be positive").nullable(),
  rm_cnc_scrap: z.number().min(0, "RM CNC scrap must be positive").nullable(),
  rm_cnc_margin: z.number().min(0, "RM CNC margin must be positive").nullable(),
  rm_cnc_piece_price: z.number().min(0, "RM CNC piece price must be positive").nullable(),
  piece_weight_rm_cnc_percentage: z.number().min(0, "Weight percentage must be positive").nullable(),
  cnc_machine: z.string().nullable(),
  machine_cost_per_hour: z.number().min(0, "Machine cost per hour must be positive").nullable(),
  cycle_time_sec: z.number().min(0, "Cycle time must be positive").nullable(),
  piece_price_cnc_no_scrap: z.number().min(0, "CNC piece price no scrap must be positive").nullable(),
  piece_price_cnc_scrap: z.number().min(0, "CNC piece price scrap must be positive").nullable(),
  piece_weight_cnc_percentage: z.number().min(0, "CNC weight percentage must be positive").nullable(),
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
    cavities?: number | null;
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
  const { materialAlloys, loading: materialAlloysLoading } = useMaterialAlloys();
  const { cncMachines, loading: cncMachinesLoading } = useCNCMachines();
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
      moq1: editingQuotation?.moq1 || null,
      moq_margin_1: editingQuotation?.moq_margin_1 || null,
      material_alloy: editingQuotation?.material_alloy || null,
      cost_of_plate: editingQuotation?.cost_of_plate || null,
      cavities: editingQuotation?.cavities || partNumber.cavities || null,
      rm_cnc_scrap: editingQuotation?.rm_cnc_scrap || null,
      rm_cnc_margin: editingQuotation?.rm_cnc_margin || null,
      rm_cnc_piece_price: editingQuotation?.rm_cnc_piece_price || null,
      piece_weight_rm_cnc_percentage: editingQuotation?.piece_weight_rm_cnc_percentage || null,
      cnc_machine: editingQuotation?.cnc_machine || null,
      machine_cost_per_hour: editingQuotation?.machine_cost_per_hour || null,
      cycle_time_sec: editingQuotation?.cycle_time_sec || null,
      piece_price_cnc_no_scrap: editingQuotation?.piece_price_cnc_no_scrap || null,
      piece_price_cnc_scrap: editingQuotation?.piece_price_cnc_scrap || null,
      piece_weight_cnc_percentage: editingQuotation?.piece_weight_cnc_percentage || null,
      lead_time_days: editingQuotation?.lead_time_days || null,
      validity_days: editingQuotation?.validity_days || 30,
      notes: editingQuotation?.notes || '',
      internal_notes: editingQuotation?.internal_notes || '',
      status: (editingQuotation?.status === 'draft' || editingQuotation?.status === 'completed') ? editingQuotation.status : 'draft'
    }
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  // Watch values for total calculation
  const costOfPlate = watch('cost_of_plate');
  const rmCncMargin = watch('rm_cnc_margin');
  const rmCncScrap = watch('rm_cnc_scrap');
  const machineCostPerHour = watch('machine_cost_per_hour');
  const cycleTimeSec = watch('cycle_time_sec');

  // Calculate total and update total_price field
  useEffect(() => {
    try {
      // Calculate RM Piece Price
      const rmPiecePrice = costOfPlate && rmCncMargin ? costOfPlate * (1 + rmCncMargin) : null;
      
      // Calculate CNC Piece Price (No Scrap)
      const cncNoScrap = cycleTimeSec && machineCostPerHour ? (cycleTimeSec / 3600) * machineCostPerHour : null;
      
      // Calculate CNC Scrap Cost
      const cncScrapCost = costOfPlate && rmCncScrap ? costOfPlate * rmCncScrap : null;
      
      // Calculate CNC Piece Price (With Scrap)
      const cncWithScrap = cncNoScrap && cncScrapCost ? cncNoScrap + cncScrapCost : null;
      
      // Calculate Total
      const total = (rmPiecePrice || 0) + (cncWithScrap || 0);
      
      // Update total_price field
      setValue('total_price', total > 0 ? total : null);
      
      // Clear any calculation errors
      setError(null);
    } catch (err) {
      setError('Error calculating total price. Please check your input values.');
      console.error('Calculation error:', err);
    }
  }, [costOfPlate, rmCncMargin, rmCncScrap, machineCostPerHour, cycleTimeSec, setValue]);

  // Format number for display (kept for any remaining display needs)
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('en-US');
  };

  // Format percentage for display (kept for any remaining display needs)
  const formatPercentage = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return `${(value * 100).toFixed(1)}%`;
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
        moq1: editingQuotation?.moq1 || null,
        moq_margin_1: editingQuotation?.moq_margin_1 || null,
        material_alloy: editingQuotation?.material_alloy || null,
        cost_of_plate: editingQuotation?.cost_of_plate || null,
        cavities: editingQuotation?.cavities || null,
        rm_cnc_scrap: editingQuotation?.rm_cnc_scrap || null,
        rm_cnc_margin: editingQuotation?.rm_cnc_margin || null,
        rm_cnc_piece_price: editingQuotation?.rm_cnc_piece_price || null,
        piece_weight_rm_cnc_percentage: editingQuotation?.piece_weight_rm_cnc_percentage || null,
        cnc_machine: editingQuotation?.cnc_machine || null,
        machine_cost_per_hour: editingQuotation?.machine_cost_per_hour || null,
        cycle_time_sec: editingQuotation?.cycle_time_sec || null,
        piece_price_cnc_no_scrap: editingQuotation?.piece_price_cnc_no_scrap || null,
        piece_price_cnc_scrap: editingQuotation?.piece_price_cnc_scrap || null,
        piece_weight_cnc_percentage: editingQuotation?.piece_weight_cnc_percentage || null,
        lead_time_days: editingQuotation?.lead_time_days || null,
        validity_days: editingQuotation?.validity_days || 30,
        notes: editingQuotation?.notes || '',
        internal_notes: editingQuotation?.internal_notes || '',
        status: (editingQuotation?.status === 'draft' || editingQuotation?.status === 'completed') ? editingQuotation.status : 'draft'
      });
    }
  }, [isOpen, editingQuotation, partNumber.estimated_anual_units, form]);

  const onSubmit = async (data: QuotationFormData) => {
    try {
      setError(null);
      
      // Validate that we have a total price
      if (!data.total_price || data.total_price <= 0) {
        setError('Total price must be calculated and greater than 0. Please fill in the required fields.');
        return;
      }

      const payload = {
        parent_id: isCreatingVersionFrom ? editingQuotation?.id : null,
        part_number_id: partNumberId,
        supplier_id: data.supplier_id,
        status: data.status,
        unit_price: data.unit_price || null,
        total_price: data.total_price,
        quantity: data.quantity || null,
        moq1: data.moq1 || null,
        moq_margin_1: data.moq_margin_1 || null,
        material_alloy: data.material_alloy || null,
        cost_of_plate: data.cost_of_plate || null,
        cavities: data.cavities || null,
        rm_cnc_scrap: data.rm_cnc_scrap || null,
        rm_cnc_margin: data.rm_cnc_margin || null,
        rm_cnc_piece_price: data.rm_cnc_piece_price || null,
        piece_weight_rm_cnc_percentage: data.piece_weight_rm_cnc_percentage || null,
        cnc_machine: data.cnc_machine || null,
        machine_cost_per_hour: data.machine_cost_per_hour || null,
        cycle_time_sec: data.cycle_time_sec || null,
        piece_price_cnc_no_scrap: data.piece_price_cnc_no_scrap || null,
        piece_price_cnc_scrap: data.piece_price_cnc_scrap || null,
        piece_weight_cnc_percentage: data.piece_weight_cnc_percentage || null,
        lead_time_days: data.lead_time_days || null,
        validity_days: data.validity_days || null,
        notes: data.notes || null,
        internal_notes: data.internal_notes || null,
        created_by: null // Will be set by backend
      };

      let result;
      if (isCreatingVersionFrom) {
        const parentId = editingQuotation?.parent_id || editingQuotation?.id;
        result = await createVersion(parentId!, payload);
      } else if (isEditing) {
        result = await updateQuotation(editingQuotation!.id, payload);
      } else {
        result = await createQuotation(payload);
      }

      if (result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: isCreatingVersionFrom 
          ? "Quotation version created successfully!" 
          : isEditing 
          ? "Quotation updated successfully!" 
          : "Quotation created successfully!",
      });

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Quotation submission error:', err);
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
                
                {/* Total Price */}
                <div className="mt-4 flex justify-end">
                  <FormField
                    control={control}
                    name="total_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Price</FormLabel>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-lg font-semibold">
                            {field.value ? `$${field.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Auto-calculated from RM + CNC</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* General Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">General Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* EAU */}
                  <FormField
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAU *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter EAU"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* MOQ 1 */}
                  <FormField
                    control={control}
                    name="moq1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ 1</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter MOQ"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* MOQ Margin 1 */}
                  <FormField
                    control={control}
                    name="moq_margin_1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ Margin 1</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="Enter margin (e.g., 5 for 5%)"
                              className="pr-8"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) / 100 : null)}
                              value={field.value ? (field.value * 100).toString() : ''}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              %
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Raw Material Section */}
            <QuotationRawMaterialSection
              materialAlloys={materialAlloys}
              partNumberCavities={partNumber.cavities}
            />

            {/* CNC Machining Section */}
            <QuotationCNCMachiningSection
              cncMachines={cncMachines}
            />

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
                            type="number"
                            placeholder="Enter lead time"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ''}
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
                            type="number"
                            placeholder="Enter validity period"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ''}
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