import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings as SettingsIcon,
  ArrowUpCircle,
  Building2,
  Users,
  Crown,
  Shield,
  CreditCard,
  Plus,
  UserPlus
} from 'lucide-react';
import { CreateOrganizationModal } from './create-organization-modal';
import { OrganizationMembersModal } from './organization-members-modal';
import { SuperAdminDashboard } from './super-admin-dashboard';
import { SubscriptionPlansModal } from './subscription-plans-modal';
import { useSupabaseGlobalData } from '@/hooks/useSupabaseGlobalData';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedOrgForMembers, setSelectedOrgForMembers] = useState<any>(null);
  
  // Unified global data using Supabase directly
  const { 
    organizations,
    currentOrganization,
    hasOrganizations,
    isSuperAdmin,
    plans,
    currentPlan,
    userSubscription,
    usage,
    isLoading: subscriptionLoading,
    loadUserSubscription,
    getOrganizationLimitText,
    getAIRequestsLimitText,
    activatePlan
  } = useSupabaseGlobalData();

  const handleChangePlan = () => {
    setShowPlansModal(true);
  };

  const handlePlanActivated = async () => {
    // Reload subscription data after plan activation
    await loadUserSubscription();
  };

  const handleManageMembers = (org: any) => {
    setSelectedOrgForMembers(org);
    setShowMembersModal(true);
  };

  const canCreateMoreOrgs = currentPlan && organizations && organizations.length < currentPlan.max_organizations;
  const isAdminOrManager = true; // TODO: Implement role checking logic

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
          {isSuperAdmin && (
            <Badge variant="destructive" className="ml-2">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          {canCreateMoreOrgs && (
            <Button onClick={() => setShowCreateOrgModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Org
            </Button>
          )}
          {isSuperAdmin && (
            <Button onClick={() => setShowSuperAdminModal(true)} variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          {isAdminOrManager && <TabsTrigger value="organizations">Organizations</TabsTrigger>}
          {isSuperAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        {/* Account Information Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your personal account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="text-sm mt-1 font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="text-sm mt-1 font-medium">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <div className="text-sm mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role Status</label>
                  <div className="text-sm mt-1">
                    {isSuperAdmin ? (
                      <Badge variant="destructive">
                        <Crown className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Management Tab */}
        <TabsContent value="plan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your active subscription plan and usage limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading subscription details...</div>
                  </div>
                ) : currentPlan ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{currentPlan.display_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${currentPlan.price_monthly}/month • {currentPlan.tier} tier
                        </div>
                      </div>
                      <Badge 
                        variant={String(currentPlan.tier || '').toLowerCase() === 'enterprise' ? 'default' : 
                                String(currentPlan.tier || '').toLowerCase() === 'premium' ? 'secondary' : 'outline'}
                      >
                        {currentPlan.tier}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {currentPlan.max_organizations}
                        </div>
                        <div className="text-xs text-muted-foreground">Organizations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{currentPlan.max_users_per_org}</div>
                        <div className="text-xs text-muted-foreground">Users per org</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {currentPlan.max_ai_requests_per_month}
                        </div>
                        <div className="text-xs text-muted-foreground">AI requests/month</div>
                      </div>
                    </div>
                    
                    {/* Usage Details */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-sm font-medium">Current Usage:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>• {getOrganizationLimitText()}</div>
                        <div>• {getAIRequestsLimitText()}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">No active plan</div>
                    <Button onClick={handleChangePlan} variant="outline">
                      Choose a Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Management</CardTitle>
                <CardDescription>
                  Upgrade or change your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {currentPlan ? 
                    'View all available plans and upgrade to unlock more features.' :
                    'Choose a plan to get started with organizations and team management.'
                  }
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleChangePlan}
                    className="w-full"
                    variant="default"
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    {currentPlan ? 'View All Plans' : 'Choose Plan'}
                  </Button>
                  
                  {currentPlan && false && (
                    <Button 
                      onClick={() => navigate('/onboarding')}
                      className="w-full"
                      variant="outline"
                      size="sm"
                    >
                      Onboarding Dashboard
                    </Button>
                  )}
                </div>
                
                {userSubscription?.status && (
                  <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                    <div>Status: <span className="font-medium capitalize">{userSubscription.status}</span></div>
                    {userSubscription.expires_at && (
                      <div>Expires: <span className="font-medium">
                        {new Date(userSubscription.expires_at).toLocaleDateString()}
                      </span></div>
                    )}
                  </div>
                )}
                
                {plans.length > 0 && (
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <div className="font-medium mb-2">Available Plans:</div>
                    <div className="space-y-1">
                      {plans.sort((a, b) => a.price_monthly - b.price_monthly).map((plan) => (
                        <div key={plan.id} className="flex justify-between">
                          <span>{plan.display_name}</span>
                          <span>${plan.price_monthly}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organization Management Tab */}
        {isAdminOrManager && (
          <TabsContent value="organizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Organization Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your organizations, members, and settings
                </p>
              </div>
              {canCreateMoreOrgs && (
                <Button onClick={() => setShowCreateOrgModal(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              )}
            </div>

            {hasOrganizations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations?.map((org) => (
                  <Card key={org.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <Badge 
                          variant={org.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {org.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Plan: {org.plan_type} • Created {new Date(org.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleManageMembers(org)}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Members
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Organizations</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first organization to start managing teams and projects.
                  </p>
                  {canCreateMoreOrgs && (
                    <Button onClick={() => setShowCreateOrgModal(true)}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Your First Organization
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Super Admin Tab */}
        {isSuperAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Super Admin Panel
                </h2>
                <p className="text-sm text-muted-foreground">
                  Platform-wide administration and management tools
                </p>
              </div>
              <Button onClick={() => setShowSuperAdminModal(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Open Admin Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organizations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total organizations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Platform users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      <CreateOrganizationModal 
        isOpen={showCreateOrgModal} 
        onClose={() => setShowCreateOrgModal(false)} 
      />
      
      {selectedOrgForMembers && (
        <OrganizationMembersModal
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedOrgForMembers(null);
          }}
          organizationId={selectedOrgForMembers.id}
          organizationName={selectedOrgForMembers.name}
        />
      )}
      
      {isSuperAdmin && (
        <SuperAdminDashboard
          isOpen={showSuperAdminModal}
          onClose={() => setShowSuperAdminModal(false)}
        />
      )}
      
      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onPlanActivated={handlePlanActivated}
      />
    </div>
  );
}