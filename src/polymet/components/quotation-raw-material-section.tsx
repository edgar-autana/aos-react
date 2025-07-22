import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuotationCalculations } from '@/hooks/quotation/useQuotationCalculations';
import { QuotationFormData } from '@/types/quotation/quotation';

interface MaterialAlloy {
  id: string;
  description: string;
}

interface QuotationRawMaterialSectionProps {
  materialAlloys: MaterialAlloy[];
  partNumberCavities?: number | null;
}

export default function QuotationRawMaterialSection({ 
  materialAlloys, 
  partNumberCavities 
}: QuotationRawMaterialSectionProps) {
  const { control, watch, setValue } = useFormContext<QuotationFormData>();
  
  // Watch the values needed for calculations
  const costOfPlate = watch('cost_of_plate');
  const rmCncMargin = watch('rm_cnc_margin');
  const rmCncScrap = watch('rm_cnc_scrap');
  const machineCostPerHour = watch('machine_cost_per_hour');
  const cycleTimeSec = watch('cycle_time_sec');

  // Use the calculation hook
  const { calculations } = useQuotationCalculations({
    cost_of_plate: costOfPlate,
    rm_cnc_margin: rmCncMargin,
    rm_cnc_scrap: rmCncScrap,
    machine_cost_per_hour: machineCostPerHour,
    cycle_time_sec: cycleTimeSec,
    total_price: null // Not used, calculated internally
  });

  // Update the calculated fields in the form
  React.useEffect(() => {
    setValue('rm_cnc_piece_price', calculations.rm_cnc_piece_price);
    setValue('piece_weight_rm_cnc_percentage', calculations.piece_weight_rm_cnc_percentage);
  }, [calculations, setValue]);

  // Format currency for display in badges
  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage for display in badges
  const formatPercentage = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return `${value.toFixed(1)}%`;
  };

  // Parse percentage from input
  const parsePercentage = (value: string): number | null => {
    if (!value.trim()) return null;
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return null;
    return parsed / 100; // Convert percentage to decimal
  };

  // Parse currency from input
  const parseCurrency = (value: string): number | null => {
    if (!value.trim()) return null;
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Raw Material</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Alloy */}
          <FormField
            control={control}
            name="material_alloy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alloy</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger {...{} as any}>
                      <SelectValue placeholder="Select alloy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent {...{} as any}>
                    {materialAlloys.map((alloy) => (
                      <SelectItem key={alloy.id} value={alloy.id} {...{} as any}>
                        {alloy.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost of Plate */}
          <FormField
            control={control}
            name="cost_of_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost of Plate</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter cost"
                      className="pl-6"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      value={field.value || ''}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cavity */}
          <FormField
            control={control}
            name="cavities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cavity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter cavities"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RM CNC Scrap */}
          <FormField
            control={control}
            name="rm_cnc_scrap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RM CNC Scrap</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter scrap percentage (e.g., 5 for 5%)"
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

          {/* RM CNC Margin */}
          <FormField
            control={control}
            name="rm_cnc_margin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RM CNC Margin</FormLabel>
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

        {/* Calculated Badges */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            {/* Weight Percentage Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Weight (%):</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                {calculations.piece_weight_rm_cnc_percentage !== null 
                  ? formatPercentage(calculations.piece_weight_rm_cnc_percentage)
                  : '—'
                }
              </Badge>
            </div>

            {/* Piece Price (RM) Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Piece Price (RM):</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                {calculations.rm_cnc_piece_price !== null 
                  ? formatCurrency(calculations.rm_cnc_piece_price)
                  : '—'
                }
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 