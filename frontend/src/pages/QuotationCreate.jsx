import { useState, useEffect, useCallback, useRef } from 'react';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuotation, getQuotationById, updateQuotation } from '../services/quotation.service';
import SuccessPopup from '../components/SuccessPopup';

const Field = ({ label, children, className = '', required = false }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

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

  // State สำหรับเปิด-ปิด date fields

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
    status: 'draft'
  });

 

  useEffect(() => {
    if (hasLoadedRef.current) return;
  
    const savedForm = sessionStorage.getItem('quotationFormData');
  
    if (savedForm) {
      try {
        const parsedData = JSON.parse(savedForm);
        console.log('📋 Restored from sessionStorage:', parsedData.items.length, 'items');
        setFormData(parsedData);
        // ตรวจสอบว่ามี date fields หรือไม่เพื่อ set toggle
        
        sessionStorage.removeItem('quotationFormData');
        hasLoadedRef.current = true;
        return;
      } catch (err) {
        console.error('Restore error:', err);
      }
    }
  
    if (isEditMode) {
      console.log('📡 Loading from API (only once)');
      loadQuotation();
    } else {
      generateQuotationNumber();
    }
  
    hasLoadedRef.current = true;
  }, [id]);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedProducts');
  
    if (!stored) return;
    if (hasAppliedSelectedProducts.current) return;
  
    try {
      const newProducts = JSON.parse(stored);
      console.log('📦 Adding', newProducts.length, 'new products');
  
      if (Array.isArray(newProducts) && newProducts.length > 0) {
        setFormData(prev => ({
          ...prev,
          items: [...prev.items, ...newProducts],
        }));
      }
  
      hasAppliedSelectedProducts.current = true;
      sessionStorage.removeItem('selectedProducts');
    } catch (err) {
      console.error('Error parsing selectedProducts:', err);
    }
  }, []);

  // Auto-calculate expiry date เมื่อเปิด date fields
  useEffect(() => {
    if (formData.issue_date && formData.validity_days) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(
        expiryDate.getDate() + parseInt(formData.validity_days || 0)
      );
  
      setFormData(prev => ({
        ...prev,
        expiry_date: expiryDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.issue_date, formData.validity_days]);
  

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const data = await getQuotationById(id);
      
      const mappedItems = (data.items || []).map(item => ({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'ชิ้น',
        cost: parseFloat(item.cost) || 0,
        quantity: parseFloat(item.quantity) || 1,
        margin: parseFloat(item.margin) || 0,
        total: parseFloat(item.total) || 0
      }));

      

      setFormData({
        quotation_number: data.quotation_number,
        issue_date: data.issue_date ? new Date(data.issue_date).toISOString().split('T')[0] : '',  // ✅
  validity_days: data.validity_days || '',  // ✅
  expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',  // ✅
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
        status: data.status || 'draft'
      });
    } catch (err) {
      console.error('Load quotation error:', err);
      alert('ไม่สามารถโหลดข้อมูลได้');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const generateQuotationNumber = () => {
    const now = new Date();
    const year = now.getFullYear() + 543;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const quotationNumber = `QT${year}${month}${day}${random}`;
    setFormData(prev => ({ ...prev, quotation_number: quotationNumber }));
  };

  const handleGoToProductSelection = () => {
    sessionStorage.setItem('quotationFormData', JSON.stringify(formData));
    navigate('/products?selectMode=true');
  };

  const removeItem = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const numericFields = ['cost', 'quantity', 'margin'];
      newItems[index][field] = numericFields.includes(field)
        ? parseFloat(value) || 0
        : value;

      if (field === 'cost' || field === 'quantity' || field === 'margin') {
        const cost = parseFloat(newItems[index].cost) || 0;
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const margin = parseFloat(newItems[index].margin) || 0;
        const priceWithMargin = cost + (cost * margin / 100);
        newItems[index].total = priceWithMargin * quantity;
      }

      return { ...prev, items: newItems };
    });
  }, []);

  const calculateTotals = () => {
    const subTotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discountAmount = subTotal * (parseFloat(formData.discount_percent) || 0) / 100;
    const afterDiscount = subTotal - discountAmount;
    const vatAmount = afterDiscount * VAT_PERCENT / 100;
    const grandTotal = afterDiscount + vatAmount;

    return {
      sub_total: subTotal,
      discount: discountAmount,
      after_discount: afterDiscount,
      vat: vatAmount,
      grand_total: grandTotal
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (formData.items.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();
      const quotationData = {
        quotation_number: formData.quotation_number,
        customer_name: formData.customer_name,
        recipient: formData.recipient,
        customer_address: formData.customer_address,
        prepared_by: formData.prepared_by,
        prepared_phone: formData.prepared_phone,
        coordinator_name: formData.coordinator_name,
        coordinator_phone: formData.coordinator_phone,
        issue_date: formData.issue_date || null,
validity_days: formData.validity_days || null,
expiry_date: formData.expiry_date || null,

        items: formData.items,
        sub_total: totals.sub_total,
        discount_percent: formData.discount_percent,
        discount: totals.discount,
        vat_percent: formData.vat_percent,       
        vat: totals.vat,
        grand_total: totals.grand_total,
        note: formData.note,
        status: formData.status,
        created_by: 'admin'
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
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/quotations');
  };

  const preventNonNumeric = (e) => {
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'];
    const isNumber = /^[0-9]$/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    const isCtrlA = (e.ctrlKey || e.metaKey) && e.key === 'a';
    const isCtrlC = (e.ctrlKey || e.metaKey) && e.key === 'c';
    const isCtrlV = (e.ctrlKey || e.metaKey) && e.key === 'v';
    const isCtrlX = (e.ctrlKey || e.metaKey) && e.key === 'x';

    if (!isNumber && !isAllowedKey && !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlX) {
      e.preventDefault();
    }
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
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
        onClose={handleSuccessClose}
      />

      <div
        className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        <span>กลับ</span>
      </div>

      <h1 className="text-2xl font-bold">
        {isEditMode ? 'แก้ไขใบเสนอราคา' : 'สร้างใบเสนอราคาใหม่'}
      </h1>

      <form onSubmit={handleSubmit}>
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">ข้อมูลใบเสนอราคา</h2>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="เลขที่ใบเสนอราคา" required>
              <input className="input bg-gray-50" value={formData.quotation_number} readOnly />
            </Field>
            <Field label="วันที่ออกใบเสนอราคา">
  <input
    className="input"
    type="date"
    value={formData.issue_date || ''}  // ✅ เพิ่ม || ''
    onChange={handleInputChange('issue_date')}
   
  />
</Field>

<Field label="ยืนราคาภายใน (วัน)">
  <input
    className="input"
    type="number"
    min="0"
    value={formData.validity_days || ''}  // ✅ เพิ่ม || ''
    onChange={handleInputChange('validity_days')}
    onKeyDown={preventNonNumeric}
    
  />
</Field>

<Field label="Expire Date">
  <input 
    className="input bg-gray-50" 
    type="date" 
    value={formData.expiry_date || ''}  // ✅ เพิ่ม || ''
    readOnly
  />
</Field>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="เรียน" required>
              <input 
              className="input" 
              value={formData.recipient} 
              onChange={handleInputChange('recipient')}
              required />
            </Field>
            <Field label="ชื่อลูกค้า" required>
              <input
                className="input"
                value={formData.customer_name}
                onChange={handleInputChange('customer_name')}
                required
              />
            </Field>
          </div>
          <Field label="ที่อยู่ลูกค้า" className="mt-4"required>
            <textarea
              className="input"
              rows={3}
              value={formData.customer_address}
              onChange={handleInputChange('customer_address')}
              required
            />
          </Field>
          
          
        </section>

        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ผู้ประสานงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ชื่อผู้ประสานงาน">
              <input
                className="input"
                value={formData.coordinator_name}
                onChange={handleInputChange('coordinator_name')}
              />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input
                className="input"
                value={formData.coordinator_phone}
                onChange={handleInputChange('coordinator_phone')}
              />
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">ผู้จัดทำใบเสนอราคา</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ชื่อผู้จัดทำ">
              <input className="input" value={formData.prepared_by} onChange={handleInputChange('prepared_by')} />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input
                className="input"
                value={formData.prepared_phone}
                onChange={handleInputChange('prepared_phone')}
              />
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">รายการสินค้า ({formData.items.length} รายการ)</h2>
            <button
              type="button"
              onClick={handleGoToProductSelection}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FiPlus />
              เพิ่มรายการ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-center w-16">ลำดับ</th>
                  <th className="px-4 py-2 border text-left">สินค้า/รายการ</th>
                  <th className="px-4 py-2 border text-center w-24">จำนวน</th>
                  <th className="px-4 py-2 border text-center w-24">หน่วย</th>
                  <th className="px-4 py-2 border text-right w-32">ราคาต่อหน่วย</th>
                  <th className="px-4 py-2 border text-center w-24">Margin %</th>
                  <th className="px-4 py-2 border text-right w-32">ราคารวม</th>
                  <th className="px-4 py-2 border text-center w-16"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-6 border">
                      ยังไม่มีรายการสินค้า กดปุ่ม "เพิ่มรายการ" เพื่อเพิ่มสินค้า
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{index + 1}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="ชื่อสินค้า"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="0"
                          onKeyDown={preventNonNumeric}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded text-center"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-right"
                          value={item.cost}
                          onChange={(e) => updateItem(index, 'cost', e.target.value)}
                          min="0"
                          step="0.01"
                          onKeyDown={preventNonNumeric}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-center"
                          value={item.margin}
                          onChange={(e) => updateItem(index, 'margin', e.target.value)}
                          min="0"
                          onKeyDown={preventNonNumeric}
                        />
                      </td>
                      <td className="px-4 py-2 border text-right font-semibold">
                        {(item.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
  <div className="w-full md:w-1/3 space-y-2">

    <div className="flex justify-between text-right">
      <span>รวมเงิน</span>
      <span className="font-semibold">
        {totals.sub_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span>ส่วนลด</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input w-20 text-right"
          value={formData.discount_percent}
          onChange={handleNumberChange('discount_percent')}
          min="0"
          max="100"
          onKeyDown={preventNonNumeric}
        />
        <span>%</span>
      </div>
    </div>

    <div className="flex justify-between text-right">
      <span>ราคาหลังหักส่วนลด</span>
      <span className="font-semibold">
        {totals.after_discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <div className="flex justify-between text-right">
      <span>ภาษีมูลค่าเพิ่ม ({VAT_PERCENT}%)</span>
      <span>
        {totals.vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <div className="flex justify-between font-bold text-lg pt-2 border-t">
      <span>รวมเป็นเงินทั้งสิ้น</span>
      <span className="text-yellow-600">
        {totals.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </span>
    </div>

  </div>
</div>

        </section>

        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">เงื่อนไขและหมายเหตุ</h2>
          <Field label="หมายเหตุเพิ่มเติม" className="mt-4">
            <textarea
              className="input"
              rows={3}
              value={formData.note}
              onChange={handleInputChange('note')}
            />
          </Field>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกใบเสนอราคา'}
          </button>
        </div>
      </form>
    </div>
  );
}