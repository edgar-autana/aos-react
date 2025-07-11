import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePartNumber } from '@/hooks/part-number/usePartNumbers';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { PartNumberPayload } from '@/types/part-number/partNumber';
import { 
  FEASIBILITY_OPTIONS, 
  REASON_FEASIBILITY_OPTIONS, 
  RUNNER_OPTIONS, 
  MOLD_STEEL_CORE_OPTIONS,
  FeasibilityOption,
  ReasonFeasibilityOption,
  RunnerOption,
  MoldSteelCoreOption
} from '@/constants/partNumber';

// Validation schema
const partNumberAnalysisSchema = z.object({
  estimated_anual_units: z.number().min(1, "EAU must be greater than 0"),
  feasibility: z.enum(FEASIBILITY_OPTIONS, {
    required_error: "Please select feasibility",
  }),
  reason_feasibility: z.enum(REASON_FEASIBILITY_OPTIONS).optional(),
  cavities: z.number().min(0, "Cavities must be 0 or greater").optional(),
  mold_life: z.number().min(0, "Mold life must be 0 or greater").optional(),
  runner: z.enum(RUNNER_OPTIONS).optional(),
  mold_steel_core: z.enum(MOLD_STEEL_CORE_OPTIONS).optional(),
}).refine((data) => {
  // If feasibility is "CAN NOT DO", reason_feasibility is required
  if (data.feasibility === "CAN NOT DO") {
    return data.reason_feasibility !== undefined;
  }
  return true;
}, {
  message: "Can't do reason is required when feasibility is 'CAN NOT DO'",
  path: ["reason_feasibility"],
});

type PartNumberAnalysisFormData = z.infer<typeof partNumberAnalysisSchema>;

export default function PartNumberAnalysisForm() {
  const { id = "" } = useParams();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Fetch part number data
  const { partNumber, loading, error, refetch } = usePartNumber(id);
  
  const form = useForm<PartNumberAnalysisFormData>({
    resolver: zodResolver(partNumberAnalysisSchema),
    defaultValues: {
      estimated_anual_units: 0,
      feasibility: undefined,
      reason_feasibility: undefined,
      cavities: undefined,
      mold_life: undefined,
      runner: undefined,
      mold_steel_core: undefined,
    },
  });

  const { handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, reset } = form;

  // Watch feasibility to show/hide reason_feasibility field
  const feasibilityValue = watch("feasibility");

  // Update form when part number data is loaded
  useEffect(() => {
    if (partNumber) {
      reset({
        estimated_anual_units: partNumber.estimated_anual_units || 0,
        feasibility: partNumber.feasibility as FeasibilityOption || undefined,
        reason_feasibility: partNumber.reason_feasibility as ReasonFeasibilityOption || undefined,
        cavities: partNumber.cavities || undefined,
        mold_life: partNumber.mold_life || undefined,
        runner: partNumber.runner as RunnerOption || undefined,
        mold_steel_core: partNumber.mold_steel_core as MoldSteelCoreOption || undefined,
      });
    }
  }, [partNumber, reset]);

  const onSubmit = async (data: PartNumberAnalysisFormData) => {
    if (!partNumber) return;

    // Clear any previous errors
    setFormError(null);
    
    try {
      // Prepare the update payload
      const updatePayload: Partial<PartNumberPayload> = {
        estimated_anual_units: data.estimated_anual_units,
        feasibility: data.feasibility,
        reason_feasibility: data.feasibility === "CAN NOT DO" ? data.reason_feasibility : null,
        cavities: data.cavities || null,
        mold_life: data.mold_life || null,
        runner: data.runner || null,
        mold_steel_core: data.mold_steel_core || null,
      };

      // Debug logging
      console.log('Updating part number analysis:', updatePayload);

      // Save to database
      const response = await partNumberApi.update(partNumber.id, updatePayload);

      if (response.error) {
        console.error('Update error:', response.error);
        throw new Error(response.error);
      }

      toast({
        title: "Analysis Updated",
        description: "Part number analysis has been updated successfully.",
      });

      // Refetch the part number data to get the updated values
      refetch();
      
    } catch (error) {
      console.error('Error updating part number analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update part number analysis';
      setFormError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading part number details...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !partNumber) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load part number details"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Part Number Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EAU */}
              <FormField
                control={control}
                name="estimated_anual_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAU (Estimated Annual Units) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter estimated annual units" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feasibility */}
              <FormField
                control={control}
                name="feasibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feasibility *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder="Select feasibility" />
                        </SelectTrigger>
                        <SelectContent {...{} as any}>
                          {FEASIBILITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} {...{} as any}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Can't do reason - conditional */}
              {feasibilityValue === "CAN NOT DO" && (
                <FormField
                  control={control}
                  name="reason_feasibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Can't do reason *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger {...{} as any}>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent {...{} as any}>
                            {REASON_FEASIBILITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} {...{} as any}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Cavities */}
              <FormField
                control={control}
                name="cavities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cavities</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of cavities" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mold Life */}
              <FormField
                control={control}
                name="mold_life"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mold Life</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter mold life" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Runner */}
              <FormField
                control={control}
                name="runner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runner</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder="Select runner type" />
                        </SelectTrigger>
                        <SelectContent {...{} as any}>
                          {RUNNER_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} {...{} as any}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Steel Core */}
              <FormField
                control={control}
                name="mold_steel_core"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steel Core</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder="Select steel core" />
                        </SelectTrigger>
                        <SelectContent {...{} as any}>
                          {MOLD_STEEL_CORE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} {...{} as any}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Analysis
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 