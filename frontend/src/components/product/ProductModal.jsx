// frontend/src/components/ProductModal.jsx
// ติดตั้งก่อน: npm install browser-image-compression
import { useState, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';

export default function ProductModal({ open, onClose, onSubmit, product }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', unit: '', price: '', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);   // ✅ NEW
  const [error, setError] = useState(null);         // ✅ NEW

  useEffect(() => {
    if (open) {
      // Reset error/loading ทุกครั้งที่เปิด modal
      setError(null);
      setLoading(false);

      if (product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          unit: product.unit,
          price: product.price.toString(),
          image: null
        });
        setImagePreview(product.imageUrl || null);
      } else {
        setFormData({ name: '', description: '', unit: '', price: '', image: null });
        setImagePreview(null);
      }
    }
  }, [open, product]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [open]);

  // ✅ ใช้ browser-image-compression — ทำงานใน Web Worker ไม่บล็อก UI
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      setFormData(prev => ({ ...prev, image: compressed }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(compressed);
    } finally {
      setCompressing(false);
    }
  };

  // ✅ รอ onSubmit จาก parent — ถ้า throw จะแสดง error ใน modal แทนการปิด
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit || !formData.price) return;

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        price: parseFloat(formData.price),
        image: formData.image,
      };
      if (product) submitData._id = product._id;

      await onSubmit(submitData);
      // ✅ ถ้าสำเร็จ parent จะปิด modal เอง (setOpenModal(false))
    } catch (err) {
      // ✅ ถ้า fail — modal ยังอยู่ แสดง error ให้ user แก้ไขได้เลย
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        onClick={!loading ? onClose : undefined}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white w-full max-w-xl rounded-2xl p-6 relative shadow-2xl transform transition-all duration-300 ease-out ${
            isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          {/* ✅ ซ่อนปุ่มปิดตอนกำลัง upload */}
          {!loading && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-200">
              <FiX size={20} />
            </button>
          )}

          <h2 className="text-xl font-bold mb-4">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

          <form onSubmit={handleSubmit}>
            {/* Upload image */}
            <div className="mb-4">
              <label className="block font-medium mb-2">รูปภาพสินค้า</label>
              <label className={`border-2 border-dashed rounded-lg p-6 text-center block transition-all duration-200 ${
                compressing || loading
                  ? 'border-yellow-300 bg-yellow-50 cursor-wait'
                  : 'border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-yellow-400'
              }`}>
                {compressing ? (
                  <div className="flex flex-col items-center gap-2 text-yellow-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
                    <p className="text-sm font-medium">กำลังบีบอัดรูปภาพ...</p>
                  </div>
                ) : loading && formData.image ? (
                  // ✅ แสดง upload progress แทน preview ตอน loading
                  <div className="flex flex-col items-center gap-2 text-yellow-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
                    <p className="text-sm font-medium">กำลังอัปโหลดรูปภาพไปยัง Cloud...</p>
                  </div>
                ) : imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-32 rounded object-contain" />
                    <p className="text-xs text-gray-400 mt-2">คลิกเพื่อเปลี่ยนรูป</p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500">คลิกเพื่ออัปโหลด</p>
                    <p className="text-xs text-gray-400 mt-1">รูปจะถูกบีบอัดอัตโนมัติก่อน upload</p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={compressing || loading}
                />
              </label>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block font-medium mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="กรอกชื่อสินค้า"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block font-medium mb-1">รายละเอียด</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
                placeholder="รายละเอียดสินค้า"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Unit & Price */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1">หน่วย <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="ชิ้น,ตัว,ตู้ ฯลฯ"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">ราคา <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* ✅ Error message — แสดงเหนือปุ่ม ถ้า API fail */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <span className="font-bold text-base leading-none">!</span>
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={compressing || loading}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                    {formData.image ? 'กำลังอัปโหลด...' : 'กำลังบันทึก...'}
                  </>
                ) : (
                  product ? 'บันทึก' : 'เพิ่มสินค้า'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}