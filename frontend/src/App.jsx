// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import QuotationList from './pages/QuotationList';
import QuotationCreate from './pages/QuotationCreate';
import QuotationPreview from './pages/QuotationPreview';
import ProductList from './pages/ProductList';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

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

          {/* CREATE */}
          <Route path="/quotations/create" element={<QuotationCreate />} />

          {/* EDIT */}
          <Route path="/quotations/edit/:id" element={<QuotationCreate />} />

          {/* PREVIEW */}
          <Route path="/quotations/:id/preview" element={<QuotationPreview />} />

          <Route path="/products" element={<ProductList />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/quotations" />} />
      </Routes>
    </Router>
  );
}

export default App;
