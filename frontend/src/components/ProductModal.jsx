// frontend/src/components/ProductModal.jsx
import { useState, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

export default function ProductModal({ open, onClose, onSubmit, product }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (open) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.unit && formData.price) {
      const submitData = {
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        price: parseFloat(formData.price),
        image: formData.image,
      };
      if (product) submitData._id = product._id;
      onSubmit(submitData);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        onClick={onClose}
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
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-200">
            <FiX size={20} />
          </button>

          <h2 className="text-xl font-bold mb-4">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

          <form onSubmit={handleSubmit}>
            {/* Upload image */}
            <div className="mb-4">
              <label className="block font-medium mb-2">รูปภาพสินค้า</label>
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-yellow-400 transition-all duration-200 block">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-32 rounded" />
                    <p className="text-xs text-gray-500 mt-2">คลิกเพื่อเปลี่ยนรูป</p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500">คลิกเพื่ออัปโหลด</p>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block font-medium mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="กรอกชื่อสินค้า"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block font-medium mb-1">รายละเอียด</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={3}
                placeholder="รายละเอียดสินค้า"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Unit & Price */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-medium mb-1">หน่วย <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="ชิ้น, กล่อง"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">ราคา <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                ยกเลิก
              </button>
              <button type="submit" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold transition-colors duration-200">
                {product ? 'บันทึก' : 'เพิ่มสินค้า'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}