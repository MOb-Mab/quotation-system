// frontend/src/hooks/useRole.js
import { jwtDecode } from 'jwt-decode';

export function useRole() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { role: null, isAdmin: false, isViewer: false };

    const decoded = jwtDecode(token);

    // token หมดอายุ → ล้างทิ้งเลย
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return { role: null, isAdmin: false, isViewer: false };
    }

    return {
      role:     decoded.role,
      username: decoded.username,
      isAdmin:  decoded.role === 'admin',
      isViewer: decoded.role === 'viewer',
    };
  } catch {
    // token ถูกแก้ / invalid → ถือว่าไม่มีสิทธิ์
    localStorage.removeItem('token');
    return { role: null, isAdmin: false, isViewer: false };
  }
}