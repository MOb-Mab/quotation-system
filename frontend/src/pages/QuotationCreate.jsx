//frontend/src/pages/QuotationCreate.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiPackage, FiChevronDown, FiX } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuotation, getQuotationById, updateQuotation } from '../services/quotation.service';
import productService from '../services/product.service';
import SuccessPopup from '../components/common/SuccessPopup';

const Field = ({ label, children, className = '', required = false }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ✅ Combobox with Portal
const ProductCombobox = ({ value, onChange, onSelectProduct, products }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes((inputValue || '').toLowerCase())
  );

  const openDropdown = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    openDropdown();
    setHighlighted(-1);
  };

  const handleSelect = (product) => {
    setInputValue(product.name);
    onSelectProduct(product);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
    openDropdown();
  };

  const handleKeyDown = (e) => {
    if (!isOpen && e.key === 'ArrowDown') { openDropdown(); return; }
    if (e.key === 'ArrowDown') setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    else if (e.key === 'ArrowUp') setHighlighted(h => Math.max(h - 1, 0));
    else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === 'Escape') setIsOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        !e.target.closest('[data-combobox-dropdown]')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDropdownStyle(prev => ({ ...prev, top: rect.bottom + 4, left: rect.left }));
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const dropdown = isOpen && (
    <ul
      data-combobox-dropdown
      style={dropdownStyle}
      className="bg-white border rounded shadow-xl max-h-52 overflow-y-auto text-sm"
    >
      {filtered.length === 0 ? (
        <li className="px-3 py-2 text-gray-400 italic">ไม่พบสินค้า — จะบันทึกเป็นชื่อใหม่</li>
      ) : (
        filtered.map((p, i) => (
          <li
            key={p._id ?? p.id ?? i}
            onMouseDown={() => handleSelect(p)}
            onMouseEnter={() => setHighlighted(i)}
            className={`px-3 py-2 cursor-pointer flex justify-between items-center ${
              highlighted === i ? 'bg-yellow-50 text-yellow-800' : 'hover:bg-gray-50'
            }`}
          >
            <span className="font-medium truncate">{p.name}</span>
            <span className="text-xs text-gray-400 ml-2 shrink-0">
              {(p.cost || p.price || p.unit_price || p.selling_price)
                ? `฿${parseFloat(p.cost || p.price || p.unit_price || p.selling_price).toLocaleString()}`
                : '-'}
            </span>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center border rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-2 py-1 text-sm outline-none min-w-0"
          value={inputValue}
          onChange={handleInput}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์หรือเลือกสินค้า..."
        />
        {inputValue && (
          <button type="button" onClick={handleClear} className="px-1 text-gray-400 hover:text-gray-600">
            <FiX size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => { isOpen ? setIsOpen(false) : openDropdown(); inputRef.current?.focus(); }}
          className="px-2 text-gray-400 hover:text-gray-600"
        >
          <FiChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
};

export default function QuotationCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const hasLoadedRef = useRef(false);
  const hasAppliedSelectedProducts = useRef(false);
  const VAT_PERCENT = 7;

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    quotation_number: '',
    issue_date: '',
    validity_days: '',
    expiry_date: '',
    customer_name: '',
    recipient: '',
    customer_address: '',
    coordinator_name: '',
    coordinator_phone: '',
    prepared_by: '',
    prepared_phone: '',
    items: [],
    discount_percent: 0,
    vat_percent: VAT_PERCENT,
    note: `รับประกันอุปกรณ์เป็นระยะเวลา 1 ปี
ลูกค้าชำระได้ทั้งเงินสดและเช็ค
ใบเสนอราคานี้มีกำหนด 30 วัน นับจากวันเสนอราคา
ดำเนินการติดตั้งภายใน 60 วัน หลังจากได้รับการยืนยันการใช้บริการ`,
    status: 'ร่าง'
  });

  // ─── Load products ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Load products error:', err);
      }
    };
    loadProducts();
  }, []);

  // ─── FIX #1: loadQuotation defined BEFORE the useEffect that calls it ─────
  const loadQuotation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuotationById(id);
      const mappedItems = (data.items || []).map(item => ({
        // ─── FIX #4: assign stable id to each item ───────────────────────
        id: crypto.randomUUID(),
        name: item.name || '',
        unit: item.unit || 'ชิ้น',
        cost: parseFloat(item.cost) || 0,
        quantity: parseFloat(item.quantity) || 1,
        margin: parseFloat(item.margin) || 0,
        total: parseFloat(item.total) || 0,
      }));
      setFormData({
        quotation_number: data.quotation_number,
        issue_date: data.issue_date ? new Date(data.issue_date).toISOString().split('T')[0] : '',
        validity_days: data.validity_days || '',
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
        customer_name: data.customer_name,
        recipient: data.recipient || '',
        customer_address: data.customer_address || '',
        prepared_by: data.prepared_by || '',
        prepared_phone: data.prepared_phone || '',
        coordinator_name: data.coordinator_name || '',
        coordinator_phone: data.coordinator_phone || '',
        items: mappedItems,
        discount_percent: parseFloat(data.discount_percent) || 0,
        vat_percent: parseFloat(data.vat_percent) || 7,
        note: data.note || `รับประกันอุปกรณ์เป็นระยะเวลา 1 ปี
ลูกค้าชำระได้ทั้งเงินสดและเช็ค
ใบเสนอราคานี้มีกำหนด 30 วัน นับจากวันเสนอราคา
ดำเนินการติดตั้งภายใน 60 วัน หลังจากได้รับการยืนยันการใช้บริการ`,
        status: data.status || 'ร่าง',
      });
    } catch (err) {
      console.error('Load quotation error:', err);
      alert('ไม่สามารถโหลดข้อมูลได้');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // ─── Restore from sessionStorage or load edit data ───────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) return;
    const savedForm = sessionStorage.getItem('quotationFormData');
    if (savedForm) {
      try {
        const parsedData = JSON.parse(savedForm);
        const restoredItems = (parsedData.items || []).map(item => ({
          ...item,
          id: item.id || crypto.randomUUID(),
        }));
        setFormData({ ...parsedData, items: restoredItems });
        sessionStorage.removeItem('quotationFormData');
        hasLoadedRef.current = true;
        return;
      } catch (err) {
        console.error('Restore error:', err);
      }
    }
    if (isEditMode) {
      loadQuotation();
    }
    hasLoadedRef.current = true;
  }, [id, isEditMode, loadQuotation]);

  // ─── Merge products selected from catalog ────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedProducts');
    if (!stored) return;
    if (hasAppliedSelectedProducts.current) return;
    try {
      const newProducts = JSON.parse(stored);
      if (Array.isArray(newProducts) && newProducts.length > 0) {
        setFormData(prev => {
          const mergedItems = [...prev.items];
          newProducts.forEach(newItem => {
            const existingIndex = mergedItems.findIndex(
              item => item.name === newItem.name && item.cost === newItem.cost
            );
            if (existingIndex !== -1) {
              const existing = mergedItems[existingIndex];
              const newQuantity = existing.quantity + newItem.quantity;
              const cost = existing.cost;
              const margin = existing.margin;
              const priceWithMargin = cost + (cost * margin / 100);
              mergedItems[existingIndex] = {
                ...existing,
                quantity: newQuantity,
                total: priceWithMargin * newQuantity,
              };
            } else {
              mergedItems.push({ ...newItem, id: crypto.randomUUID() });
            }
          });
          return { ...prev, items: mergedItems };
        });
      }
      hasAppliedSelectedProducts.current = true;
      sessionStorage.removeItem('selectedProducts');
    } catch (err) {
      console.error('Error parsing selectedProducts:', err);
    }
  }, []);

  // ─── FIX #3: only recalculate expiry when user actually changes the fields
  //             not when loadQuotation sets expiry_date directly ─────────────
  const prevIssueDate = useRef('');
  const prevValidityDays = useRef('');
  useEffect(() => {
    const issueChanged = formData.issue_date !== prevIssueDate.current;
    const validityChanged = formData.validity_days !== prevValidityDays.current;
    prevIssueDate.current = formData.issue_date;
    prevValidityDays.current = formData.validity_days;

    if (!issueChanged && !validityChanged) return;
    if (formData.issue_date && formData.validity_days) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + parseInt(formData.validity_days || 0));
      setFormData(prev => ({ ...prev, expiry_date: expiryDate.toISOString().split('T')[0] }));
    }
  }, [formData.issue_date, formData.validity_days]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleGoToProductSelection = () => {
    sessionStorage.setItem('quotationFormData', JSON.stringify(formData));
    navigate('/products?selectMode=true');
  };

  // ─── FIX #4: assign stable id on new empty row ───────────────────────────
  const addEmptyRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), name: '', unit: 'ชิ้น', cost: 0, quantity: 1, margin: 0, total: 0 },
      ],
    }));
  };

  const removeItem = useCallback((index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const numericFields = ['cost', 'quantity', 'margin'];
      newItems[index][field] = numericFields.includes(field) ? parseFloat(value) || 0 : value;
      if (['cost', 'quantity', 'margin'].includes(field)) {
        const cost = parseFloat(newItems[index].cost) || 0;
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const margin = parseFloat(newItems[index].margin) || 0;
        newItems[index].total = (cost + cost * margin / 100) * quantity;
      }
      return { ...prev, items: newItems };
    });
  }, []);

  const handleSelectProduct = useCallback((index, product) => {
    const cost = parseFloat(
      product.cost ?? product.price ?? product.unit_price ??
      product.selling_price ?? product.cost_price ?? 0
    ) || 0;
    const unit = product.unit || product.unit_name || product.uom || 'ชิ้น';
    setFormData(prev => {
      const newItems = [...prev.items];
      const quantity = newItems[index].quantity || 1;
      newItems[index] = {
        ...newItems[index],
        name: product.name || product.product_name || '',
        unit,
        cost,
        margin: 0,
        total: cost * quantity,
      };
      return { ...prev, items: newItems };
    });
  }, []);

  const getSellPrice = (item) => {
    const cost = parseFloat(item.cost) || 0;
    const margin = parseFloat(item.margin) || 0;
    return cost + (cost * margin / 100);
  };

  const calculateTotals = () => {
    const subTotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discountAmount = subTotal * (parseFloat(formData.discount_percent) || 0) / 100;
    const afterDiscount = subTotal - discountAmount;
    const vatAmount = afterDiscount * VAT_PERCENT / 100;
    return {
      sub_total: subTotal,
      discount: discountAmount,
      after_discount: afterDiscount,
      vat: vatAmount,
      grand_total: afterDiscount + vatAmount,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    try {
      setLoading(true);
      const totals = calculateTotals();

      // ─── FIX #2: strip discount_percent & item.id before sending ─────────
      const { discount_percent, ...restForm } = formData;
      const cleanItems = formData.items.map(({ id: _id, ...item }) => item);
      const quotationData = {
        ...restForm,
        items: cleanItems,
        issue_date: formData.issue_date || null,
        validity_days: formData.validity_days || null,
        expiry_date: formData.expiry_date || null,
        sub_total: totals.sub_total,
        discount: totals.discount,
        vat: totals.vat,
        grand_total: totals.grand_total,
        created_by: 'admin',
      };

      if (isEditMode) {
        await updateQuotation(id, quotationData);
        setSuccessMessage('แก้ไขใบเสนอราคาสำเร็จ!');
      } else {
        await createQuotation(quotationData);
        setSuccessMessage('สร้างใบเสนอราคาสำเร็จ!');
      }
      setShowSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert('เกิดข้อผิดพลาด: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const preventNonNumeric = (e) => {
    const allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'];
    const isCtrl = e.ctrlKey || e.metaKey;
    if (!/^[0-9]$/.test(e.key) && !allowed.includes(e.key) && !isCtrl) e.preventDefault();
    if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
  };

  const handleInputChange = useCallback((field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleNumberChange = useCallback((field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
  }, []);

  const totals = calculateTotals();

  if (loading && isEditMode && !formData.quotation_number) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SuccessPopup
        open={showSuccess}
        message={successMessage}
        onClose={() => { setShowSuccess(false); navigate('/quotations'); }}
      />

      <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => navigate(-1)}>
        <FiArrowLeft /><span>กลับ</span>
      </div>

      <h1 className="text-2xl font-bold">
        {isEditMode ? 'แก้ไขใบเสนอราคา' : 'สร้างใบเสนอราคาใหม่'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* ข้อมูลใบเสนอราคา */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ข้อมูลใบเสนอราคา</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="เลขที่ใบเสนอราคา" required>
              <input
                className="input"
                value={formData.quotation_number}
                onChange={handleInputChange('quotation_number')}
                placeholder="เช่น N0000001/2568"
                required
              />
            </Field>
            <Field label="วันที่ออกใบเสนอราคา">
              <input className="input" type="date" value={formData.issue_date || ''} onChange={handleInputChange('issue_date')} />
            </Field>
            <Field label="ยืนราคาภายใน (วัน)">
              <input className="input" type="number" min="0" value={formData.validity_days || ''} onChange={handleInputChange('validity_days')} onKeyDown={preventNonNumeric} />
            </Field>
            <Field label="Expire Date">
              <input className="input bg-gray-50" type="date" value={formData.expiry_date || ''} readOnly />
            </Field>
          </div>
        </section>

        {/* ข้อมูลลูกค้า */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="เรียน" required>
              <input className="input" value={formData.recipient} onChange={handleInputChange('recipient')} required />
            </Field>
            <Field label="ชื่อลูกค้า" required>
              <input className="input" value={formData.customer_name} onChange={handleInputChange('customer_name')} required />
            </Field>
          </div>
          <Field label="ที่อยู่ลูกค้า" className="mt-4" required>
            <textarea className="input" rows={3} value={formData.customer_address} onChange={handleInputChange('customer_address')} required />
          </Field>
        </section>

        {/* ผู้ประสานงาน */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ผู้ประสานงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ชื่อผู้ประสานงาน">
              <input className="input" value={formData.coordinator_name} onChange={handleInputChange('coordinator_name')} />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input className="input" value={formData.coordinator_phone} onChange={handleInputChange('coordinator_phone')} />
            </Field>
          </div>
        </section>

        {/* ผู้จัดทำ */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ผู้จัดทำใบเสนอราคา</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ชื่อผู้จัดทำ">
              <input className="input" value={formData.prepared_by} onChange={handleInputChange('prepared_by')} />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input className="input" value={formData.prepared_phone} onChange={handleInputChange('prepared_phone')} />
            </Field>
          </div>
        </section>

        {/* รายการสินค้า */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">รายการสินค้า ({formData.items.length} รายการ)</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={addEmptyRow} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-300">
                <FiPlus /> เพิ่มแถว
              </button>
              <button type="button" onClick={handleGoToProductSelection} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <FiPackage /> เลือกจาก Catalog
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-center w-12">ลำดับ</th>
                  <th className="px-4 py-2 border text-center">สินค้า/รายการ</th>
                  <th className="px-4 py-2 border text-center w-20">จำนวน</th>
                  <th className="px-4 py-2 border text-center w-20">หน่วย</th>
                  <th className="px-4 py-2 border text-center w-28">ราคาทุน</th>
                  <th className="px-4 py-2 border text-center w-24">Margin %</th>
                  <th className="px-4 py-2 border text-center w-28">ราคาขาย/หน่วย</th>
                  <th className="px-4 py-2 border text-center w-28">ราคารวม</th>
                  <th className="px-4 py-2 border text-center w-12"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8 border">
                      กดปุ่ม "เพิ่มแถว" เพื่อเพิ่มรายการ หรือ "เลือกจาก Catalog"
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => {
                    const sellPrice = getSellPrice(item);
                    return (
                      // ─── FIX #4: use stable item.id as key ───────────────
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-center">{index + 1}</td>
                        <td className="px-3 py-2 border min-w-[220px]">
                          <ProductCombobox
                            value={item.name}
                            products={products}
                            onChange={(val) => updateItem(index, 'name', val)}
                            onSelectProduct={(product) => handleSelectProduct(index, product)}
                          />
                        </td>
                        <td className="px-4 py-2 border">
                          <input type="number" className="w-full px-2 py-1 border rounded text-center" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="0" onKeyDown={preventNonNumeric} />
                        </td>
                        <td className="px-4 py-2 border">
                          <input type="text" className="w-full px-2 py-1 border rounded text-center" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} />
                        </td>
                        <td className="px-4 py-2 border">
                          <input type="number" className="w-full px-2 py-1 border rounded text-center" value={item.cost} onChange={(e) => updateItem(index, 'cost', e.target.value)} min="0" step="0.01" onKeyDown={preventNonNumeric} />
                        </td>
                        <td className="px-4 py-2 border">
                          <input type="number" className="w-full px-2 py-1 border rounded text-center" value={item.margin} onChange={(e) => updateItem(index, 'margin', e.target.value)} min="0" onKeyDown={preventNonNumeric} />
                        </td>
                        <td className="px-4 py-2 border text-center">
                          {sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 border text-center font-semibold">
                          {(item.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 border text-center">
                          <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span>รวมเงิน</span>
                <span className="font-semibold">{totals.sub_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ส่วนลด</span>
                <div className="flex items-center gap-2">
                  <input type="number" className="input w-20 text-right" value={formData.discount_percent} onChange={handleNumberChange('discount_percent')} min="0" max="100" onKeyDown={preventNonNumeric} />
                  <span>%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>ราคาหลังหักส่วนลด</span>
                <span className="font-semibold">{totals.after_discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม ({VAT_PERCENT}%)</span>
                <span>{totals.vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>รวมเป็นเงินทั้งสิ้น</span>
                <span className="text-yellow-600">{totals.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </section>

        {/* หมายเหตุ */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">เงื่อนไขและหมายเหตุ</h2>
          <Field label="หมายเหตุเพิ่มเติม" className="mt-4">
            <textarea className="input" rows={3} value={formData.note} onChange={handleInputChange('note')} />
          </Field>
        </section>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-lg hover:bg-gray-50" disabled={loading}>
            ยกเลิก
          </button>
          <button type="submit" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold disabled:opacity-50" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกใบเสนอราคา'}
          </button>
        </div>
      </form>
    </div>
  );
}