import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages Client
import MenuPage from './pages/client/MenuPage';
import CartPage from './pages/client/CartPage';
import OrderStatusPage from './pages/client/OrderStatusPage';
import DishDetailPage from './pages/client/DishDetailPage';
import OrderHistoryPage from './pages/client/OrderHistoryPage';

// Pages Admin
import LoginPage from './pages/admin/LoginPage';
import RegisterPage from './pages/admin/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import DishesPage from './pages/admin/DishesPage';
import CategoriesPage from './pages/admin/categoriespage';
import OrdersPage from './pages/admin/OrdersPage';
import StatsPage from './pages/admin/StatsPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import ProfilePage from './pages/admin/ProfilePage';

function App() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route path="/" element={<MenuPage />} />
      <Route path="/commander" element={<CartPage />} />
      <Route path="/commande/:id" element={<OrderStatusPage />} />
      <Route path="/plat/:id" element={<DishDetailPage />} />
      <Route path="/mes-commandes" element={<OrderHistoryPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/dishes" element={<ProtectedRoute><DishesPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
