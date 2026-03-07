// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import QuotationList from './pages/QuotationList';
import QuotationCreate from './pages/QuotationCreate';
import QuotationPreview from './pages/QuotationPreview';
import ProductList from './pages/ProductList';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { useRole } from './hooks/useRole';

// ── กัน route ที่ viewer ไม่ควรเข้าได้ ──
function AdminRoute({ children }) {
  const { isAdmin } = useRole();
  return isAdmin ? children : <Navigate to="/quotations" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Login (ไม่มี layout) */}
        <Route path="/login" element={<Login />} />

        {/* กลุ่มหน้าที่ต้องมี Header + Sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/quotations" element={<QuotationList />} />

          {/* Admin only — viewer เข้าแล้ว redirect กลับ /quotations */}
          <Route
            path="/quotations/create"
            element={
              <AdminRoute>
                <QuotationCreate />
              </AdminRoute>
            }
          />
          <Route
            path="/quotations/edit/:id"
            element={
              <AdminRoute>
                <QuotationCreate />
              </AdminRoute>
            }
          />

          {/* ทุก role ดูได้ */}
          <Route path="/quotations/:id/preview" element={<QuotationPreview />} />

          {/* Products — viewer เข้าดูได้ แต่ UI จะซ่อนปุ่ม add/edit/delete */}
          <Route path="/products" element={<ProductList />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/quotations" />} />
      </Routes>
    </Router>
  );
}

export default App;