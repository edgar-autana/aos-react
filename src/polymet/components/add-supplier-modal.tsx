import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supplierApi } from "@/services/supplier/supplierApi";
import { SUPPLIER_TYPE_OPTIONS, SIZE_OPTIONS, STATE_OPTIONS } from "@/constants/supplier";

// Validation schema
const createSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  comercial_name: z.string().optional(),
  description: z.string().optional(),
  link_web: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  full_address: z.string().optional(),
  zip: z.string().optional(),
  state: z.enum(STATE_OPTIONS).optional(),
  type: z.enum(SUPPLIER_TYPE_OPTIONS).optional(),
  size: z.enum(SIZE_OPTIONS).optional(),
  enabled: z.boolean().default(true),
  iso_9001_2015: z.boolean().default(false),
  iatf: z.boolean().default(false),
  first_contact: z.date().optional(),
});

type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;

interface AddSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSupplierModal({ open, onOpenChange }: AddSupplierModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<CreateSupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      comercial_name: "",
      description: "",
      link_web: "",
      phone: "",
      full_address: "",
      zip: "",
      state: undefined,
      type: undefined,
      size: undefined,
      enabled: true,
      iso_9001_2015: false,
      iatf: false,
      first_contact: undefined,
    },
  });

  const handleSubmit = async (data: CreateSupplierFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for Supabase tb_supplier table
      const supplierData = {
        name: data.name,
        comercial_name: data.comercial_name || "",
        description: data.description || "",
        link_web: data.link_web || "",
        phone: data.phone || "",
        full_address: data.full_address || "",
        zip: data.zip || "",
        state: data.state || undefined,
        type: data.type || undefined,
        size: data.size || undefined,
        capacity: data.type || "", // Save supplier type to capacity field
        enabled: data.enabled,
        iso_9001_2015: data.iso_9001_2015,
        iatf: data.iatf,
        first_contact: data.first_contact ? data.first_contact.toISOString() : undefined,
        image: "",
        created_at_atos: new Date().toISOString(),
        presentation: "",
      };

      const response = await supplierApi.create(supplierData);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Success! Close modal and navigate to the new supplier's profile
        onOpenChange(false);
        form.reset();
        navigate(`/suppliers/${response.data.id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create supplier";
      setError(errorMessage);
      console.error('Exception during supplier creation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      form.reset();
      setError(null);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset();
      setError(null);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Create a new supplier profile. Fill in the basic information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Commercial Name */}
              <FormField
                control={form.control}
                name="comercial_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commercial Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter commercial name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="link_web"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://supplier.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        <SelectItem value="Aluminum Die Casting" {...{} as any}>Aluminum Die Casting</SelectItem>
                        <SelectItem value="Zamac Die Casting" {...{} as any}>Zamac Die Casting</SelectItem>
                        <SelectItem value="CNC Machining" {...{} as any}>CNC Machining</SelectItem>
                        <SelectItem value="Aluminum Extrusion" {...{} as any}>Aluminum Extrusion</SelectItem>
                        <SelectItem value="Injection Molding" {...{} as any}>Injection Molding</SelectItem>
                        <SelectItem value="Die Stamping" {...{} as any}>Die Stamping</SelectItem>
                        <SelectItem value="Tooling" {...{} as any}>Tooling</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Size */}
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        <SelectItem value="Big" {...{} as any}>Big</SelectItem>
                        <SelectItem value="Medium" {...{} as any}>Medium</SelectItem>
                        <SelectItem value="Small" {...{} as any}>Small</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        <SelectItem value="Yucatan" {...{} as any}>Yucatan</SelectItem>
                        <SelectItem value="DF" {...{} as any}>DF</SelectItem>
                        <SelectItem value="Aguascalientes" {...{} as any}>Aguascalientes</SelectItem>
                        <SelectItem value="Baja California" {...{} as any}>Baja California</SelectItem>
                        <SelectItem value="Baja California Sur" {...{} as any}>Baja California Sur</SelectItem>
                        <SelectItem value="Campeche" {...{} as any}>Campeche</SelectItem>
                        <SelectItem value="Coahuila" {...{} as any}>Coahuila</SelectItem>
                        <SelectItem value="Colima" {...{} as any}>Colima</SelectItem>
                        <SelectItem value="Chiapas" {...{} as any}>Chiapas</SelectItem>
                        <SelectItem value="Chihuahua" {...{} as any}>Chihuahua</SelectItem>
                        <SelectItem value="Durango" {...{} as any}>Durango</SelectItem>
                        <SelectItem value="Guanajuato" {...{} as any}>Guanajuato</SelectItem>
                        <SelectItem value="Guerrero" {...{} as any}>Guerrero</SelectItem>
                        <SelectItem value="Hidalgo" {...{} as any}>Hidalgo</SelectItem>
                        <SelectItem value="Jalisco" {...{} as any}>Jalisco</SelectItem>
                        <SelectItem value="México" {...{} as any}>México</SelectItem>
                        <SelectItem value="Michoacán" {...{} as any}>Michoacán</SelectItem>
                        <SelectItem value="Morelos" {...{} as any}>Morelos</SelectItem>
                        <SelectItem value="Nayarit" {...{} as any}>Nayarit</SelectItem>
                        <SelectItem value="Nuevo León" {...{} as any}>Nuevo León</SelectItem>
                        <SelectItem value="Oaxaca" {...{} as any}>Oaxaca</SelectItem>
                        <SelectItem value="Puebla" {...{} as any}>Puebla</SelectItem>
                        <SelectItem value="Querétaro" {...{} as any}>Querétaro</SelectItem>
                        <SelectItem value="Quintana Roo" {...{} as any}>Quintana Roo</SelectItem>
                        <SelectItem value="San Luis Potosí" {...{} as any}>San Luis Potosí</SelectItem>
                        <SelectItem value="Sinaloa" {...{} as any}>Sinaloa</SelectItem>
                        <SelectItem value="Sonora" {...{} as any}>Sonora</SelectItem>
                        <SelectItem value="Tabasco" {...{} as any}>Tabasco</SelectItem>
                        <SelectItem value="Tamaulipas" {...{} as any}>Tamaulipas</SelectItem>
                        <SelectItem value="Tlaxcala" {...{} as any}>Tlaxcala</SelectItem>
                        <SelectItem value="Zacatecas" {...{} as any}>Zacatecas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ZIP Code */}
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Contact Date */}
              <FormField
                control={form.control}
                name="first_contact"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>First Contact Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && !isNaN(field.value.getTime()) ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Date of first contact with supplier (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enabled Status */}
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        Enable or disable this supplier
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ISO 9001:2015 */}
              <FormField
                control={form.control}
                name="iso_9001_2015"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        ISO 9001:2015
                      </FormLabel>
                      <FormDescription>
                        Supplier has ISO 9001:2015 certification
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* IATF */}
              <FormField
                control={form.control}
                name="iatf"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        IATF Certification
                      </FormLabel>
                      <FormDescription>
                        Supplier has IATF certification
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter supplier description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="full_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter supplier address..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Supplier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 