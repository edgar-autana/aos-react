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
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { hasPermission } = usePermissions();

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

  // Navigation items
  const navItems = [
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

  const visibleNavItems = navItems.filter(item =>
    !item.permissions || item.permissions.some(perm => hasPermission(perm))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
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
          <div className="flex items-center gap-2 ml-auto">
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
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
