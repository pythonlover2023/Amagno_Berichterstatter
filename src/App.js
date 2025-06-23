import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VaultSelection from './pages/VaultSelection';
import ReportDashboard from './pages/ReportDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/vaults" element={<VaultSelection />} />
        <Route path="/reports" element={<ReportDashboard />} />
      </Routes>
    </div>
  );
}

export default App;