import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { companyApi } from "@/services/company/companyApi";
import { supabase } from "@/lib/supabase";

// Validation schema
const createCustomerSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate slug from company name
const generateSlug = (name: string): string => {
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleanName.length < 4) {
    return cleanName.toUpperCase();
  }
  
  const firstChar = cleanName[0];
  const remainingChars = cleanName.slice(1);
  
  // Get 3 random characters from the remaining part
  const randomChars = [];
  for (let i = 0; i < 3; i++) {
    if (remainingChars.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingChars.length);
      randomChars.push(remainingChars[randomIndex]);
    }
  }
  
  return (firstChar + randomChars.join('')).toUpperCase();
};

// Check if slug exists in database
const checkSlugExists = async (slug: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tb_company')
      .select('id')
      .eq('slug', slug);
    
    if (error) {
      console.error('Error checking slug existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking slug existence:', error);
    return false;
  }
};

export default function AddCustomerModal({ open, onOpenChange }: AddCustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      phone: "",
      url: "",
    },
  });

  // Watch for name changes to auto-generate slug
  const watchedName = form.watch("name");
  
  useEffect(() => {
    if (watchedName && watchedName.trim()) {
      const newSlug = generateSlug(watchedName);
      if (newSlug !== form.getValues("slug")) {
        form.setValue("slug", newSlug);
      }
    }
  }, [watchedName, form]);

  const handleSubmit = async (data: CreateCustomerFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if slug already exists
      const slugExists = await checkSlugExists(data.slug);
      
      if (slugExists) {
        setError("This slug already exists. Please change it manually to a unique value.");
        setIsLoading(false);
        return;
      }

      // Prepare data for Supabase tb_company table
      const companyData = {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        url: data.url || "",
        // Set default values for required fields
        id_atos: "",
        created_at_atos: new Date().toISOString(),
        presentation: "",
        status: "Prospect",
        enabled: true,
        image: "",
        nda_signed: null, // Use null instead of empty string for date fields
        hs_company_id: "",
      };

      const response = await companyApi.create(companyData);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Success! Close modal and navigate to the new company's profile
        onOpenChange(false);
        form.reset();
        navigate(`/customers/${response.data.id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create customer";
      setError(errorMessage);
      console.error('Exception during company creation:', err);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer profile. Fill in the required information below.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="company-slug" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from company name. You can edit it if needed.
                    </p>
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

              {/* URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      placeholder="Enter company description..."
                      className="min-h-[80px]"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter company address..."
                      className="min-h-[60px]"
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
                {isLoading ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 