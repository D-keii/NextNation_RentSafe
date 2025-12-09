import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import TenantDashboard from "./pages/TenantDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import ListingDetails from "./pages/ListingDetails";
import Applications from "./pages/Applications";
import ApplicationReview from "./pages/ApplicationReview";
import Contracts from "./pages/Contracts";
import ViewContract from "./pages/ViewContract";
import UploadPhotos from "./pages/UploadPhotos";
import Escrow from "./pages/Escrow";
import Profile from "./pages/Profile";
import SavedListings from "./pages/SavedListings";
import RentalHistory from "./pages/RentalHistory";
import Properties from "./pages/Properties";
import AddProperty from "./pages/AddProperty";
import PropertyVerification from "./pages/PropertyVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.profileComplete) {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
}

function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'landlord') {
    return <LandlordDashboard />;
  }
  
  return <TenantDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ProtectedRoute><ListingDetails /></ProtectedRoute>} />
      <Route path="/listings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/applications/:id/review" element={<ProtectedRoute><ApplicationReview /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/contracts/:id" element={<ProtectedRoute><ViewContract /></ProtectedRoute>} />
      <Route path="/contracts/:id/upload-photos" element={<ProtectedRoute><UploadPhotos /></ProtectedRoute>} />
      <Route path="/escrow" element={<ProtectedRoute><Escrow /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedListings /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><RentalHistory /></ProtectedRoute>} />
      <Route path="/tenants" element={<ProtectedRoute><RentalHistory /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/properties/new" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
      <Route path="/properties/:id" element={<ProtectedRoute><ListingDetails /></ProtectedRoute>} />
      <Route path="/properties/:id/edit" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
      <Route path="/properties/:id/verification" element={<ProtectedRoute><PropertyVerification /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
