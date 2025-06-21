import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/polymet/components/app-layout-updated";
import DashboardPage from "@/polymet/components/dashboard-page";
import OrdersPage from "@/polymet/components/orders-page";
import OrderDetailsPage from "@/polymet/components/order-details-page";
import CustomersPage from "@/polymet/components/customers-page";
import CustomerProfilePage from "@/polymet/components/customer-profile-page";
import SuppliersPage from "@/polymet/components/suppliers-page";
import SupplierProfilePage from "@/polymet/components/supplier-profile-page";
import TechnicalAnalysisPage from "@/polymet/pages/technical-analysis-page";
import RfqsPage from "@/polymet/pages/rfqs-page";
import CreateRfqPage from "@/polymet/pages/create-rfq-page";
import RfqDetailsPageUpdated from "@/polymet/pages/rfq-details-page-updated";
import PartAnalysisPage from "@/polymet/pages/part-analysis-page";
import PartDetailsPage from "@/polymet/pages/part-details-page";

export default function CncOrderTrackerPrototype() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <AppLayout>
              <OrdersPage />
            </AppLayout>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <AppLayout>
              <OrderDetailsPage />
            </AppLayout>
          }
        />

        <Route
          path="/customers"
          element={
            <AppLayout>
              <CustomersPage />
            </AppLayout>
          }
        />

        <Route
          path="/customers/:customerId"
          element={
            <AppLayout>
              <CustomerProfilePage />
            </AppLayout>
          }
        />

        <Route
          path="/suppliers"
          element={
            <AppLayout>
              <SuppliersPage />
            </AppLayout>
          }
        />

        <Route
          path="/suppliers/:supplierId"
          element={
            <AppLayout>
              <SupplierProfilePage />
            </AppLayout>
          }
        />

        <Route
          path="/technical-analysis"
          element={
            <AppLayout>
              <TechnicalAnalysisPage />
            </AppLayout>
          }
        />

        {/* RFQ Routes */}
        <Route
          path="/rfqs"
          element={
            <AppLayout>
              <RfqsPage />
            </AppLayout>
          }
        />

        <Route
          path="/rfqs/create"
          element={
            <AppLayout>
              <CreateRfqPage />
            </AppLayout>
          }
        />

        <Route
          path="/rfqs/:rfqId"
          element={
            <AppLayout>
              <RfqDetailsPageUpdated />
            </AppLayout>
          }
        />

        {/* New Part Details Route */}
        <Route
          path="/rfqs/:rfqId/parts/:partId"
          element={
            <AppLayout>
              <PartDetailsPage />
            </AppLayout>
          }
        />

        <Route
          path="/rfqs/:rfqId/parts/:partId/analyze"
          element={
            <AppLayout>
              <PartAnalysisPage />
            </AppLayout>
          }
        />

        <Route
          path="/rfqs/:rfqId/parts/:partId/analysis"
          element={
            <AppLayout>
              <PartDetailsPage />
            </AppLayout>
          }
        />

        {/* New Bid Routes */}
        <Route
          path="/rfqs/:rfqId/bids/:bidId"
          element={
            <AppLayout>
              <PlaceholderPage title="Bid Details" />
            </AppLayout>
          }
        />

        <Route
          path="/rfqs/:rfqId/competitions/:competitionId"
          element={
            <AppLayout>
              <PlaceholderPage title="Bidding Competition Details" />
            </AppLayout>
          }
        />

        {/* Placeholder routes for future development */}
        <Route
          path="/settings"
          element={
            <AppLayout>
              <PlaceholderPage title="Settings" />
            </AppLayout>
          }
        />

        <Route
          path="/help"
          element={
            <AppLayout>
              <PlaceholderPage title="Help & Support" />
            </AppLayout>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <AppLayout>
              <NotFoundPage />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
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

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
    </div>
  );
}
