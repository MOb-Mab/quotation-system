// frontend/src/components/Header.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiFileText, FiPackage } from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'ใบเสนอราคา', path: '/quotations', icon: FiFileText },
  { label: 'รายการสินค้า', path: '/products',   icon: FiPackage  },
];

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .qs-header {
          font-family: 'Outfit', sans-serif;
        }

        .qs-logo-mark {
          width: 30px;
          height: 30px;
          background: #FBBF24;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #000;
          letter-spacing: -0.5px;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(251,191,36,0.4);
        }

        .qs-brand {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.2px;
        }

        .qs-brand span {
          color: #6B7280;
          font-weight: 400;
        }

        .qs-divider {
          width: 1px;
          height: 20px;
          background: #E5E7EB;
        }

        .qs-nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: #6B7280;
          transition: all 0.15s ease;
          white-space: nowrap;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
        }

        .qs-nav-btn:hover {
          color: #111;
          background: #F9FAFB;
          border-color: #E5E7EB;
        }

        .qs-nav-btn.active {
          color: #111;
          background: #FFFBEB;
          border-color: #FDE68A;
          font-weight: 600;
        }

        .qs-nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: #FBBF24;
          border-radius: 2px;
        }

        .qs-nav-icon {
          opacity: 0.6;
        }
        .qs-nav-btn.active .qs-nav-icon,
        .qs-nav-btn:hover .qs-nav-icon {
          opacity: 1;
        }

        .qs-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #9CA3AF;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .qs-logout:hover {
          color: #EF4444;
          background: #FEF2F2;
          border-color: #FECACA;
        }

        .qs-header-inner {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .qs-header-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #F3F4F6;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
          z-index: 50;
        }

        @media print {
          .qs-header-root { display: none; }
        }
      `}</style>

      <header className="qs-header-root qs-header">
        <div className="qs-header-inner">

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="qs-logo-mark">QS</div>
            <span className="lg-brand-name">
              Quotation <span>System</span>
            </span>
          </div>

          {/* Nav + Logout — ชิดขวา */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`qs-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} className="qs-nav-icon" />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="qs-divider" style={{ margin: '0 6px' }} />

            {/* Logout */}
            <button className="qs-logout" onClick={handleLogout}>
              <FiLogOut size={14} />
              ออกจากระบบ
            </button>
          </div>

        </div>
      </header>
    </>
  );
}