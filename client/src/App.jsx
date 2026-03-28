import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportWaste from './pages/ReportWaste';
import RequestPickup from './pages/RequestPickup';
import MapVisualization from './pages/MapVisualization';
import EWasteCenters from './pages/EWasteCenters';
import Efficiency from './pages/Efficiency';
import AIChatbot from './pages/AIChatbot';
import './index.css';

/**
 * Smart Waste Collection & E-Waste Disposal Application
 * Main entry point with React Router navigation & Global Auth Context
 */
export default function App() {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Shared Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/e-waste" element={<EWasteCenters />} />

          {/* User Only Routes */}
          <Route path="/report" element={!isAdmin ? <ReportWaste /> : <Navigate to="/" replace />} />
          <Route path="/pickup" element={!isAdmin ? <RequestPickup /> : <Navigate to="/" replace />} />
          <Route path="/ai-chat" element={!isAdmin ? <AIChatbot /> : <Navigate to="/" replace />} />

          {/* Admin Only Routes */}
          <Route path="/map" element={isAdmin ? <MapVisualization /> : <Navigate to="/" replace />} />
          <Route path="/efficiency" element={isAdmin ? <Efficiency /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
