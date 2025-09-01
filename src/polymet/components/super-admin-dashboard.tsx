/**
 * SuperAdminDashboard Component
 * Dashboard for super administrators to manage all organizations and invitations
 */

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { useSuperAdmin } from '../../hooks/organization/useSuperAdmin';
import { Organization, OrganizationStatus, PlanType } from '../../types/organization/organization';
import { SuperAdminInvitations } from './super-admin-invitations';

export const SuperAdminDashboard: React.FC = () => {
  const {
    allOrganizations,
    isLoading,
    error,
    systemHealth,
    fetchAllOrganizations,
    updateOrganizationStatus,
    updateOrganizationPlan,
    fetchSystemHealth,
    analytics,
    clearError,
  } = useSuperAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Load data on mount
  useEffect(() => {
    fetchAllOrganizations();
    fetchSystemHealth();
  }, [fetchAllOrganizations, fetchSystemHealth]);

  // Filter organizations based on search and filters
  const filteredOrganizations = allOrganizations.filter((org) => {
    const matchesSearch =
      searchTerm === '' ||
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesPlan = planFilter === 'all' || org.plan_type === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleStatusChange = async (organizationId: string, newStatus: OrganizationStatus) => {
    try {
      await updateOrganizationStatus(organizationId, newStatus);
    } catch (error) {
      console.error('Failed to update organization status:', error);
    }
  };

  const handlePlanChange = async (organizationId: string, newPlan: PlanType) => {
    try {
      await updateOrganizationPlan(organizationId, newPlan);
    } catch (error) {
      console.error('Failed to update organization plan:', error);
    }
  };

  const getStatusIcon = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: PlanType) => {
    switch (plan) {
      case 'enterprise':
        return 'default';
      case 'premium':
        return 'secondary';
      case 'free':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage invitations, organizations and monitor system health
          </p>
        </div>
        <Shield className="h-8 w-8 text-blue-600" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <SuperAdminInvitations />
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage all organizations in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organizations Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading organizations...
                        </TableCell>
                      </TableRow>
                    ) : filteredOrganizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No organizations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrganizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{org.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {org.slug}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(org.status)}
                              <Badge variant={getStatusBadgeVariant(org.status)}>
                                {org.status}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={getPlanBadgeVariant(org.plan_type)}>
                              {org.plan_type}
                            </Badge>
                          </TableCell>

                          <TableCell>{org.member_count || 0}</TableCell>

                          <TableCell>
                            {org.created_at ? new Date(org.created_at).toLocaleDateString() : '-'}
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(org.id, 'active')}
                                  disabled={org.status === 'active'}
                                >
                                  Activate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(org.id, 'suspended')}
                                  disabled={org.status === 'suspended'}
                                >
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(org.id, 'cancelled')}
                                  disabled={org.status === 'cancelled'}
                                >
                                  Cancel
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Plan</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handlePlanChange(org.id, 'free')}
                                  disabled={org.plan_type === 'free'}
                                >
                                  Free
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handlePlanChange(org.id, 'premium')}
                                  disabled={org.plan_type === 'premium'}
                                >
                                  Premium
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handlePlanChange(org.id, 'enterprise')}
                                  disabled={org.plan_type === 'enterprise'}
                                >
                                  Enterprise
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrganizations}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.activeOrganizations} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Avg. {analytics.averageMembersPerOrganization} per org
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Plans</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.premiumOrganizations + analytics.enterpriseOrganizations}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.freeOrganizations} free plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth?.status === 'healthy' ? '🟢' : '🔴'} {systemHealth?.status || 'Unknown'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemHealth?.metrics?.uptime || 'N/A'} uptime
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};