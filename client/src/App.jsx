import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportWaste from './pages/ReportWaste';
import RequestPickup from './pages/RequestPickup';
import MapVisualization from './pages/MapVisualization';
import Heatmap from './pages/Heatmap';
import EWasteCenters from './pages/EWasteCenters';
import Efficiency from './pages/Efficiency';
import AIChatbot from './pages/AIChatbot';
import BusinessDashboard from './pages/BusinessDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminTracker from './pages/AdminTracker';
import AdminCRM from './pages/AdminCRM';
import './index.css';

/**
 * Smart Waste Collection & E-Waste Disposal Application
 * Main entry point with React Router navigation & Global Auth Context
 */
export default function App() {
  const { role } = useAuth();
  
  // Role checks
  const isAdmin = role === 'Admin';
  const isBusiness = role === 'Business';
  const isVendor = role === 'Vendor';
  const isUser = role === 'User';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Shared Routes */}
          <Route path="/" element={isAdmin || isUser ? <Dashboard /> : <Navigate to={isBusiness ? "/business" : "/vendor"} replace />} />
          <Route path="/e-waste" element={<EWasteCenters />} />

          {/* User Only Routes (User & Business can access AI Chat) */}
          <Route path="/report" element={isUser ? <ReportWaste /> : <Navigate to="/" replace />} />
          <Route path="/pickup" element={isUser ? <RequestPickup /> : <Navigate to="/" replace />} />
          <Route path="/ai-chat" element={isUser || isBusiness ? <AIChatbot /> : <Navigate to="/" replace />} />

          {/* Admin Only Routes */}
          <Route path="/tracker" element={isAdmin ? <AdminTracker /> : <Navigate to="/" replace />} />
          <Route path="/crm" element={isAdmin ? <AdminCRM /> : <Navigate to="/" replace />} />
          <Route path="/map" element={isAdmin ? <MapVisualization /> : <Navigate to="/" replace />} />
          <Route path="/heatmap" element={isAdmin ? <Heatmap /> : <Navigate to="/" replace />} />
          <Route path="/efficiency" element={isAdmin ? <Efficiency /> : <Navigate to="/" replace />} />

          {/* Business Only Routes */}
          <Route path="/business" element={isBusiness ? <BusinessDashboard /> : <Navigate to="/" replace />} />

          {/* Vendor Only Routes */}
          <Route path="/vendor" element={isVendor ? <VendorDashboard /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
