// frontend/src/services/quotationSettings.service.js
import api from './api';

// ค่าเริ่มต้นของ settings
export const defaultSettings = {
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
  header_color: '#FBBF24',
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
};

const STORAGE_KEY = 'quotationSettings';

// ดึง settings จาก localStorage หรือใช้ค่าเริ่มต้น
export const getSettings = async () => {
  try {
    // TODO: เรียก API จริง
    // const response = await api.get('/quotation-settings');
    // return response.data;
    
    // ตอนนี้ใช้ localStorage ชั่วคราว
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

// บันทึก settings
export const saveSettings = async (settings) => {
  try {
    // TODO: เรียก API จริง
    // const response = await api.put('/quotation-settings', settings);
    // return response.data;
    
    // ตอนนี้บันทึกใน localStorage ชั่วคราว
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// อัปโหลดโลโก้
export const uploadLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    // TODO: เรียก API จริง
    // const response = await api.post('/quotation-settings/logo', formData);
    // return response.data.url;
    
    // ตอนนี้ return base64 ชั่วคราว
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};