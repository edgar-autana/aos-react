import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DatabaseIcon,
  CheckIcon,
  Building2,
  Plus,
  Users,
  Loader2,
} from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataProviderReal";
import { CreateOrganizationModal } from "./create-organization-modal";
import { CNC_ORDERS, CncOrder } from "@/polymet/data/cnc-orders-data";
import OrderListItem from "@/polymet/components/order-list-item";
import StatusBadge from "@/polymet/components/status-badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  
  // Handle successful organization creation
  const handleOrganizationCreated = async (organizationId: string) => {
    // Refresh global data to include the new organization
    await refreshData();
    
    // For first organization creation, redirect to main app view with sidebar
    if (!hasOrganizations) {
      // Navigate to the main manufacturing app view with organization selector
      navigate('/orders', { replace: true });
    }
    
    // If user already has organizations, they stay on dashboard to see the updated list
    // The global data has been refreshed and will show the new organization
  };
  
  // Global data - already loaded at app startup
  const { 
    organizations, 
    currentPlan, 
    userSubscription,
    hasOrganizations,
    refreshData
  } = useGlobalData();

  // Removed automatic redirect to onboarding - users can access dashboard and use settings to manage plans

  // Calculate statistics (using existing CNC orders data for now)
  const totalOrders = CNC_ORDERS.length;
  const inProgressOrders = CNC_ORDERS.filter(
    (order) => order.status === "in-progress"
  ).length;
  const completedOrders = CNC_ORDERS.filter(
    (order) => order.status === "completed"
  ).length;
  const delayedOrders = CNC_ORDERS.filter((order) =>
    order.tasks.some((task) => task.status === "delayed")
  ).length;

  // Get recent orders (most recent first based on start date)
  const recentOrders = [...CNC_ORDERS]
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .slice(0, 3);

  // Get upcoming tasks (tasks that are pending or in progress)
  const upcomingTasks = CNC_ORDERS.flatMap((order) =>
    order.tasks
      .filter(
        (task) => task.status === "pending" || task.status === "in-progress"
      )
      .map((task) => ({
        ...task,
        orderNumber: order.orderNumber,
        orderId: order.id,
      }))
  )
    .sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
    .slice(0, 5);

  // No loading states needed - data is already loaded globally

  const canCreateMoreOrgs = currentPlan && organizations && organizations.length < currentPlan.max_organizations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {hasOrganizations 
              ? `Managing ${organizations.length} organization${organizations.length > 1 ? 's' : ''} on ${currentPlan?.display_name || 'your'} plan`
              : "Set up your first organization to get started"
            }
          </p>
        </div>
        
        {/* Create Organization Button */}
        {canCreateMoreOrgs && hasOrganizations && (
          <Button onClick={() => setShowCreateOrgModal(true)} className="ml-4">
            <Building2 className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        )}
      </div>

      {/* No Organizations State */}
      {!hasOrganizations && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Organizations Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You're all set with your <strong>{currentPlan?.display_name}</strong> plan! 
              Create your first organization to start managing your manufacturing projects.
            </p>
            
            {/* Plan Limits Info */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="font-semibold text-lg">{currentPlan?.max_organizations || 'N/A'}</div>
                  <div className="text-muted-foreground">Organizations</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{currentPlan?.max_users_per_org || 'N/A'}</div>
                  <div className="text-muted-foreground">Users per org</div>
                </div>
              </div>
            </div>
            
            {canCreateMoreOrgs && (
              <Button size="lg" onClick={() => setShowCreateOrgModal(true)}>
                <Building2 className="w-5 h-5 mr-2" />
                Create Your First Organization
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organizations Grid */}
      {hasOrganizations && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Organizations</h2>
            <div className="text-sm text-muted-foreground">
              {organizations.length} of {currentPlan?.max_organizations || 0} used
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      org.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {org.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{org.plan_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(org.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Status Banner */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <DatabaseIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Sistema Actualizado
                </span>
                <span className="px-2 py-1 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full font-medium">
                  NEW
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Migración de archivos completada: 600 PDFs 2D y 309 archivos STEP 3D migrados exitosamente a S3
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">✓ Activo</div>
              <div className="text-xs text-green-600 dark:text-green-400">Sistema optimizado</div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Manufacturing Dashboard - Only show when user has organizations */}
      {hasOrganizations && (
        <>
          {/* Stats cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Manufacturing Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Orders"
                value={totalOrders}
                description="All time orders"
                icon={BarChartIcon}
              />

              <StatsCard
                title="In Progress"
                value={inProgressOrders}
                description="Currently being processed"
                icon={ClockIcon}
                iconColor="text-blue-500"
              />

              <StatsCard
                title="Completed"
                value={completedOrders}
                description="Successfully delivered"
                icon={CheckCircleIcon}
                iconColor="text-green-500"
              />

              <StatsCard
                title="Delayed"
                value={delayedOrders}
                description="Experiencing delays"
                icon={CalendarIcon}
                iconColor="text-amber-500"
              />
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/orders">
                <Button variant="ghost" className="text-sm">
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <OrderListItem key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Upcoming tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Order #{task.orderNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Due Date
                            </div>
                            <div>{formatDate(task.endDate)}</div>
                          </div>
                          <StatusBadge status={task.status} />

                          <Link to={`/orders/${task.orderId}`}>
                            <Button size="sm" variant="ghost">
                              <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No upcoming tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Create Organization Modal */}
      <CreateOrganizationModal 
        isOpen={showCreateOrgModal} 
        onClose={() => setShowCreateOrgModal(false)} 
        onSuccess={handleOrganizationCreated}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  iconColor?: string;
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
