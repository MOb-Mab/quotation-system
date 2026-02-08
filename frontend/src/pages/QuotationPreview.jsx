// frontend/src/pages/QuotationPreview.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotationById } from '../services/quotation.service';
import { getSettings } from '../services/quotationSettings.service';
import QuotationDocument from '../components/quotation/QuotationDocument';
import { FiPrinter, FiDownload, FiEdit, FiArrowLeft } from 'react-icons/fi';

export default function QuotationPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotationData, settingsData] = await Promise.all([
        getQuotationById(id),
        getSettings()
      ]);
      setQuotation(quotationData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('กำลังพัฒนาฟีเจอร์นี้');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!quotation || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ไม่พบข้อมูลใบเสนอราคา</p>
          <button
            onClick={() => navigate('/quotations')}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-sm border-b print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/quotations')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft size={20} />
                <span>กลับ</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold">
                ใบเสนอราคา {quotation.quotation_number}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/quotations/edit/${id}`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
              >
                <FiEdit size={18} />
                <span>แก้ไข</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
              >
                <FiDownload size={18} />
                <span>ดาวน์โหลด PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
              >
                <FiPrinter size={18} />
                <span>พิมพ์</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 print:p-0">
        <QuotationDocument quotation={quotation} settings={settings} />
      </div>
    </div>
  );
}