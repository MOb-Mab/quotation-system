//frontend/src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-semibold">เมนู</span>
          <FiX className="cursor-pointer" onClick={onClose} />
        </div>

        <nav className="p-4 space-y-2">
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

          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => goTo('/quotation-settings')}
          >
            ⚙️ ตั้งค่าใบเสนอราคา
          </button>
        </nav>
      </div>
    </>
  );
}