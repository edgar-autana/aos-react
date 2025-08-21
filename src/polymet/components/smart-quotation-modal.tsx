import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calculator, Package, DollarSign, Truck, Factory, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Validation schema for Smart Quotation
const smartQuotationSchema = z.object({
  eau: z.number().min(1, "EAU must be at least 1"),
  moq: z.number().min(1, "MOQ must be at least 1"),
  piece_price_exw: z.number().min(0.0001, "Piece price must be greater than 0"),
  freight_per_piece: z.number().min(0, "Freight must be 0 or greater"),
  cnc_fixtures: z.string().optional(),
});

type SmartQuotationFormData = z.infer<typeof smartQuotationSchema>;

interface SmartQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber: {
    id: string;
    part_name: string;
    drawing_number: string;
    estimated_anual_units?: number;
  };
  rfqId?: string;
  companyId?: string;
}

export default function SmartQuotationModal({
  isOpen,
  onClose,
  partNumber,
  rfqId,
  companyId
}: SmartQuotationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SmartQuotationFormData>({
    resolver: zodResolver(smartQuotationSchema),
    defaultValues: {
      eau: partNumber.estimated_anual_units || 1000,
      moq: 100,
      piece_price_exw: 0,
      freight_per_piece: 0,
      cnc_fixtures: '',
    },
  });

  const watchedValues = form.watch();
  const totalPiecePriceDDP = (watchedValues.piece_price_exw || 0) + (watchedValues.freight_per_piece || 0);
  const totalAnnualValue = (watchedValues.eau || 0) * totalPiecePriceDDP;

  const onSubmit = async (data: SmartQuotationFormData) => {
    try {
      setIsSubmitting(true);
      
      // TODO: Implement API call to create smart quotation
      console.log('Smart Quotation Data:', {
        ...data,
        total_piece_price_ddp: totalPiecePriceDDP,
        total_annual_value: totalAnnualValue,
        part_number_id: partNumber.id,
        rfq_id: rfqId,
        company_id: companyId,
      });

      toast({
        title: "Success",
        description: "Smart quotation created successfully",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create smart quotation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Create Smart Quotation
          </DialogTitle>
          <DialogDescription>
            Create a new quotation for {partNumber.part_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Part Number Info Card */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="pt-4 pb-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Part Name</Label>
                    <p className="font-medium text-sm">{partNumber.part_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Drawing Number</Label>
                    <p className="font-medium text-sm">{partNumber.drawing_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" />
                Quantity Requirements
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eau"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EAU (Estimated Annual Usage)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Expected yearly quantity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MOQ (Minimum Order Quantity)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Minimum units per order</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Pricing Details
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="piece_price_exw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Piece Price EXW (Ex Works)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Price per piece excluding freight</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freight_per_piece"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Truck className="h-3 w-3" />
                        Freight per Piece
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Shipping cost per piece</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Calculated Values */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                    <Calculator className="h-4 w-4" />
                    Calculated Values
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Total Piece Price DDP</Label>
                      <p className="text-lg font-semibold">${totalPiecePriceDDP.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">EXW + Freight</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Total Annual Value</Label>
                      <p className="text-lg font-semibold text-primary">${totalAnnualValue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">EAU × DDP Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Manufacturing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Factory className="h-4 w-4 text-muted-foreground" />
                Manufacturing Details
              </div>
              <FormField
                control={form.control}
                name="cnc_fixtures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNC Fixtures & Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any special fixtures, tooling, or setup requirements..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about special tooling, fixtures, or manufacturing requirements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                This quotation will be linked to the current RFQ and company. All calculated values will be stored automatically.
              </AlertDescription>
            </Alert>
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Smart Quotation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}