import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRMSuppliers } from "@/hooks/rm-supplier/useRMSuppliers";
import { RMSupplierPayload } from "@/types/rm-supplier/rmSupplier";

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

const rmSupplierSchema = z.object({
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

type RMSupplierFormData = z.infer<typeof rmSupplierSchema>;

interface AddRMSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddRMSupplierModal({ open, onOpenChange, onSuccess }: AddRMSupplierModalProps) {
  const { toast } = useToast();
  const { createSupplier } = useRMSuppliers();
  const [loading, setLoading] = useState(false);

  const form = useForm<RMSupplierFormData>({
    resolver: zodResolver(rmSupplierSchema),
    defaultValues: {
      name: "",
      comercial_name: "",
      link_web: "",
      phone: "",
      email: "",
      full_address: "",
      enabled: true,
      material_types: [],
      certifications: [],
      notes: "",
    },
  });

  const onSubmit = async (data: RMSupplierFormData) => {
    setLoading(true);
    
    // Show loading toast
    toast({
      title: "⏳ Creating RM Supplier",
      description: "Please wait while we save your RM supplier...",
    });
    
    try {
      // Clean up empty strings
      const cleanedData: RMSupplierPayload = {
        ...data,
        link_web: data.link_web || null,
        email: data.email || null,
        material_types: data.material_types?.length ? data.material_types : null,
        certifications: data.certifications?.length ? data.certifications : null,
        notes: data.notes || null,
      };

      await createSupplier(cleanedData);
      
      // Show success toast
      toast({
        title: "✅ RM Supplier Created",
        description: `"${data.name}" has been successfully added to the system.`,
      });
      
      // Reset form and close modal with a small delay to ensure toast is visible
      form.reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 100);
      
    } catch (error) {
      toast({
        title: "❌ Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create RM supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add RM Supplier</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create RM Supplier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 