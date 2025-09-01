import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuperAdmin } from '../../hooks/organization/useSuperAdmin';
import { Organization, OrganizationStatus, PlanType } from '../../types/organization/organization';

export function ConsoleAdminOrganizations() {
  const {
    allOrganizations,
    isLoading,
    error,
    fetchAllOrganizations,
    updateOrganizationStatus,
    updateOrganizationPlan,
  } = useSuperAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllOrganizations();
  }, [fetchAllOrganizations]);

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
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage all organizations in the system
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="ml-2 text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            View and manage organization status, plans, and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
    </div>
  );
}