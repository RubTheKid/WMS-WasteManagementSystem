import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Home from './pages/Home/Home';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import CreateOrder from './pages/CreateServiceOrder/CreateOrder';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Protected admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-order"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CreateOrder />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect old routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/new-appointment" element={<Navigate to="/admin/create-order" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;