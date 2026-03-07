// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (response.data.success) {
        // เก็บ token แทน role ตรงๆ
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          min-height: 100vh;
          background: #F7F6F3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          padding: 24px;
        }

        .lg-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 20px;
          padding: 44px 40px 36px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 32px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04);
        }

        .lg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .lg-mark {
          width: 36px;
          height: 36px;
          background: #FBBF24;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(251,191,36,0.35);
        }

        .lg-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .lg-brand-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.1px;
          line-height: 1;
        }

        .lg-brand-sub {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 400;
          line-height: 1;
        }

        .lg-heading {
          font-size: 24px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .lg-subheading {
          font-size: 13.5px;
          color: #9CA3AF;
          font-weight: 400;
          margin-bottom: 28px;
          line-height: 1;
        }

        .lg-hdivider {
          height: 1px;
          background: #F0EEE9;
          margin-bottom: 28px;
        }

        .lg-field { margin-bottom: 18px; }

        .lg-label {
          display: block;
          font-size: 12.5px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 7px;
        }

        .lg-input-wrap { position: relative; }

        .lg-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1.5px solid #EBEBEB;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          color: #111;
          background: #FAFAF9;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .lg-input::placeholder { color: #C9C5BE; }

        .lg-input:focus {
          border-color: #FBBF24;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(251,191,36,0.1);
        }

        .lg-input-pw { padding-right: 44px; }

        .lg-eye {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #C9C5BE;
          display: flex;
          padding: 3px;
          border-radius: 5px;
          transition: color 0.12s;
        }
        .lg-eye:hover { color: #6B7280; }

        .lg-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFF5F5;
          border: 1px solid #FED7D7;
          color: #C53030;
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .lg-btn {
          width: 100%;
          height: 46px;
          background: #FBBF24;
          color: #000;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 10px rgba(251,191,36,0.3);
          margin-top: 4px;
        }

        .lg-btn:hover:not(:disabled) {
          background: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(251,191,36,0.4);
        }

        .lg-btn:active:not(:disabled) { transform: translateY(0); }

        .lg-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .lg-spinner-wrap {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lg-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lg-footer {
          text-align: center;
          font-size: 11.5px;
          color: #C9C5BE;
          margin-top: 24px;
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-card">

          <div className="lg-brand">
            <div className="lg-mark">QS</div>
            <div className="lg-brand-text">
              <span className="lg-brand-name">Quotation System</span>
              <span className="lg-brand-sub">NT · ระบบจัดการใบเสนอราคา</span>
            </div>
          </div>

          <h1 className="lg-heading">ยินดีต้อนรับ</h1>
          <p className="lg-subheading">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          <div className="lg-hdivider" />

          <form onSubmit={handleLogin}>
            <div className="lg-field">
              <label className="lg-label">Username</label>
              <input
                type="text"
                className="lg-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="lg-input lg-input-pw"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
                <button type="button" className="lg-eye" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="lg-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? (
                <span className="lg-spinner-wrap">
                  <span className="lg-spinner" /> กำลังเข้าสู่ระบบ...
                </span>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="lg-footer">© 2568 NT Quotation System</p>
        </div>
      </div>
    </>
  );
}