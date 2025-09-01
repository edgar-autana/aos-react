import React from 'react';
import { Shield, Settings, Users, Building2, Activity } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@clerk/clerk-react';

export function ConsoleAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      path: '/console/admin',
      label: 'Dashboard',
      icon: Activity,
      description: 'Overview and analytics'
    },
    {
      path: '/console/admin/invitations',
      label: 'Invitations',
      icon: Users,
      description: 'Send and manage invitations'
    },
    {
      path: '/console/admin/organizations',
      label: 'Organizations',
      icon: Building2,
      description: 'Manage all organizations'
    },
    {
      path: '/console/admin/settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system settings'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/console/admin') {
      return location.pathname === '/console/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-xs text-muted-foreground">AUTANA System Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">Super Administrator</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Card 
                    key={item.path} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isActive 
                        ? 'ring-2 ring-primary shadow-md bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${
                            isActive ? 'text-primary' : 'text-foreground'
                          }`}>
                            {item.label}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}