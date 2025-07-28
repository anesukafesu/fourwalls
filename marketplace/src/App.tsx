
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import ScrollToTop from "./components/Layout/ScrollToTop";
import Layout from "./components/Layout/Layout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyForm from "./pages/PropertyForm";
import MyProperties from "./pages/MyProperties";
import UserProfile from "./pages/UserProfile";
import UserProperties from "./pages/UserProperties";
import UserReviews from "./pages/UserReviews";
import MyReviews from "./pages/MyReviews";
import ManageProfile from "./pages/ManageProfile";
import ProfileSettings from "./pages/ProfileSettings";
import Chat from "./pages/Chat";
import Bookmarks from "./pages/Bookmarks";
import MyReports from "./pages/MyReports";
import MortgageCalculator from "./pages/MortgageCalculator";
import Templates from "./pages/Resources";
import Credits from "./pages/Credits";
import NeighbourhoodGuide from "./pages/NeighbourhoodGuide";
import NeighbourhoodDetails from "./pages/NeighbourhoodDetails";
import Blog from "./pages/Blog";
import BlogEditor from "./pages/admin/BlogEditor";
import FacebookImports from "./pages/FacebookImports";
import ContactUs from "./pages/ContactUs";
import IncidentReport from "./pages/IncidentReport";
import TemplateManagement from "./pages/TemplateManagement";
import ReportAgent from "./pages/ReportAgent";
import ReportListing from "./pages/ReportListing";
import ReportReview from "./pages/ReportReview";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import NotFound from "./pages/NotFound";
import LegalDocument from "./pages/LegalDocument";

// Admin Pages
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import Blogs from "./pages/admin/Blogs";
import LegalDocuments from "./pages/admin/LegalDocuments";
import LegalDocumentEditor from "./pages/admin/LegalDocumentEditor";
import Neighbourhoods from "./pages/admin/Neighbourhoods";
import AdminNeighbourhoodEdit from "./pages/admin/NeighbourhoodEditor";
import AdminCreditSales from "./pages/admin/CreditSales";
import AdminTemplates from "./pages/admin/Templates";
import ContactSubmissions from "./pages/admin/ContactSubmissions";
import DataDeletionRequests from "./pages/admin/DataDeletionRequests";
import IncidentReports from "./pages/admin/IncidentReports";
import AdminChats from "./pages/admin/Chats";
import AdminProperties from "./pages/admin/Properties";
import AdminLayout from "./components/Admin/AdminLayout";
import { ServicesProvider } from "./contexts/ServicesContext";

const queryClient = new QueryClient();

function App() {
  return (
    <ServicesProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <ChatProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="properties" element={<Properties />} />
                  <Route path="properties/create" element={<PropertyForm />} />
                  <Route path="properties/:id" element={<PropertyDetails />} />
                  <Route path="edit-property/:id" element={<PropertyForm />} />
                  <Route path="my-properties" element={<MyProperties />} />
                  <Route path="profile/:userId" element={<UserProfile />} />
                  <Route
                    path="profile/:id/properties"
                    element={<UserProperties />}
                  />
                  <Route path="profile/:id/reviews" element={<UserReviews />} />
                  <Route path="my-reviews" element={<MyReviews />} />
                  <Route path="manage-profile" element={<ManageProfile />} />
                  <Route
                    path="profile-settings"
                    element={<ProfileSettings />}
                  />
                  <Route path="chat" element={<Chat />} />
                  <Route path="chat/:sessionId" element={<Chat />} />
                  <Route path="bookmarks" element={<Bookmarks />} />
                  <Route path="my-reports" element={<MyReports />} />
                  <Route
                    path="mortgage-calculator"
                    element={<MortgageCalculator />}
                  />
                  <Route path="templates" element={<Templates />} />
                  <Route path="credits" element={<Credits />} />
                  <Route
                    path="neighbourhoods"
                    element={<NeighbourhoodGuide />}
                  />
                  <Route
                    path="neighbourhoods/:id"
                    element={<NeighbourhoodDetails />}
                  />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/edit/:id" element={<BlogEditor />} />
                  <Route
                    path="facebook-imports"
                    element={<FacebookImports />}
                  />
                  <Route path="contact" element={<ContactUs />} />
                  <Route path="incident-report" element={<IncidentReport />} />
                  <Route path="templates" element={<TemplateManagement />} />
                  <Route
                    path="report/agent/:agentId"
                    element={<ReportAgent />}
                  />
                  <Route
                    path="report/listing/:propertyId"
                    element={<ReportListing />}
                  />
                  <Route
                    path="report/review/:reviewId"
                    element={<ReportReview />}
                  />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="data-deletion" element={<DataDeletion />} />
                  
                  {/* Legal document route */}
                  <Route path="legal/:documentType" element={<LegalDocument />} />

                  {/* Admin Routes */}
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Analytics />} />
                    <Route path="users" element={<Users />} />
                    <Route path="properties" element={<AdminProperties />} />
                    <Route path="chats" element={<AdminChats />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="blogs" element={<Blogs />} />
                    <Route path="blogs/:id" element={<BlogEditor />} />
                    <Route path="templates" element={<AdminTemplates />} />
                    <Route
                      path="legal-documents"
                      element={<LegalDocuments />}
                    />
                    <Route
                      path="legal-documents/:id"
                      element={<LegalDocumentEditor />}
                    />
                    <Route
                      path="neighbourhoods"
                      element={<Neighbourhoods />}
                    />
                    <Route
                      path="neighbourhoods/:id"
                      element={<AdminNeighbourhoodEdit />}
                    />
                    <Route
                      path="credits"
                      element={<AdminCreditSales />}
                    />
                    <Route
                      path="contact-submissions"
                      element={<ContactSubmissions />}
                    />
                    <Route
                      path="data-deletion-requests"
                      element={<DataDeletionRequests />}
                    />
                    <Route
                      path="incident-reports"
                      element={<IncidentReports />}
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ChatProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ServicesProvider>
  );
}

export default App;
