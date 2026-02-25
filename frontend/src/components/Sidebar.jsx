// frontend/src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { FiX, FiLogOut } from 'react-icons/fi';

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50
          transform transition-transform duration-300 flex flex-col
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-semibold">เมนู</span>
          <FiX className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-2 flex-1">
          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => goTo('/quotations')}
          >
            📄 ใบเสนอราคา
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => goTo('/products')}
          >
            📦 รายการสินค้า
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </>
  );
}