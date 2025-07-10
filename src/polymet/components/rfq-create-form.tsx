import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RFQPayload } from '@/types/rfq/rfq';
import { useCompanies } from '@/hooks/company/useCompanies';
import { useSuppliers } from '@/hooks/supplier/useSuppliers';
import { rfqApi } from '@/services/rfq/rfqApi';
import { useToast } from '@/hooks/use-toast';

interface RfqCreateFormProps {
  customerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RFQ_STATUSES = [
  "Pending Review",
  "RFQ Created", 
  "Quotation Sent",
  "Feedback & Re-Quoting",
  "Moving Forward",
  "Quote Approved",
  "OPT Closed Lost",
  "NDA",
  "Request Email",
  "Purchase Order"
];

export default function RfqCreateForm({ customerId, onSuccess, onCancel }: RfqCreateFormProps) {
  const { toast } = useToast();
  const { companies, loading: companiesLoading } = useCompanies();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RFQPayload>({
    defaultValues: {
      name: '',
      description: '',
      status: 'Pending Review',
      company: customerId, // Pre-selected and locked to current customer
      supplier: undefined,
      due_date: undefined,
      priority: false,
      assigned: undefined,
    },
  });

  const onSubmit = async (data: RFQPayload) => {
    try {
      console.log('Creating RFQ with data:', data);
      
      // Format data properly - convert empty strings to null for UUID fields (database requirement)
      const formattedData = {
        ...data,
        company: data.company || customerId, // Ensure company is set
        supplier: data.supplier || null,
        assigned: data.assigned || null,
        due_date: data.due_date || null,
        enabled: true, // Set as enabled by default
        autana_canceled_rfq: false, // Set default value
      } as any; // Use any to handle the null vs undefined TypeScript mismatch

      console.log('Formatted data for API:', formattedData);

      const response = await rfqApi.create(formattedData);
      
      console.log('API response:', response);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      if (response.data) {
        toast({
          title: 'Success',
          description: 'RFQ created successfully',
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to create RFQ',
        variant: 'destructive',
      });
    }
  };

  const parseDateString = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    
    // Handle UTC dates from database - parse as UTC and create date in local timezone
    // to preserve the original date (not time)
    if (dateString.includes('T') || dateString.includes('+')) {
      const utcDate = new Date(dateString);
      if (isNaN(utcDate.getTime())) return undefined;
      
      // Create a new date using the UTC date components but in local timezone
      const localDate = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      );
      return localDate;
    }
    
    // Handle simple date strings
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Manager */}
        <div className="space-y-2">
          <Label htmlFor="assigned">Account Manager</Label>
          <Controller
            name="assigned"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger {...{} as any}>
                  <SelectValue placeholder="Select account manager" />
                </SelectTrigger>
                <SelectContent {...{} as any}>
                  <SelectItem value="" {...{} as any}>No account manager selected</SelectItem>
                  {/* TODO: Add actual users when user management is implemented */}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger {...{} as any}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent {...{} as any}>
                  {RFQ_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} {...{} as any}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Custom Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Custom Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter RFQ name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || customerId}
                onValueChange={field.onChange}
                disabled={true} // Always disabled - company is locked to current customer
              >
                <SelectTrigger {...{} as any}>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent {...{} as any}>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id} {...{} as any}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Company is automatically set to the current customer
          </p>
        </div>

        {/* Designated Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier">Designated Supplier</Label>
          <Controller
            name="supplier"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={suppliersLoading}
              >
                <SelectTrigger {...{} as any}>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent {...{} as any}>
                  <SelectItem value="" {...{} as any}>No supplier selected</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id} {...{} as any}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Controller
            name="due_date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(new Date(field.value), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parseDateString(field.value)}
                    onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="priority"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="priority">Priority</Label>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter RFQ description"
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create RFQ
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 