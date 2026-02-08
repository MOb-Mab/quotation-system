// frontend/src/pages/QuotationSettings.jsx
import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import api from '../services/api';

const Field = ({ label, children, className = '', required = false }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default function QuotationSettings() {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [settings, setSettings] = useState({
    // Company Information
    company_name_th: 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)',
    company_name_en: 'National Telecom Public Company Limited',
    company_address: '99 ม.2 ถ.ไร่ขิง อ.สามพราน จ.นครปฐม 73120',
    company_phone: '034 243322',
    company_email: '',
    company_tax_id: '',
    company_website: '',
    
    // Logo
    logo_url: '',
    logo_size: 'medium',
    logo_position: 'left',
    
    // Header Settings
    header_color: '#FBBF24', // yellow-400
    show_company_name: true,
    show_logo: true,
    
    // Footer Settings
    footer_address_line1: '99 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
    footer_address_line2: '99 Chaengwattana Road, Thung Song Hong, Lak Si, Bangkok 10210',
    footer_nt_reference: 'NT001 รหัสบัสด 10065112 กระดานจดหมาย (ใช้กายบอก) หม่งขมัย BK.',
    footer_additional_text: 'พิมพ์โดย : ศูนย์บริการสั่งเติมไป บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042',
    footer_website: 'www.ntplc.co.th',
    footer_contact_center: 'Contact Center 1888',
    footer_tax_info: 'เลขประจำตัวผู้เสียภาษีอากร / Tax ID : 0107564000014',
    footer_background_color: '#FBBF24',
    show_page_number: true,
    
    // Default Terms
    default_validity_days: 30,
    default_payment_terms: 'ชำระเงินภายใน 60 วัน หลังจากได้รับการยืนยันการใช้บริการ',
    default_warranty: 'รับประกันอุปกรณ์เป็นระยะเวลา 1 ปี',
    default_note: `รับประกันอุปกรณ์เป็นระยะเวลา 1 ปี
ลูกค้าชำระได้ทั้งเงินสดและเช็ค
ใบเสนอราคานี้มีกำหนด 30 วัน นับจากวันเสนอราคา
ดำเนินการติดตั้งภายใน 60 วัน หลังจากได้รับการยืนยันการใช้บริการ`,
    
    // Discount & VAT
    default_discount_percent: 0,
    default_vat_percent: 7,
    
    // Signature Settings
    show_signature_section: true,
    signature_title_1: 'ยืนยันคำสั่งซื้อในใบเสนอราคา',
    signature_title_2: 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)\nผู้เสนอราคา (ผู้มีอำนาจลงนาม)',
    signature_title_3: 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)\nผู้อนุมัติ (ผู้มีอำนาจลงนาม)',
  });

  // โหลดการตั้งค่าเดิม
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: เรียก API เพื่อโหลดการตั้งค่า
      // const response = await api.get('/quotation-settings');
      // setSettings(response.data);
      
      // ถ้ามี logo ให้แสดง preview
      if (settings.logo_url) {
        setLogoPreview(settings.logo_url);
      }
    } catch (err) {
      console.error('Load settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setSettings(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setSettings(prev => ({ ...prev, [field]: e.target.checked }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกิน 2MB');
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      // แสดง preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to server
      // uploadLogo(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setSettings(prev => ({ ...prev, logo_url: '' }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // TODO: เรียก API เพื่อบันทึกการตั้งค่า
      // await api.put('/quotation-settings', settings);
      
      alert('บันทึกการตั้งค่าสำเร็จ!');
      console.log('Settings saved:', settings);
    } catch (err) {
      console.error('Save settings error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ตั้งค่าใบเสนอราคา</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <FiSave />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {/* Logo Section */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>โลโก้บริษัท</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_logo}
              onChange={handleCheckboxChange('show_logo')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">แสดงโลโก้</span>
          </label>
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Upload Area */}
          <div className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-h-32 mx-auto"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 mb-2">อัปโหลดโลโก้บริษัท</p>
                  <p className="text-xs text-gray-400">รองรับ PNG, JPG (สูงสุด 2MB)</p>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium"
              >
                เลือกไฟล์
              </label>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="flex-1 space-y-4">
            <Field label="ขนาดโลโก้ (สูง)">
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={settings.logo_size}
                onChange={handleInputChange('logo_size')}
              >
                <option value="small">เล็ก (40px)</option>
                <option value="medium">กลาง (60px)</option>
                <option value="large">ใหญ่ (80px)</option>
              </select>
            </Field>

            <Field label="ตำแหน่งโลโก้">
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={settings.logo_position}
                onChange={handleInputChange('logo_position')}
              >
                <option value="left">ซ้าย</option>
                <option value="center">กลาง</option>
                <option value="right">ขวา</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>ข้อมูลบริษัท</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_company_name}
              onChange={handleCheckboxChange('show_company_name')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">แสดงชื่อบริษัท</span>
          </label>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ชื่อบริษัท (ภาษาไทย)" required>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.company_name_th}
              onChange={handleInputChange('company_name_th')}
            />
          </Field>

          <Field label="ชื่อบริษัท (ภาษาอังกฤษ)">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.company_name_en}
              onChange={handleInputChange('company_name_en')}
            />
          </Field>

          <Field label="ที่อยู่" className="md:col-span-2">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={3}
              value={settings.company_address}
              onChange={handleInputChange('company_address')}
            />
          </Field>

          <Field label="เบอร์โทรศัพท์">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.company_phone}
              onChange={handleInputChange('company_phone')}
            />
          </Field>

          <Field label="อีเมล">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="email"
              value={settings.company_email}
              onChange={handleInputChange('company_email')}
            />
          </Field>

          <Field label="เลขประจำตัวผู้เสียภาษี">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.company_tax_id}
              onChange={handleInputChange('company_tax_id')}
            />
          </Field>

          <Field label="เว็บไซต์">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.company_website}
              onChange={handleInputChange('company_website')}
            />
          </Field>
        </div>
      </section>

      {/* Header Settings */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">ตั้งค่า Header</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="สีพื้นหลัง Header">
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.header_color}
                onChange={handleInputChange('header_color')}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1"
                value={settings.header_color}
                onChange={handleInputChange('header_color')}
                placeholder="#FBBF24"
              />
            </div>
          </Field>

          <Field label="ตัวอย่าง Header">
            <div 
              className="h-10 rounded border flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: settings.header_color }}
            >
              ใบเสนอราคา
            </div>
          </Field>
        </div>
      </section>

      {/* Footer Settings */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">ตั้งค่า Footer</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ที่อยู่บรรทัดที่ 1 (ภาษาไทย)" className="md:col-span-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_address_line1}
              onChange={handleInputChange('footer_address_line1')}
              placeholder="99 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210"
            />
          </Field>

          <Field label="ที่อยู่บรรทัดที่ 2 (ภาษาอังกฤษ)" className="md:col-span-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_address_line2}
              onChange={handleInputChange('footer_address_line2')}
              placeholder="99 Chaengwattana Road, Thung Song Hong, Lak Si, Bangkok 10210"
            />
          </Field>

          <Field label="รหัสอ้างอิง NT" className="md:col-span-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_nt_reference}
              onChange={handleInputChange('footer_nt_reference')}
              placeholder="NT001 รหัสบัสด 10065112 กระดานจดหมาย (ใช้กายบอก) หม่งขมัย BK."
            />
          </Field>

          <Field label="ข้อความเพิ่มเติม" className="md:col-span-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_additional_text}
              onChange={handleInputChange('footer_additional_text')}
              placeholder="พิมพ์โดย : ศูนย์บริการสั่งเติมไป บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042"
            />
          </Field>

          <Field label="เว็บไซต์ (Footer)">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_website}
              onChange={handleInputChange('footer_website')}
              placeholder="www.ntplc.co.th"
            />
          </Field>

          <Field label="Contact Center">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_contact_center}
              onChange={handleInputChange('footer_contact_center')}
              placeholder="Contact Center 1888"
            />
          </Field>

          <Field label="ข้อมูล Tax ID (Footer)" className="md:col-span-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={settings.footer_tax_info}
              onChange={handleInputChange('footer_tax_info')}
              placeholder="เลขประจำตัวผู้เสียภาษีอากร / Tax ID : 0107564000014"
            />
          </Field>

          <Field label="สีพื้นหลัง Footer">
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.footer_background_color}
                onChange={handleInputChange('footer_background_color')}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1"
                value={settings.footer_background_color}
                onChange={handleInputChange('footer_background_color')}
                placeholder="#FBBF24"
              />
            </div>
          </Field>

          <Field label="ตัวอย่าง Footer">
            <div 
              className="h-10 rounded border flex items-center justify-center text-white font-semibold text-xs"
              style={{ backgroundColor: settings.footer_background_color }}
            >
              Footer
            </div>
          </Field>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-page-number"
                checked={settings.show_page_number}
                onChange={handleCheckboxChange('show_page_number')}
                className="w-4 h-4 text-yellow-400 rounded focus:ring-yellow-400"
              />
              <label htmlFor="show-page-number" className="text-sm font-medium">
                แสดงเลขหน้า
              </label>
            </div>
          </div>
        </div>
      </section>

     
      {/* Signature Settings */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>ตั้งค่าส่วนลายเซ็น</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_signature_section}
              onChange={handleCheckboxChange('show_signature_section')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">แสดงส่วนลายเซ็น</span>
          </label>
        </h2>

        <div className="space-y-4">
          <Field label="ช่องลายเซ็นที่ 1 (ลูกค้า)">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={2}
              value={settings.signature_title_1}
              onChange={handleInputChange('signature_title_1')}
            />
          </Field>

          <Field label="ช่องลายเซ็นที่ 2 (ผู้เสนอราคา)">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={3}
              value={settings.signature_title_2}
              onChange={handleInputChange('signature_title_2')}
            />
          </Field>

          <Field label="ช่องลายเซ็นที่ 3 (ผู้อนุมัติ)">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={3}
              value={settings.signature_title_3}
              onChange={handleInputChange('signature_title_3')}
            />
          </Field>
        </div>
      </section>

      {/* Preview Section */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">ตัวอย่างใบเสนอราคา</h2>
        
        <div className="border rounded-lg bg-gray-50">
          {/* Header Preview */}
          <div 
            className="flex items-center justify-between p-4 rounded-t-lg"
            style={{ backgroundColor: settings.header_color }}
          >
            {settings.show_logo && logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-12" />
            )}
            {settings.show_company_name && (
              <div className="text-right">
                <h3 className="font-bold text-white">{settings.company_name_th}</h3>
                <p className="text-sm text-white/90">{settings.company_name_en}</p>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold">ใบเสนอราคา</h2>
              <p className="text-sm text-gray-600">Quotation</p>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>{settings.company_address}</p>
              <p>โทร: {settings.company_phone}</p>
              {settings.company_email && <p>Email: {settings.company_email}</p>}
            </div>
          </div>

          {/* Footer Preview */}
          <div 
            className="p-3 rounded-b-lg text-xs text-white"
            style={{ backgroundColor: settings.footer_background_color }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold">{settings.footer_address_line1}</p>
                <p>{settings.footer_address_line2}</p>
                <p className="mt-1">{settings.footer_nt_reference}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{settings.footer_website} | {settings.footer_contact_center}</p>
                <p>{settings.footer_tax_info}</p>
                <p className="mt-1">{settings.footer_additional_text}</p>
              </div>
            </div>
            {settings.show_page_number && (
              <p className="text-center mt-2 border-t border-white/30 pt-2">หน้า 1 / 1</p>
            )}
          </div>
        </div>
      </section>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <FiSave />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  );
}