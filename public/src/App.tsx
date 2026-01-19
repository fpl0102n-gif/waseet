import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Success from "./pages/Success";
import Contact from "./pages/Contact";
import OrderTracking from "./pages/OrderTracking";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import OrderDetails from "./pages/OrderDetails";
import ReferralCode from "./pages/ReferralCode";
import AdminReferrals from "./pages/AdminReferrals";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import ZeroCommission from "./pages/ZeroCommission";
import AlKhayrFAQ from "./pages/AlKhayrFAQ";
import AlKhayrAdmin from "./pages/AlKhayrAdmin";
import UnifiedRequests from "./pages/UnifiedRequests";
import UnifiedRequestsLegacy from "./pages/UnifiedRequestsLegacy";

import BloodDonation from "./pages/BloodDonation";
import BloodDonorsAdmin from "./pages/BloodDonorsAdmin";
import ExchangePage from "./pages/ExchangePage";
import AdminExchange from "./pages/AdminExchange";
import AdminExchangeRates from "./pages/AdminExchangeRates";
import SystemHealth from "./pages/SystemHealth";
import AdminImportRequests from "./pages/AdminImportRequests";
import AdminImportRequestDetails from "./pages/AdminImportRequestDetails";
import RequestImport from "./pages/RequestImport";
import RegisterAgent from "./pages/RegisterAgent";
import AdminAgentRegistrations from "./pages/AdminAgentRegistrations";
import AdminAgentRegistrationDetails from "./pages/AdminAgentRegistrationDetails";
import StyleGuide from "./pages/StyleGuide";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import AdminStoreManagement from "./pages/AdminStoreManagement";
import SocialPopup from "@/components/SocialPopup";
import AlkhayrVerseModal from "@/components/AlkhayrVerseModal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import FAQ from "./pages/FAQ";

// New Admin Pages
import AdminOverview from "./pages/AdminOverview";
import AdminOrders from "./pages/AdminOrders";
import AdminTransport from "./pages/AdminTransport";
import AdminContent from "./pages/AdminContent";
import AdminUsers from "./pages/AdminUsers";
import AdminProductSuggestions from "./pages/AdminProductSuggestions";
import AdminMaterialDonations from "./pages/AdminMaterialDonations";
import AdminAnalytics from "./pages/AdminAnalytics";
import { RoleGuard } from "@/components/admin/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SocialPopup />
          <AlkhayrVerseModal />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/success/:orderId" element={<Success />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/referral" element={<ReferralCode />} />
            <Route path="/verify" element={<Navigate to="/track" replace />} />

            {/* ADMIN ROUTES - Protected by RBAC */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Dashboard: Accessible by all admins (Super + Humanitarian) */}
            <Route path="/admin/dashboard" element={<RoleGuard><AdminOverview /></RoleGuard>} />

            {/* Humanitarian: Accessible by all admins */}
            <Route path="/admin/alkhayr" element={<RoleGuard><AlKhayrAdmin /></RoleGuard>} />
            <Route path="/admin/blood" element={<RoleGuard><BloodDonorsAdmin /></RoleGuard>} />
            <Route path="/admin/transport" element={<RoleGuard><AdminTransport /></RoleGuard>} />
            <Route path="/admin/material-donations" element={<RoleGuard><AdminMaterialDonations /></RoleGuard>} />

            {/* SUPER ADMIN ONLY ROUTES */}
            <Route path="/admin/orders" element={<RoleGuard allowedRoles={['super_admin']}><AdminOrders /></RoleGuard>} />
            <Route path="/admin/orders/:orderId" element={<RoleGuard allowedRoles={['super_admin']}><OrderDetails /></RoleGuard>} />
            <Route path="/admin/store" element={<RoleGuard allowedRoles={['super_admin']}><AdminStoreManagement /></RoleGuard>} />
            <Route path="/admin/exchange" element={<RoleGuard allowedRoles={['super_admin']}><AdminExchange /></RoleGuard>} />
            <Route path="/admin/exchange-rates" element={<RoleGuard allowedRoles={['super_admin']}><AdminExchangeRates /></RoleGuard>} />
            <Route path="/admin/import-requests" element={<RoleGuard allowedRoles={['super_admin']}><AdminImportRequests /></RoleGuard>} />
            <Route path="/admin/import-requests/:id" element={<RoleGuard allowedRoles={['super_admin']}><AdminImportRequestDetails /></RoleGuard>} />
            <Route path="/admin/product-suggestions" element={<RoleGuard allowedRoles={['super_admin']}><AdminProductSuggestions /></RoleGuard>} />
            <Route path="/admin/agent-registrations" element={<RoleGuard allowedRoles={['super_admin']}><AdminAgentRegistrations /></RoleGuard>} />
            <Route path="/admin/agent-registrations/:id" element={<RoleGuard allowedRoles={['super_admin']}><AdminAgentRegistrationDetails /></RoleGuard>} />
            <Route path="/admin/referrals" element={<RoleGuard allowedRoles={['super_admin']}><AdminReferrals /></RoleGuard>} />

            <Route path="/admin/content" element={<RoleGuard allowedRoles={['super_admin']}><AdminContent /></RoleGuard>} />
            <Route path="/admin/settings" element={<RoleGuard allowedRoles={['super_admin']}><AdminSettings /></RoleGuard>} />
            <Route path="/admin/users" element={<RoleGuard allowedRoles={['super_admin']}><AdminUsers /></RoleGuard>} />
            <Route path="/admin/analytics" element={<RoleGuard allowedRoles={['super_admin']}><AdminAnalytics /></RoleGuard>} />

            {/* Public Al Khayr Pages */}
            {/* Unified Al Khayr Page */}
            <Route path="/alkhayr" element={<Navigate to="/alkhayr/main?type=local" replace />} />
            {/* Al-Khayr Routes */}
            <Route path="/alkhayr/main" element={<UnifiedRequests />} />
            <Route path="/alkhayr/legacy" element={<UnifiedRequestsLegacy />} />

            {/* Legacy Redirects */}
            <Route path="/alkhayr/local" element={<Navigate to="/alkhayr/main?type=local" replace />} />
            <Route path="/alkhayr/foreign" element={<Navigate to="/alkhayr/main?type=foreign" replace />} />
            <Route path="/alkhayr/diaspora" element={<Navigate to="/alkhayr/main?type=diaspora" replace />} />
            <Route path="/alkhayr/my-requests" element={<Navigate to="/alkhayr/main?type=my-requests" replace />} />
            <Route path="/alkhayr/requests" element={<Navigate to="/alkhayr/main?type=requests" replace />} />

            {/* Blood Donation (Standalone Refactor) */}
            <Route path="/blood-donation" element={<BloodDonation />} />
            <Route path="/alkhayr/blood/*" element={<Navigate to="/blood-donation" replace />} />

            <Route path="/alkhayr/zero-commission" element={<ZeroCommission />} />
            <Route path="/alkhayr/faq" element={<AlKhayrFAQ />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/:categorySlug" element={<Store />} />
            <Route path="/store/product/:slug" element={<ProductDetails />} />
            <Route path="/exchange" element={<ExchangePage />} />

            <Route path="/import-request" element={<RequestImport />} />
            <Route path="/register-agent" element={<RegisterAgent />} />

            <Route path="/style-guide" element={<StyleGuide />} />

            <Route path="/health" element={<SystemHealth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
