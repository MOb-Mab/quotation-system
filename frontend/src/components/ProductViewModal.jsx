// ProductViewModal.jsx
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function ProductViewModal({ open, onClose, product }) {
  const [isVisible, setIsVisible] = useState(false);
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

  if (!isVisible || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/50 z-40
          transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-white w-full max-w-2xl rounded-2xl p-6 relative
            shadow-2xl
            transform transition-all duration-300 ease-out
            ${isAnimating 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
            }
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-200"
          >
            <FiX size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6">รายละเอียดสินค้า</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div>
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
  <img
    src={product.imageUrl}
    alt={product.name}
    className="w-full h-full object-cover"
  />
) : (
  <span className="text-gray-400 text-lg">ไม่มีรูปภาพ</span>
)}

              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">ชื่อสินค้า</label>
                <p className="text-lg font-bold">{product.name}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">รายละเอียด</label>
                <p className="text-gray-700">
                  {product.description || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-sm">หน่วย</label>
                  <p className="text-gray-700 font-medium">{product.unit}</p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">ราคา/หน่วย</label>
                  <p className="text-gray-700 font-bold text-lg">
                    ฿{product.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-sm">สถานะ</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'ใช้งาน' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors duration-200"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </>
  );
}