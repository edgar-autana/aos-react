import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuotationCalculations } from '@/hooks/quotation/useQuotationCalculations';
import { QuotationFormData } from '@/types/quotation/quotation';

interface CNCMachine {
  id: string;
  description: string;
}

interface QuotationCNCMachiningSectionProps {
  cncMachines: CNCMachine[];
}

export default function QuotationCNCMachiningSection({ 
  cncMachines 
}: QuotationCNCMachiningSectionProps) {
  const { control, watch, setValue } = useFormContext<QuotationFormData>();
  
  // Watch the values needed for calculations
  const costOfPlate = watch('cost_of_plate');
  const rmCncMargin = watch('rm_cnc_margin');
  const rmCncScrap = watch('rm_cnc_scrap');
  const machineCostPerHour = watch('machine_cost_per_hour');
  const cycleTimeSec = watch('cycle_time_sec');

  // Use the calculation hook with all necessary data
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
    setValue('piece_price_cnc_no_scrap', calculations.piece_price_cnc_no_scrap);
    setValue('piece_price_cnc_scrap', calculations.piece_price_cnc_scrap);
    setValue('piece_weight_cnc_percentage', calculations.piece_weight_cnc_percentage);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">CNC Machining</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Machine */}
          <FormField
            control={control}
            name="cnc_machine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger {...{} as any}>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent {...{} as any}>
                    {cncMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id} {...{} as any}>
                        {machine.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Press Rate */}
          <FormField
            control={control}
            name="machine_cost_per_hour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Press Rate</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter cost per hour"
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

          {/* Cycle Time (Sec) */}
          <FormField
            control={control}
            name="cycle_time_sec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cycle Time (Sec)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter cycle time"
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

        {/* Calculated Badges */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            {/* Left side - Weight and intermediate calculations */}
            <div className="flex flex-wrap gap-4">
              {/* Weight Percentage Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Weight (%):</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {calculations.piece_weight_cnc_percentage !== null 
                    ? formatPercentage(calculations.piece_weight_cnc_percentage)
                    : '—'
                  }
                </Badge>
              </div>

              {/* Piece Price (No Scrap) Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Piece Price (No Scrap):</span>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-100">
                  {calculations.piece_price_cnc_no_scrap !== null 
                    ? formatCurrency(calculations.piece_price_cnc_no_scrap)
                    : '—'
                  }
                </Badge>
              </div>
            </div>

            {/* Right side - Final Piece Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Piece Price (Scrap):</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                {calculations.piece_price_cnc_scrap !== null 
                  ? formatCurrency(calculations.piece_price_cnc_scrap)
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