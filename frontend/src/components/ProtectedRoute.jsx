import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div role="status" className="min-h-screen flex items-center justify-center text-inktext/50">Memuat...</div>;
  if (!user) return <Navigate to="/portal-dukteksi/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/portal-dukteksi/login" replace />;
  }

  // Paksa prajurit mengganti password sementara sebelum akses dashboard
  if (user.role === 'soldier' && user.must_change_password && !location.pathname.endsWith('/ganti-password')) {
    return <Navigate to="/soldier/ganti-password" replace />;
  }

  return children;
}