import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportWaste from './pages/ReportWaste';
import RequestPickup from './pages/RequestPickup';
import MapVisualization from './pages/MapVisualization';
import EWasteCenters from './pages/EWasteCenters';
import Efficiency from './pages/Efficiency';
import './index.css';

/**
 * Smart Waste Collection & E-Waste Disposal Application
 * Main entry point with React Router navigation
 */
function App() {
  // Role state: 'user' or 'admin' — controls visible features
  const [role, setRole] = useState('admin');

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout role={role} setRole={setRole} />}>
          {/* Shared Routes */}
          <Route path="/" element={<Dashboard role={role} />} />
          <Route path="/ewaste-centers" element={<EWasteCenters />} />

          {/* User Only Routes */}
          <Route path="/report-waste" element={role === 'user' ? <ReportWaste /> : <Navigate to="/" replace />} />
          <Route path="/request-pickup" element={role === 'user' ? <RequestPickup /> : <Navigate to="/" replace />} />

          {/* Admin Only Routes */}
          <Route path="/map" element={role === 'admin' ? <MapVisualization /> : <Navigate to="/" replace />} />
          <Route path="/efficiency" element={role === 'admin' ? <Efficiency /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
