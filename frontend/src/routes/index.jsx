import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import Drivers from '../pages/Drivers';
import Trips from '../pages/Trips';
import Maintenance from '../pages/Maintenance';
import FuelLogs from '../pages/FuelLogs';
import Expenses from '../pages/Expenses';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/vehicles" element={<Vehicles />} />
          <Route path="/dashboard/drivers" element={<Drivers />} />
          <Route path="/dashboard/trips" element={<Trips />} />
          <Route path="/dashboard/maintenance" element={<Maintenance />} />
          <Route path="/dashboard/fuel-logs" element={<FuelLogs />} />
          <Route path="/dashboard/expenses" element={<Expenses />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
