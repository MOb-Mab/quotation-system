// frontend/src/pages/ProductList.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiMinus, FiCheck, FiArrowLeft, FiDownload } from 'react-icons/fi';
import ProductModal from '../components/ProductModal';
import ProductViewModal from '../components/ProductViewModal';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { useRole } from '../hooks/useRole';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const hasConfirmedRef = useRef(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [importWarning, setImportWarning] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState({});
  const [alertModal, setAlertModal] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [toast, setToast] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const isSelectMode = new URLSearchParams(location.search).get('selectMode') === 'true';

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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

  const toggleProductSelection = useCallback((product) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
      if (newSelected[product._id]) {
        delete newSelected[product._id];
      } else {
        newSelected[product._id] = { ...product, quantity: 1 };
      }
      return newSelected;
    });
  }, []);

  const updateProductQuantity = useCallback((productId, change) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
      if (newSelected[productId]) {
        const newQuantity = newSelected[productId].quantity + change;
        newSelected[productId] = {
          ...newSelected[productId],
          quantity: newQuantity < 1 ? 1 : newQuantity
        };
      }
      return newSelected;
    });
  }, []);

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
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;

    const selectedItems = Object.values(selectedProducts).map(product => {
      const margin = product.margin ?? 0;
      const sellPrice = product.price + (product.price * margin / 100);
      return {
        name: product.name,
        unit: product.unit,
        cost: product.price,
        quantity: product.quantity,
        margin: margin,
        total: sellPrice * product.quantity,
      };
    });

    sessionStorage.setItem('selectedProducts', JSON.stringify(selectedItems));
    navigate(-1);
  }, [selectedProducts, navigate]);

  const getTotalSelectedCount = () => Object.keys(selectedProducts).length;

  const handleAddProduct = async (formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('margin', 0);
    if (formData.image) data.append('image', formData.image);
    await api.post('/products', data);
  };

  const handleUpdateProduct = async (formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('margin', 0);
    if (formData.image) data.append('image', formData.image);
    await api.put(`/products/${formData._id}`, data);
  };

  const handleSubmitProduct = async (formData) => {
    try {
      if (formData._id) {
        await handleUpdateProduct(formData);
      } else {
        await handleAddProduct(formData);
      }
      setOpenModal(false);
      setSelectedProduct(null);
      showToast(formData._id ? 'แก้ไขสินค้าสำเร็จ ✓' : 'เพิ่มสินค้าสำเร็จ ✓', 'success');
      fetchProducts();
    } catch (err) {
      console.error('❌ Submit failed:', err);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    await api.delete(`/products/${productToDelete._id}`);
    await fetchProducts();
    setConfirmModal(false);
    setProductToDelete(null);
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('สินค้า');

    ws.columns = [
      { key: 'name',        width: 28 },
      { key: 'description', width: 38 },
      { key: 'price',       width: 14 },
      { key: 'unit',        width: 12 },
    ];

    ws.mergeCells('A1:D1');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'Import Template — สินค้า';
    titleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    ws.mergeCells('A2:D2');
    const subCell = ws.getCell('A2');
    subCell.value = 'กรอกข้อมูลตั้งแต่ Row 4  •  ชื่อสินค้า / รายละเอียด / ราคา เป็น field บังคับ (*)';
    subCell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 18;

    const headerRow = ws.getRow(3);
    headerRow.height = 22;
    const headers = [
      { col: 1, label: 'ชื่อสินค้า *',  color: 'FF1D4ED8' },
      { col: 2, label: 'รายละเอียด *',  color: 'FF1D4ED8' },
      { col: 3, label: 'ราคา *',        color: 'FF1D4ED8' },
      { col: 4, label: 'หน่วย',         color: 'FF15803D' },
    ];
    headers.forEach(({ col, label, color }) => {
      const cell = headerRow.getCell(col);
      cell.value = label;
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    const samples = [
      ['RG-ES106F-P',    'Router Ruijie 6 Port PoE 48V',       810,  'ตัว'],
      ['Switch 24 Port', 'Managed Switch 24 Port Gigabit PoE', 4500, 'ตัว'],
      ['UTP Cable Cat6', 'สายแลน Cat6 ความยาว 305 เมตร',       1200, 'กล่อง'],
    ];
    samples.forEach((rowData, i) => {
      const row = ws.getRow(4 + i);
      row.height = 18;
      rowData.forEach((val, c) => {
        const cell = row.getCell(c + 1);
        cell.value = val;
        cell.font = { size: 10, color: { argb: 'FF374151' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFEFF6FF' : 'FFFFFFFF' } };
        cell.alignment = { horizontal: c >= 2 ? 'center' : 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' },
        };
      });
    });

    for (let r = 7; r <= 16; r++) {
      const row = ws.getRow(r);
      row.height = 18;
      for (let c = 1; c <= 4; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r % 2 === 0 ? 'FFFAFAFA' : 'FFFFFFFF' } };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' },
        };
      }
    }

    ws.mergeCells('A17:D17');
    const legendCell = ws.getCell('A17');
    legendCell.value = 'สีน้ำเงิน = บังคับกรอก    สีเขียว = ไม่บังคับ (หน่วย default = ชิ้น)';
    legendCell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
    legendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    legendCell.alignment = { horizontal: 'center' };
    ws.getRow(17).height = 16;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Import_Template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { range: 2 })
          .filter(row => {
            const name = String(row['ชื่อสินค้า *'] || row['ชื่อสินค้า'] || row['name'] || '').trim();
            return name && !name.startsWith('สีน้ำเงิน');
          });

        const validProducts = [];
        const invalidProducts = [];

        rows.forEach((row, i) => {
          const product = {
            name:        row['ชื่อสินค้า *'] || row['ชื่อสินค้า']  || row['name']        || '',
            description: row['รายละเอียด *'] || row['รายละเอียด'] || row['description'] || '',
            price:       parseFloat(row['ราคา *'] || row['ราคา'] || row['ราคาทุน'] || row['price'] || 0),
            unit:        row['หน่วย'] || row['unit'] || 'ชิ้น',
          };

          const errors = [];
          if (!product.name.trim())        errors.push('ไม่มีชื่อสินค้า');
          if (!product.description.trim()) errors.push('ไม่มีรายละเอียด');
          if (isNaN(product.price) || product.price <= 0) errors.push('ราคาต้องมากกว่า 0');

          if (errors.length > 0) {
            invalidProducts.push({ row: i + 2, name: product.name || '(ว่าง)', errors });
          } else {
            validProducts.push(product);
          }
        });

        const existingNames = products.map(p => p.name.trim().toLowerCase());
        const seenInDoc = [];
        const uniqueProducts    = [];
        const duplicateProducts = [];

        validProducts.forEach(p => {
          const key = p.name.trim().toLowerCase();
          const isDupInSystem = existingNames.includes(key);
          const isDupInDoc    = seenInDoc.includes(key);

          if (isDupInSystem || isDupInDoc) {
            duplicateProducts.push(p);
          } else {
            uniqueProducts.push(p);
            seenInDoc.push(key);
          }
        });

        if (duplicateProducts.length > 0) {
          const dupCount    = duplicateProducts.length;
          const uniqueCount = uniqueProducts.length;

          if (uniqueCount === 0) {
            setAlertModal({
              message: `พบสินค้าซ้ำ ${dupCount} รายการ\n${duplicateProducts.map(p => `• ${p.name}`).join('\n')}\n\nไม่มีสินค้าใหม่ที่จะนำเข้า`,
              type: 'error',
            });
            return;
          }

          setConfirmPopup({
            message: `พบรายการสินค้าซ้ำ ${dupCount} รายการ\n${duplicateProducts.map(p => `• ${p.name}`).join('\n')}\n\nจะนำเข้าเพียง ${uniqueCount} รายการที่ไม่ซ้ำ`,
            confirmLabel: 'นำเข้า',
            cancelLabel: 'ยกเลิก',
            onConfirm: async () => {
              setConfirmPopup(null);
              await proceedImport(uniqueProducts, invalidProducts);
            },
          });
          return;
        }

        await proceedImport(validProducts, invalidProducts);

      } catch (err) {
        console.error('Import error:', err);
        setAlertModal({ message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', type: 'error' });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const proceedImport = async (validProducts, invalidProducts = []) => {
    if (invalidProducts.length > 0) {
      setImportWarning({ validProducts, invalidProducts });
    } else {
      await processImport(validProducts);
    }
  };

  const processImport = async (validProducts) => {
    try {
      const result = await api.post('/products/bulk', validProducts);
      await fetchProducts();
      setImportWarning(null);
      setAlertModal({ message: `นำเข้าสินค้าสำเร็จ ${result.data.inserted} รายการ`, type: 'success' });
    } catch (err) {
      console.error('Bulk import error:', err);
      setAlertModal({ message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', type: 'error' });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBulkSelect = (productId) => {
    setBulkSelected(prev => {
      const next = { ...prev };
      if (next[productId]) delete next[productId];
      else next[productId] = true;
      return next;
    });
  };

  const isAllSelected = filteredProducts.length > 0 &&
    filteredProducts.every(p => bulkSelected[p._id]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setBulkSelected({});
    } else {
      const all = {};
      filteredProducts.forEach(p => { all[p._id] = true; });
      setBulkSelected(all);
    }
  };

  const handleBulkDelete = () => {
    const ids = Object.keys(bulkSelected);
    if (ids.length === 0) return;
    setConfirmPopup({
      message: `ต้องการลบสินค้า ${ids.length} รายการ?`,
      confirmLabel: 'ลบ',
      cancelLabel: 'ยกเลิก',
      onConfirm: async () => {
        setConfirmPopup(null);
        for (const id of ids) {
          await api.delete(`/products/${id}`);
        }
        await fetchProducts();
        setBulkSelected({});
        setBulkDeleteMode(false);
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white font-medium
          flex items-center gap-2 transition-all duration-300
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {toast.type === 'success' ? <FiCheck size={18} /> : <span className="font-bold">!</span>}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {isSelectMode && (
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <FiArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {isSelectMode ? 'เลือกสินค้า' : 'รายการสินค้า'}
          </h1>
        </div>

        {/* ซ่อนปุ่ม admin-only ถ้าเป็น viewer */}
        {!isSelectMode && isAdmin && (
          <div className="flex gap-3">
            {bulkDeleteMode ? (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold"
                >
                  {isAllSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={Object.keys(bulkSelected).length === 0}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-40 flex items-center gap-2"
                >
                  <FiTrash2 />ลบที่เลือก ({Object.keys(bulkSelected).length})
                </button>
                <button
                  onClick={() => { setBulkDeleteMode(false); setBulkSelected({}); }}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={downloadTemplate}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold text-gray-700"
                >
                  <FiDownload size={16} />ดาวน์โหลด Template
                </button>
                <label className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold cursor-pointer">
                  <FiPlus />นำเข้าข้อมูล
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
                </label>
                <button
                  onClick={() => setBulkDeleteMode(true)}
                  className="bg-white border border-red-300 hover:bg-red-50 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
                >
                  <FiTrash2 />เลือกลบ
                </button>
                <button
                  onClick={() => { setSelectedProduct(null); setOpenModal(true); }}
                  className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
                >
                  <FiPlus />เพิ่มสินค้าใหม่
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
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
            <FiCheck />ยืนยันการเลือก
          </button>
        </div>
      )}

      {/* Search */}
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
        <div className="text-center text-gray-400 py-20">ไม่พบสินค้า</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts[product._id];
            return (
              <div
                key={product._id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all relative ${
                  isSelectMode || bulkDeleteMode ? 'cursor-pointer' : ''
                } ${isSelected ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''} ${
                  bulkSelected[product._id] ? 'ring-4 ring-red-400 bg-red-50' : ''
                }`}
                onClick={() => {
                  if (isSelectMode) toggleProductSelection(product);
                  if (bulkDeleteMode) toggleBulkSelect(product._id);
                }}
              >
                {/* Checkbox bulk delete */}
                {bulkDeleteMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      bulkSelected[product._id] ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
                    }`}>
                      {bulkSelected[product._id] && <FiCheck size={14} className="text-white" />}
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-3" />
                  ) : (
                    <span className="text-gray-400">ไม่มีรูป</span>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full p-2 z-10">
                      <FiCheck size={18} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-base line-clamp-1">{product.name}</h3>
                  {product.description ? (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                  ) : (
                    <p className="text-xs text-transparent mt-0.5 select-none">-</p>
                  )}
                  <p className="mt-2 text-lg font-bold text-yellow-600">฿{product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">หน่วย: {product.unit}</p>

                  {/* Select Mode: Quantity Controls */}
                  {isSelectMode && isSelected && (
                    <div
                      className="flex items-center justify-center gap-3 mt-3 bg-white rounded-lg p-2 border-2 border-yellow-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateProductQuantity(product._id, -1); }}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={isSelected.quantity}
                        onChange={(e) => updateProductQuantityByInput(product._id, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === '' || Number(e.target.value) < 1) {
                            updateProductQuantityByInput(product._id, 1);
                          }
                        }}
                        className="font-bold text-base w-16 text-center border rounded px-2 py-1
                                   focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white
                                   [appearance:textfield]
                                   [&::-webkit-outer-spin-button]:appearance-none
                                   [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateProductQuantity(product._id, 1); }}
                        className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  )}

                  {/* Normal Mode: Action Buttons — ซ่อนปุ่ม edit ถ้า viewer */}
                  {!isSelectMode && !bulkDeleteMode && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setViewModal(true); }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                      >
                        <FiEye size={16} /><span className="text-sm">ดู</span>
                      </button>

                      {/* ซ่อนปุ่มแก้ไขถ้าเป็น viewer */}
                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setOpenModal(true); }}
                          className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                        >
                          <FiEdit2 size={16} /><span className="text-sm">แก้ไข</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Warning Modal */}
      {importWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-bold mb-1">พบข้อมูลที่มีปัญหา</h2>
            <p className="text-sm text-gray-500 mb-4">
              พบ {importWarning.invalidProducts.length} row ที่ไม่สามารถนำเข้าได้
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto mb-4">
              {importWarning.invalidProducts.map((p, i) => (
                <div key={i} className="flex gap-2 text-sm py-1 border-b border-red-100 last:border-0">
                  <span className="text-red-500 font-medium whitespace-nowrap">Row {p.row}</span>
                  <span className="text-gray-600 truncate">{p.name}</span>
                  <span className="text-red-400 ml-auto whitespace-nowrap">{p.errors.join(', ')}</span>
                </div>
              ))}
            </div>
            {importWarning.validProducts.length > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                จะนำเข้าเฉพาะ{' '}
                <span className="font-semibold text-green-600">{importWarning.validProducts.length} รายการ</span>
                {' '}ที่ถูกต้อง
              </p>
            ) : (
              <p className="text-sm text-red-600 mb-4 font-medium">ไม่มีรายการที่สามารถนำเข้าได้เลย</p>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setImportWarning(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                ยกเลิก
              </button>
              {importWarning.validProducts.length > 0 && (
                <button
                  onClick={() => processImport(importWarning.validProducts)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
                >
                  นำเข้า {importWarning.validProducts.length} รายการ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Popup */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              alertModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {alertModal.type === 'success' ? (
                <FiCheck size={28} className="text-green-600" />
              ) : (
                <span className="text-red-600 text-2xl font-bold">!</span>
              )}
            </div>
            <p className="text-gray-700 font-medium mb-6 whitespace-pre-line">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal(null)}
              className={`px-8 py-2 rounded-lg font-semibold text-white ${
                alertModal.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Confirm Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-gray-700 font-medium mb-6 whitespace-pre-line">{confirmPopup.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => confirmPopup.onCancel ? confirmPopup.onCancel() : setConfirmPopup(null)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-semibold"
              >
                {confirmPopup.cancelLabel || 'ยกเลิก'}
              </button>
              <button
                onClick={confirmPopup.onConfirm}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
              >
                {confirmPopup.confirmLabel || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        open={openModal}
        onClose={() => { setOpenModal(false); setSelectedProduct(null); }}
        onSubmit={handleSubmitProduct}
        product={selectedProduct}
      />
      <ProductViewModal
        open={viewModal}
        onClose={() => { setViewModal(false); setSelectedProduct(null); }}
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