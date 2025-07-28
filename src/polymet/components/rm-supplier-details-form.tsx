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
import { RMSupplier } from "@/types/rm-supplier/rmSupplier";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Material types options
const MATERIAL_TYPES = [
  "Aluminum",
  "Steel",
  "Stainless Steel",
  "Copper",
  "Brass",
  "Bronze",
  "Titanium",
  "Plastic",
  "Rubber",
  "Ceramic",
  "Other"
];

// Certification options
const CERTIFICATIONS = [
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "AS9100",
  "IATF 16949",
  "ISO 13485",
  "FDA Approved",
  "CE Marking",
  "RoHS Compliant",
  "REACH Compliant",
  "Other"
];

// Validation schema - only name is required
const rmSupplierFormSchema = z.object({
  name: z.string().min(1, "RM Supplier name is required"),
  comercial_name: z.string().optional(),
  link_web: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  full_address: z.string().optional(),
  enabled: z.boolean().default(true),
  material_types: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type RMSupplierFormData = z.infer<typeof rmSupplierFormSchema>;

interface RMSupplierDetailsFormProps {
  supplier: RMSupplier;
  onSubmit: (data: RMSupplierFormData) => void;
  isLoading?: boolean;
}

export default function RMSupplierDetailsForm({ 
  supplier, 
  onSubmit, 
  isLoading = false 
}: RMSupplierDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RMSupplierFormData>({
    resolver: zodResolver(rmSupplierFormSchema),
    defaultValues: {
      name: supplier.name || "",
      comercial_name: supplier.comercial_name || "",
      link_web: supplier.link_web || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      full_address: supplier.full_address || "",
      enabled: supplier.enabled ?? true,
      material_types: supplier.material_types || [],
      certifications: supplier.certifications || [],
      notes: supplier.notes || "",
    },
  });

  const handleSubmit = async (data: RMSupplierFormData) => {
    setError(null);
    try {
      onSubmit(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update RM supplier";
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit RM Supplier Details</CardTitle>
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

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter RM supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Website */}
            <FormField
              control={form.control}
              name="link_web"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter website URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Address */}
            <FormField
              control={form.control}
              name="full_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter complete address" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material Types */}
            <FormField
              control={form.control}
              name="material_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Types</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select material types" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        {MATERIAL_TYPES.map((type) => (
                          <SelectItem key={type} value={type} {...{} as any}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((type, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <button
                            type="button"
                            onClick={() => {
                              const newValues = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValues);
                            }}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certifications */}
            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select certifications" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        {CERTIFICATIONS.map((cert) => (
                          <SelectItem key={cert} value={cert} {...{} as any}>
                            {cert}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((cert, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                          {cert}
                          <button
                            type="button"
                            onClick={() => {
                              const newValues = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValues);
                            }}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter additional notes" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this RM supplier for use in the system
                    </div>
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

            <div className="flex justify-end gap-2">
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