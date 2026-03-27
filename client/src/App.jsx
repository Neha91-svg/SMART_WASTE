import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/report-waste" element={<ReportWaste />} />
          <Route path="/request-pickup" element={<RequestPickup />} />
          <Route path="/map" element={<MapVisualization />} />
          <Route path="/ewaste-centers" element={<EWasteCenters />} />
          <Route path="/efficiency" element={<Efficiency />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
