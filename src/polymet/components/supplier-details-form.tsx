import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Supplier } from "@/types/supplier/supplier";
import { SUPPLIER_TYPE_OPTIONS, SIZE_OPTIONS, STATE_OPTIONS } from "@/constants/supplier";



// Validation schema
const supplierFormSchema = z.object({
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

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierDetailsFormProps {
  supplier: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  isLoading?: boolean;
}

export default function SupplierDetailsForm({ 
  supplier, 
  onSubmit, 
  isLoading = false 
}: SupplierDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier.name || "",
      comercial_name: supplier.comercial_name || "",
      description: supplier.description || "",
      link_web: supplier.link_web || "",
      phone: supplier.phone || "",
      full_address: supplier.full_address || "",
      zip: supplier.zip || "",
      state: supplier.state && STATE_OPTIONS.includes(supplier.state as any) ? (supplier.state as any) : undefined,
      type: supplier.type && SUPPLIER_TYPE_OPTIONS.includes(supplier.type as any) ? (supplier.type as any) : undefined,
      size: supplier.size && SIZE_OPTIONS.includes(supplier.size as any) ? (supplier.size as any) : undefined,
      enabled: supplier.enabled ?? true,
      iso_9001_2015: supplier.iso_9001_2015 ?? false,
      iatf: supplier.iatf ?? false,
      first_contact: supplier.first_contact ? (
        (() => {
          const date = new Date(supplier.first_contact);
          return isNaN(date.getTime()) ? undefined : date;
        })()
      ) : undefined,
    },
  });

  const handleSubmit = async (data: SupplierFormData) => {
    setError(null);
    try {
      onSubmit(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update supplier";
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Supplier Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                        <SelectValue placeholder="SelectCapacity" />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 