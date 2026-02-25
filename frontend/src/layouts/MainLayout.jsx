//frontend/src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onMenuClick={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* เนื้อหาของแต่ละหน้า */}
      <main className="pt-16 print:pt-0">
      <Outlet />
      </main>
    </div>
  );
}
