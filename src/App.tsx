import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import AppLayout from "@/polymet/components/app-layout";
import DashboardPage from "@/polymet/components/dashboard-page";
import OrdersPage from "@/polymet/components/orders-page";
import OrderDetailsPage from "@/polymet/components/order-details-page";
import CustomersPage from "@/polymet/components/customers-page";
import CustomerProfilePage from "@/polymet/components/customer-profile-page";
import SuppliersPage from "@/polymet/components/suppliers-page";
import SupplierProfilePage from "@/polymet/components/supplier-profile-page";
import RMSuppliersPage from "@/polymet/components/rm-suppliers-page";
import RMSupplierProfilePage from "@/polymet/components/rm-supplier-profile-page";
import TechnicalAnalysisPage from "@/polymet/pages/technical-analysis-page";
import RfqsPage from "@/polymet/pages/rfqs-page";
import CreateRfqPage from "@/polymet/pages/create-rfq-page";
import RfqDetailsPage from "@/polymet/pages/rfq-details-page";
import PartAnalysisPage from "@/polymet/pages/part-analysis-page";
import PartDetailsPage from "@/polymet/pages/part-details-page";
import PartNumberDetailsPage from "@/polymet/pages/part-number-details-page";
import ContactProfilePage from "@/polymet/components/contact-profile-page";
import NewContactsPage from "@/pages/contacts/ContactsPage";
import SettingsPage from "@/polymet/components/settings-page";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import EnvironmentBanner from "@/components/EnvironmentBanner";
import { OnboardingDashboard } from "@/polymet/components/onboarding-dashboard";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import { CreateOrganizationPage } from "@/polymet/components/create-organization-page";
import { LandingPage } from "@/components/LandingPage";
import { GlobalDataProvider, useGlobalData } from "@/contexts/GlobalDataProviderReal";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import { ConsoleAdminLayout } from "@/polymet/components/console-admin-layout";
import { ConsoleAdminDashboard } from "@/polymet/pages/console-admin-dashboard";
import { ConsoleAdminInvitations } from "@/polymet/pages/console-admin-invitations";
import { ConsoleAdminOrganizations } from "@/polymet/pages/console-admin-organizations";
import { ConsoleAdminSettings } from "@/polymet/pages/console-admin-settings";
import { SuperAdminDebug } from "@/components/SuperAdminDebug";
import { AcceptInvitationPage } from "@/polymet/components/accept-invitation-page";

// Auth Layout Component
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}

// App Content Component - only renders when data is ready
function AppContent() {
  const { isReady, error } = useGlobalData();

  // Show loading screen until all data is loaded
  if (!isReady) {
    return <GlobalLoadingScreen />;
  }

  // Show error screen if data loading failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Failed to Load Application
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // App is ready - render normal content
  return (
    <OnboardingRedirect>
      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Invitation Route */}
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
          
          {/* Public Auth Routes */}
          <Route
            path="/sign-in"
            element={
              <AuthLayout>
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-lg"
                    }
                  }}
                  redirectUrl="/dashboard"
                />
              </AuthLayout>
            }
          />
          
          <Route
            path="/sign-up"
            element={
              <AuthLayout>
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-lg"
                    }
                  }}
                  redirectUrl="/onboarding"
                />
              </AuthLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/new"
            element={
              <ProtectedRoute>
                <CreateOrganizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/technical-analysis"
            element={
              <ProtectedRoute permission={["org:view:dashboard", "org:all:access"]}>
                <AppLayout>
                  <TechnicalAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute permission={["org:all:access", "org:view:dashboard", "org:view:orders"]}>
                <AppLayout>
                  <OrdersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <OrderDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <CustomersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/:customerId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <CustomerProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <SuppliersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers/:supplierId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <SupplierProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rm-suppliers"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <RMSuppliersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rm-suppliers/:supplierId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <RMSupplierProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/technical-analysis"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <TechnicalAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* RFQ Routes */}
          <Route
            path="/rfqs"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <RfqsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rfqs/create"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <CreateRfqPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rfqs/:rfqId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <RfqDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Part Number Details Route */}
          <Route
            path="/part-number/:id"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PartNumberDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* New Part Details Route */}
          <Route
            path="/rfqs/:rfqId/parts/:partId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PartDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rfqs/:rfqId/parts/:partId/analyze"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PartAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rfqs/:rfqId/parts/:partId/analysis"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PartDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* New Bid Routes */}
          <Route
            path="/rfqs/:rfqId/bids/:bidId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PlaceholderPage title="Bid Details" />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rfqs/:rfqId/competitions/:competitionId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PlaceholderPage title="Bidding Competition Details" />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Debug Route */}
          <Route
            path="/debug/super-admin"
            element={
              <ProtectedRoute>
                <SuperAdminDebug />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Console Routes */}
          <Route
            path="/console/admin"
            element={
              <SuperAdminRoute>
                <ConsoleAdminLayout />
              </SuperAdminRoute>
            }
          >
            <Route index element={<ConsoleAdminDashboard />} />
            <Route path="invitations" element={<ConsoleAdminInvitations />} />
            <Route path="organizations" element={<ConsoleAdminOrganizations />} />
            <Route path="settings" element={<ConsoleAdminSettings />} />
          </Route>

          <Route
            path="/help"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <PlaceholderPage title="Help & Support" />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/contacts"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <ContactsPage contacts={contacts} setContacts={setContacts} />
                </AppLayout>
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/contacts/:contactId"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <ContactProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contacts"
            element={
              <ProtectedRoute permission="org:all:access">
                <AppLayout>
                  <NewContactsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
      </Routes>
    </OnboardingRedirect>
  );
}

export default function CncOrderTrackerPrototype() {
  return (
    <>
      <Router>
        <GlobalDataProvider>
          <EnvironmentBanner />
          <AppContent />
        </GlobalDataProvider>
      </Router>
    </>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  );
}
