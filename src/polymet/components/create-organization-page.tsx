import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { useOrganizations } from '@/hooks/organization/useOrganizations';
import { CreateOrganizationModal } from '@/polymet/components/create-organization-modal';

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const { currentPlan } = useSubscription();
  const { refetchUserContext } = useOrganizations();

  const handleSuccess = async () => {
    // Refresh user context to get new organization
    await refetchUserContext();
    // Navigate to dashboard
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your First Organization</h1>
          <p className="text-muted-foreground mb-4">
            Set up your organization to start managing your manufacturing operations
          </p>
          {currentPlan && (
            <p className="text-sm text-muted-foreground">
              Your {currentPlan.display_name} plan allows up to {currentPlan.max_organizations} organization{currentPlan.max_organizations > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <CreateOrganizationModal
          open={true}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          hideCloseButton={true}
        />
      </div>
    </div>
  );
}