import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCompanies } from '@/hooks/company/useCompanies';
import { useSuppliers } from '@/hooks/supplier/useSuppliers';
import { Contact, ContactPayload } from '@/types/contact/contact';
import { Loader2 } from 'lucide-react';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  company: z.string().optional(),
  supplier: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDetailsFormProps {
  contact: Contact;
  onSubmit: (data: ContactPayload) => Promise<void>;
  isLoading: boolean;
}

export default function ContactDetailsForm({
  contact,
  onSubmit,
  isLoading,
}: ContactDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { companies, loading: companiesLoading } = useCompanies();
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact.name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin: contact.linkedin || '',
      company: contact.company || '',
      supplier: contact.supplier || '',
    },
  });

  const watchedCompany = form.watch('company');
  const watchedSupplier = form.watch('supplier');

  // Handle company/supplier interaction logic
  useEffect(() => {
    if (watchedCompany && watchedSupplier) {
      // If both are selected, clear the supplier (company takes precedence)
      form.setValue('supplier', '');
    }
  }, [watchedCompany, watchedSupplier, form]);

  const handleSubmit = async (data: ContactFormData) => {
    setError(null);
    
    try {
      const payload: ContactPayload = {
        name: data.name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        linkedin: data.linkedin || undefined,
        company: data.company || null,
        supplier: data.supplier || null,
      };

      await onSubmit(payload);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update contact');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Contact Details</CardTitle>
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
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="First name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name Field */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LinkedIn Field */}
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/profile" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Field */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!watchedSupplier || companiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder={
                            companiesLoading ? "Loading companies..." : 
                            watchedSupplier ? "Disabled (Supplier selected)" : 
                            "Select company"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent {...{} as any}>
                        <SelectItem value="" {...{} as any}>None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id} {...{} as any}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supplier Field */}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!watchedCompany || suppliersLoading}
                    >
                      <FormControl>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder={
                            suppliersLoading ? "Loading suppliers..." : 
                            watchedCompany ? "Disabled (Company selected)" : 
                            "Select supplier"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent {...{} as any}>
                        <SelectItem value="" {...{} as any}>None</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id} {...{} as any}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 