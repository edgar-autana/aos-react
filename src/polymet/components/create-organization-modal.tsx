/**
 * CreateOrganizationModal Component
 * Modal for creating new organizations
 */

import React, { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganizations } from '../../hooks/organization/useOrganizations';
import { CreateOrganizationForm, PlanType } from '../../types/organization/organization';
import { useGlobalData } from '@/contexts/GlobalDataProviderReal';
import { useAuth } from '@clerk/clerk-react';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Organization slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
});

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (organizationId: string) => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createOrganization, isLoading, error } = useOrganizations();
  const { currentPlan } = useGlobalData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Omit<CreateOrganizationForm, 'plan_type'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Auto-generate slug from name
  const watchedName = form.watch('name');
  React.useEffect(() => {
    if (watchedName && !form.getFieldState('slug').isDirty) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', generatedSlug);
    }
  }, [watchedName, form]);

  const onSubmit = async (values: Omit<CreateOrganizationForm, 'plan_type'>) => {
    try {
      setIsSubmitting(true);
      
      // Use the user's current plan for the organization
      const userPlanType = currentPlan?.plan_type || 'free';
      
      const organization = await createOrganization({
        name: values.name,
        slug: values.slug,
        plan_type: userPlanType as PlanType,
        status: 'active',
        settings: {},
      });

      // The backend automatically creates the user-organization relationship
      // The creating user becomes the organization admin with full permissions
      
      // Reset form and close modal
      form.reset();
      onClose();
      
      // Call success callback with organization ID
      if (onSuccess && organization) {
        onSuccess(organization.id);
      }
      
    } catch (error) {
      console.error('Failed to create organization:', error);
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Create Organization
          </DialogTitle>
          <DialogDescription>
            Set up a new organization to manage your team and projects.
            {currentPlan && (
              <span className="block mt-2 text-sm">
                Organization will be created with your <strong>{currentPlan.display_name}</strong> plan.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Acme Manufacturing"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed across the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. acme-manufacturing"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Used in URLs and must be unique. Auto-generated from name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};