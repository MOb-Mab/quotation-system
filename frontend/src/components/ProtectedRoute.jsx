// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children }) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;

    const decoded = jwtDecode(token);

    // token หมดอายุ
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch {
    // token invalid หรือถูกแก้
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
}