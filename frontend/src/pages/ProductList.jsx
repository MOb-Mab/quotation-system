//frontend/src/pages/ProductList.jsx
import { useState, useEffect, useCallback,useRef} from 'react';
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiMinus, FiCheck, FiArrowLeft } from 'react-icons/fi';
import ProductModal from '../components/ProductModal';
import ProductViewModal from '../components/ProductViewModal';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const hasConfirmedRef = useRef(false);
  // State สำหรับ Select Mode
  const [selectedProducts, setSelectedProducts] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const isSelectMode = new URLSearchParams(location.search).get('selectMode') === 'true';

  /* =======================
     FETCH PRODUCTS
  ======================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('❌ Fetch products failed:', err);
    }
  };

  useEffect(() => {
    if (isSelectMode) {
      setSelectedProducts({});
      hasConfirmedRef.current = false;
    }
  }, [isSelectMode]);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  
  
  /* =======================
     SELECT MODE FUNCTIONS
  ======================= */
  const toggleProductSelection = useCallback((product) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
      
      if (newSelected[product._id]) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        delete newSelected[product._id];
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไปด้วยจำนวน 1
        newSelected[product._id] = {
          ...product,
          quantity: 1
        };
      }
      
      return newSelected;
    });
  }, []);

  const updateProductQuantity = useCallback((productId, change) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
      
      if (newSelected[productId]) {
        const currentQuantity = newSelected[productId].quantity;
        const newQuantity = currentQuantity + change;
        
        // ✅ ถ้าจำนวนน้อยกว่า 1 ให้เซ็ตเป็น 1
        if (newQuantity < 1) {
          newSelected[productId] = {
            ...newSelected[productId],
            quantity: 1
          };
        } else {
          newSelected[productId] = {
            ...newSelected[productId],
            quantity: newQuantity
          };
        }
      }
      
      return newSelected;
    });
  }, []);

  // ✅ ฟังก์ชันใหม่: อัปเดตจำนวนโดยการพิมพ์ตัวเลข
  const updateProductQuantityByInput = useCallback((productId, value) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
  
      if (newSelected[productId]) {
        newSelected[productId] = {
          ...newSelected[productId],
          quantity: value === '' ? '' : Number(value)
        };
      }
  
      return newSelected;
    });
  }, []);
  

  const confirmSelection = useCallback(() => {
    if (hasConfirmedRef.current) return; // 🛑 กันส่งซ้ำ
    hasConfirmedRef.current = true;
  
    const selectedItems = Object.values(selectedProducts).map(product => ({
      name: product.name,
      unit: product.unit,
      cost: product.price,
      quantity: product.quantity,
      margin: 0,
      total: product.price * product.quantity,
    }));
  
    console.log('🚀 Sending products:', selectedItems);
  
    sessionStorage.setItem(
      'selectedProducts',
      JSON.stringify(selectedItems)
    );
  
    navigate(-1);
  }, [selectedProducts, navigate]);
  

  const getTotalSelectedCount = () => {
    return Object.keys(selectedProducts).length;
  };

  /* =======================
     ADD PRODUCT
  ======================= */
  const handleAddProduct = async (formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('status', formData.status);
    if (formData.image) data.append('image', formData.image);

    await api.post('/products', data);
  };

  /* =======================
     UPDATE PRODUCT
  ======================= */
  const handleUpdateProduct = async (formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('status', formData.status);
    if (formData.image) data.append('image', formData.image);

    await api.put(`/products/${formData._id}`, data);
  };

  /* =======================
     SUBMIT (ADD / EDIT)
  ======================= */
  const handleSubmitProduct = async (formData) => {
    try {
      if (formData._id) {
        await handleUpdateProduct(formData);
      } else {
        await handleAddProduct(formData);
      }
      await fetchProducts();
      setOpenModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('❌ Submit failed:', err);
    }
  };

  /* =======================
     DELETE
  ======================= */
  const handleDeleteConfirm = async () => {
    await api.delete(`/products/${productToDelete._id}`);
    await fetchProducts();
    setConfirmModal(false);
    setProductToDelete(null);
  };

  /* =======================
     SEARCH FILTER
  ======================= */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {isSelectMode && (
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {isSelectMode ? 'เลือกสินค้า' : 'รายการสินค้า'}
          </h1>
        </div>
        
        {!isSelectMode && (
          <button
            onClick={() => {
              setSelectedProduct(null);
              setOpenModal(true);
            }}
            className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
          >
            <FiPlus />
            เพิ่มสินค้าใหม่
          </button>
        )}
      </div>

      {/* Selection Summary (Select Mode) */}
      {isSelectMode && getTotalSelectedCount() > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="font-semibold">เลือกแล้ว {getTotalSelectedCount()} รายการ</p>
            <p className="text-sm text-gray-600">
              รวม {Object.values(selectedProducts).reduce((sum, p) => sum + p.quantity, 0)} ชิ้น
            </p>
          </div>
          <button
            onClick={confirmSelection}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <FiCheck />
            ยืนยันการเลือก
          </button>
        </div>
      )}

      {/* 🔍 Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          ไม่พบสินค้า
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts[product._id];
            
            return (
              <div
                key={product._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                  isSelectMode ? 'cursor-pointer hover:shadow-lg' : ''
                } ${
                  isSelected ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''
                }`}
                onClick={() => {
                  if (isSelectMode) {
                    toggleProductSelection(product);
                  }
                }}
              >
                <div className="h-56 bg-gray-100 flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">ไม่มีรูป</span>
                  )}
                  
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full p-2">
                      <FiCheck size={20} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="mt-1">฿{product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    หน่วย: {product.unit}
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      product.status === 'ใช้งาน'
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    สถานะ: {product.status}
                  </p>

                  {/* Select Mode: Quantity Controls */}
                  {isSelectMode && isSelected && (
                    <div 
                      className="flex items-center justify-center gap-3 mt-3 bg-white rounded-lg p-2 border-2 border-yellow-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProductQuantity(product._id, -1);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      
                      {/* ✅ Input สำหรับพิมพ์ตัวเลข */}
                      <input
  type="number"
  min="1"
  value={isSelected.quantity}
  onChange={(e) => {
    updateProductQuantityByInput(product._id, e.target.value);
  }}
  onBlur={(e) => {
    if (e.target.value === '' || Number(e.target.value) < 1) {
      updateProductQuantityByInput(product._id, 1);
    }
  }}
  className="font-bold text-lg w-20 text-center border rounded px-2 py-1
             focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white
             [appearance:textfield]
             [&::-webkit-outer-spin-button]:appearance-none
             [&::-webkit-inner-spin-button]:appearance-none"
/>

                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProductQuantity(product._id, 1);
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  )}

                  {/* Normal Mode: Action Buttons */}
                  {!isSelectMode && (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setViewModal(true);
                        }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded flex items-center justify-center gap-1"
                      >
                        <FiEye />
                        <span className="text-sm">ดู</span>
                      </button>

                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setOpenModal(true);
                        }}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-2 rounded flex items-center justify-center gap-1"
                      >
                        <FiEdit2 />
                        <span className="text-sm">แก้ไข</span>
                      </button>

                      <button 
                        onClick={() => {
                          setProductToDelete(product);
                          setConfirmModal(true);
                        }}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded flex items-center justify-center gap-1"
                      >
                        <FiTrash2 />
                        <span className="text-sm">ลบ</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        product={selectedProduct}
      />

      <ProductViewModal
        open={viewModal}
        onClose={() => {
          setViewModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      <ConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="ลบสินค้า"
        message={`ลบ ${productToDelete?.name} ?`}
      />
    </div>
  );
}
