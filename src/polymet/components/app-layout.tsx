import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  SettingsIcon,
  HelpCircleIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  BuildingIcon,
  FileTextIcon,
  ClipboardIcon,
  Contact,
  FactoryIcon,
  PackageIcon,
  Shield,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissionsReal";
import { useEnvironment } from "@/hooks/useEnvironment";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Toaster } from "@/components/ui/toaster";
import { OrganizationSelector } from "./organization-selector";
import { CreateOrganizationModal } from "./create-organization-modal";
import { OrganizationMembersModal } from "./organization-members-modal";
import { SuperAdminDashboard } from "./super-admin-dashboard";
import { useGlobalData } from "../../contexts/GlobalDataProviderReal";
import { Organization } from "../../types/organization/organization";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSuperAdminDashboard, setShowSuperAdminDashboard] = useState(false);
  const [selectedOrgForMembers, setSelectedOrgForMembers] = useState<Organization | null>(null);

  const location = useLocation();
  const { hasPermission } = usePermissions();
  
  // Global data - already loaded at startup
  const { 
    organizations,
    hasOrganizations,
    canUpgradePlan,
    selectedOrganization,
    envInfo
  } = useGlobalData();
  

  // Check if user is super admin (using permissions for now)
  const isSuperAdmin = hasPermission("super:admin") || hasPermission("admin:all");
  
  // Determine if we should show top padding based on backend environment info
  const shouldShowBanner = envInfo?.show_banner || import.meta.env.VITE_ENVIRONMENT === 'STAGING';

  // Check if the path matches the current location
  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setIsDarkMode(!isDarkMode);
  };

  // Organization modal handlers
  const handleCreateOrganization = () => {
    setShowCreateOrgModal(true);
  };

  const handleManageOrganization = (organization: Organization) => {
    setSelectedOrgForMembers(organization);
    setShowMembersModal(true);
  };

  const handleShowSuperAdminDashboard = () => {
    setShowSuperAdminDashboard(true);
  };

  const handleCreateOrgSuccess = (organizationId: string) => {
    // The hook will automatically refresh the organization list
  };

  // Environment info is handled by useEnvironment hook automatically

  // Initialize dark mode based on system preference or localStorage
  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Define nav item type
  interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    permissions?: string[];
    onClick?: () => void;
  }

  // Navigation items
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
      permissions: ["org:view:dashboard", "org:all:access"],
    },
    {
      name: "Orders",
      path: "/orders",
      icon: <ClipboardListIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "RFQs",
      path: "/rfqs",
      icon: <ClipboardIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Contacts",
      path: "/contacts",
      icon: <Contact className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <UsersIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: <BuildingIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "RM Suppliers",
      path: "/rm-suppliers",
      icon: <PackageIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Technical Analysis",
      path: "/technical-analysis",
      icon: <FileTextIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
    {
      name: "Help",
      path: "/help",
      icon: <HelpCircleIcon className="h-5 w-5" />,
      permissions: ["org:view:orders", "org:all:access"],
    },
  ];

  // Add Super Admin item if user is super admin
  if (isSuperAdmin) {
    navItems.push({
      name: "Admin Console",
      path: "/console/admin",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      permissions: [],
    });
  }

  // Add Change Plan item if user can upgrade
  if (canUpgradePlan) {
    navItems.push({
      name: "Change Plan",
      path: "/onboarding",
      icon: <SettingsIcon className="h-5 w-5 text-blue-600" />,
      permissions: [], // No permissions required - always show if can upgrade
    });
  }

  const visibleNavItems = navItems.filter(item =>
    !item.permissions || item.permissions.some(perm => hasPermission(perm))
  );

  return (
    <div className={`min-h-screen bg-background flex flex-col ${shouldShowBanner ? 'pt-12' : ''}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Only show hamburger menu when user has organizations */}
            {hasOrganizations && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center gap-3">
              {/* AUTANA Logo */}
              <img 
                src="/logo/logo.png" 
                alt="AUTANA" 
                className="h-10 w-auto"
              />
              <div className="border-l pl-3 ml-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CNC Order Tracker</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {/* Organization Selector - Always available when user has organizations */}
            <SignedIn>
              {hasOrganizations && (
                <OrganizationSelector
                  onCreateOrganization={handleCreateOrganization}
                  onManageOrganization={handleManageOrganization}
                />
              )}
            </SignedIn>

            {/* Settings Link - Always available for authenticated users */}
            <SignedIn>
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-5 w-5" />
                </Button>
              </Link>
            </SignedIn>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Only show mobile menu overlay and sidebar when user has organizations */}
        {hasOrganizations && (
          <>
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="h-16 border-b flex items-center justify-between px-4 md:hidden">
                <Link to="/" className="flex items-center gap-3">
                  {/* AUTANA Logo */}
                  <img 
                    src="/logo/logo.png" 
                    alt="AUTANA" 
                    className="h-10 w-auto"
                  />
                  <div className="border-l pl-3 ml-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CNC Order Tracker</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {visibleNavItems.map((item) => (
                    <li key={item.path}>
                      {item.onClick ? (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={item.onClick}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </Button>
                      ) : (
                        <Link to={item.path}>
                          <Button
                            variant={isActive(item.path) ? "secondary" : "ghost"}
                            className="w-full justify-start"
                          >
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                          </Button>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Show Super Admin Dashboard if requested */}
          {showSuperAdminDashboard ? (
            <SuperAdminDashboard />
          ) : (
            children
          )}
        </main>
      </div>

      {/* SAAS Multi-Tenant Modals */}
      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
        onSuccess={handleCreateOrgSuccess}
      />

      <OrganizationMembersModal
        isOpen={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          setSelectedOrgForMembers(null);
        }}
        organization={selectedOrgForMembers}
      />

      {/* Show Super Admin Dashboard as Modal Alternative */}
      {showSuperAdminDashboard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Super Admin Dashboard</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuperAdminDashboard(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <SuperAdminDashboard />
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
