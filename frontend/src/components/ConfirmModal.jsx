// components/ConfirmModal.jsx
// รวม ConfirmDeleteModal + ConfirmModal เป็นตัวเดียว
// ลบ ConfirmDeleteModal.jsx ทิ้งได้เลย
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiHelpCircle, FiInfo } from 'react-icons/fi';

const VARIANTS = {
  danger: {
    icon: FiAlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
  },
  warning: {
    icon: FiHelpCircle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
    confirmBtn: 'bg-yellow-400 hover:bg-yellow-500 text-black',
  },
  info: {
    icon: FiInfo,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
}) {
  const [isVisible, setIsVisible]     = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [open]);

  if (!isVisible) return null;

  const { icon: Icon, iconBg, iconColor, confirmBtn } = VARIANTS[variant] ?? VARIANTS.danger;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl
            transform transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={iconColor} size={32} />
            </div>
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
          )}

          {/* Message */}
          <p className="text-gray-600 text-center mb-6 whitespace-pre-line">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors duration-200"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}