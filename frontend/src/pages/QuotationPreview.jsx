import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotationById } from '../services/quotation.service';
import { getSettings } from '../services/quotationSettings.service';
import QuotationDocument from '../components/quotation/QuotationDocument';
import { FiPrinter, FiDownload, FiEdit, FiArrowLeft, FiSettings, FiX } from 'react-icons/fi';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ── Toggle Switch Component ──
function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-yellow-400' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </label>
  );
}

export default function QuotationPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Display toggles ──
  const [showLogo, setShowLogo] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(false);

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

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ใบเสนอราคา');

    const COMPANY_NAME = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
    const YELLOW = 'FFFBBF24';
    const BLACK  = 'FF000000';
    const WHITE  = 'FFFFFFFF';
    const GRAY   = 'FFF5F5F5';

    const thin   = { style: 'thin',   color: { argb: BLACK } };
    const border = { top: thin, bottom: thin, left: thin, right: thin };
    const borderT = { top: thin };
    const borderB = { bottom: thin };

    const fmt = (v) => parseFloat(v || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('th-TH') : '';
    const show = (v) => (v && String(v).trim()) ? v : '..............................';
    const getSellPrice = (item) => {
      const cost = parseFloat(item.cost) || 0;
      const margin = parseFloat(item.margin) || 0;
      return cost + (cost * margin / 100);
    };

    const noteLines = quotation.note?.trim()
      ? quotation.note.split('\n').slice(0, 4)
      : ['-', '', '', ''];
    while (noteLines.length < 4) noteLines.push('');

    const subtotalAfterDiscount = (quotation.sub_total || 0) - (quotation.discount || 0);
    const displayDiscountPct = (quotation.discount_percent > 0) ? `${quotation.discount_percent}%` : '.....%';
    const displayDiscount    = (quotation.discount > 0) ? quotation.discount : null;

    sheet.columns = [
      { width: 8  },
      { width: 38 },
      { width: 10 },
      { width: 10 },
      { width: 18 },
      { width: 18 },
    ];

    let r = 1;
    let boxStart = -1;

    boxStart = r;
    try {
      const logoRes = await fetch('/NT logo.png');
      const logoBuffer = await logoRes.arrayBuffer();
      const targetHeight = 50;
      let logoWidth = 130;
      try {
        const blob = new Blob([logoBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            logoWidth = Math.round((img.naturalWidth / img.naturalHeight) * targetHeight);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          img.src = url;
        });
      } catch (_) {}
      const logoId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
      sheet.addImage(logoId, {
        tl: { col: 0, row: r - 1 },
        ext: { width: logoWidth, height: targetHeight },
      });
    } catch (_) {}
    sheet.mergeCells(`A${r}:F${r}`);
    sheet.getRow(r).height = 52;
    r++;

    sheet.mergeCells(`A${r}:F${r}`);
    const titleCell = sheet.getCell(`A${r}`);
    titleCell.value = `${COMPANY_NAME}\nใบเสนอราคา`;
    titleCell.font = { bold: true, size: 11, name: 'Arial' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getRow(r).height = 36;
    r++;

    const leftInfo = [
      `เรียน : ${show(quotation.recipient)}`,
      `ชื่อลูกค้า : ${show(quotation.customer_name)}`,
      `ที่อยู่ลูกค้า : ${show(quotation.customer_address)}`,
      `ผู้ประสานงาน : ${show(quotation.coordinator_name)}`,
      `โทรศัพท์ : ${show(quotation.coordinator_phone)}`,
    ];
    const rightInfo = [
      `เลขที่ใบเสนอราคา : ${show(quotation.quotation_number)}`,
      `วันที่ : ${show(fmtDate(quotation.issue_date))}`,
      `ยืนราคาภายใน (วัน) : ${show(quotation.validity_days)}`,
      `ผู้จัดทำใบเสนอราคา : ${show(quotation.prepared_by)}`,
      `โทรศัพท์ : ${show(quotation.prepared_phone)}`,
    ];

    const infoStart = r;
    leftInfo.forEach((left, i) => {
      sheet.mergeCells(`A${r}:C${r}`);
      sheet.mergeCells(`D${r}:F${r}`);
      const row = sheet.getRow(r);
      const lCell = row.getCell(1);
      const rCell = row.getCell(4);
      lCell.value = left;
      rCell.value = rightInfo[i] || '';
      [lCell, rCell].forEach(c => {
        c.font = { size: 10, name: 'Arial' };
        c.alignment = { vertical: 'middle' };
      });
      row.height = 16;
      r++;
    });

    for (let br = infoStart; br < r; br++) {
      const row = sheet.getRow(br);
      row.getCell(1).border = { left: thin };
      row.getCell(4).border = { right: thin };
    }
    ['A','B','C','D','E','F'].forEach(col => {
      const c = sheet.getCell(`${col}${infoStart}`);
      c.border = { ...c.border, top: thin };
    });

    sheet.mergeCells(`A${r}:F${r}`);
    const svcCell = sheet.getCell(`A${r}`);
    svcCell.value = `${COMPANY_NAME} ขอเสนอราคาบริการระบบ Network รายละเอียดดังนี้`;
    svcCell.font = { size: 10, name: 'Arial' };
    svcCell.alignment = { vertical: 'middle' };
    svcCell.border = { left: thin, right: thin };
    sheet.getRow(r).height = 16;
    r++;

    const tHeaders = ['ลำดับ', 'รายการ', 'จำนวน', 'หน่วย', 'ราคาต่อหน่วย', 'ราคารวม'];
    const tRow = sheet.getRow(r);
    tRow.height = 18;
    tHeaders.forEach((h, i) => {
      const cell = tRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 10, name: 'Arial' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = border;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY } };
    });
    r++;

    const detRow = sheet.getRow(r);
    ['', 'รายละเอียดดังนี้', '', '', '', ''].forEach((v, i) => {
      const cell = detRow.getCell(i + 1);
      cell.value = v;
      cell.border = border;
      cell.font = { size: 10, name: 'Arial' };
    });
    detRow.height = 16;
    r++;

    (quotation.items || []).forEach((item, idx) => {
      const sellPrice = getSellPrice(item);
      const values = [idx + 1, item.name, item.quantity, item.unit, sellPrice, item.total];
      const aligns = ['center', 'left', 'center', 'center', 'right', 'right'];
      const row = sheet.getRow(r);
      row.height = item.description ? 28 : 16;
      values.forEach((val, i) => {
        const cell = row.getCell(i + 1);
        if (i === 1 && item.description) {
          cell.value = `${item.name}\n(${item.description})`;
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        } else {
          cell.value = val;
          cell.alignment = { horizontal: aligns[i], vertical: 'middle' };
        }
        cell.font = { size: 10, name: 'Arial' };
        cell.border = border;
        if (i === 4 || i === 5) cell.numFmt = '#,##0.00';
      });
      r++;
    });

    const summaryRows = [
      ['รวมเงิน',                    quotation.sub_total],
      [`ส่วนลด ${displayDiscountPct}`, displayDiscount],
      ['ราคาหลังหักส่วนลด',          subtotalAfterDiscount],
      [`ภาษีมูลค่าเพิ่ม ${quotation.vat_percent || 7}%`, quotation.vat],
    ];

    summaryRows.forEach(([label, value], i) => {
      sheet.mergeCells(`A${r}:B${r}`);
      sheet.mergeCells(`C${r}:D${r}`);
      const row = sheet.getRow(r);
      row.height = 16;
      const noteCell = row.getCell(1);
      noteCell.value = noteLines[i] || '';
      noteCell.font = { size: 10, name: 'Arial' };
      noteCell.border = border;
      const labelCell = row.getCell(3);
      labelCell.value = label;
      labelCell.font = { size: 10, name: 'Arial' };
      labelCell.alignment = { horizontal: 'right', vertical: 'middle' };
      labelCell.border = border;
      row.getCell(5).border = border;
      const valCell = row.getCell(6);
      valCell.value = value ?? '-';
      if (typeof value === 'number') valCell.numFmt = '#,##0.00';
      valCell.font = { size: 10, name: 'Arial' };
      valCell.alignment = { horizontal: 'right', vertical: 'middle' };
      valCell.border = border;
      r++;
    });

    sheet.mergeCells(`A${r}:B${r}`);
    sheet.mergeCells(`C${r}:D${r}`);
    const gtRow = sheet.getRow(r);
    gtRow.height = 16;
    gtRow.getCell(1).border = border;
    const gtLabel = gtRow.getCell(3);
    gtLabel.value = 'รวมเป็นเงินทั้งสิ้น';
    gtLabel.font = { bold: true, size: 10, name: 'Arial' };
    gtLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    gtLabel.border = border;
    gtRow.getCell(5).border = border;
    const gtVal = gtRow.getCell(6);
    gtVal.value = quotation.grand_total;
    gtVal.numFmt = '#,##0.00';
    gtVal.font = { bold: true, size: 10, name: 'Arial' };
    gtVal.alignment = { horizontal: 'right', vertical: 'middle' };
    gtVal.border = border;
    r++;

    sheet.mergeCells(`A${r}:F${r}`);
    const addNote = sheet.getCell(`A${r}`);
    addNote.value = 'หมายเหตุ : ราคาที่บริษัทฯ เสนอนี้ ใช้สำหรับการเสนอราคาครั้งนี้เท่านั้น ไม่สามารถนำไปอ้างอิงได้';
    addNote.font = { size: 9, italic: true, name: 'Arial' };
    addNote.alignment = { vertical: 'middle' };
    sheet.getRow(r).height = 16;
    r++;
    r++;

    sheet.mergeCells(`A${r}:B${r}`);
    sheet.mergeCells(`C${r}:D${r}`);
    sheet.mergeCells(`E${r}:F${r}`);
    const sigTitles = [
      'ยืนยันคำสั่งซื้อในใบเสนอราคา\nสำหรับลูกค้า (ผู้มีอำนาจลงนามอนุมัติ / ประทับตราบริษัท)',
      `${COMPANY_NAME}\nผู้เสนอราคา (ผู้มีอำนาจลงนาม)`,
      `${COMPANY_NAME}\nผู้อนุมัติ (ผู้มีอำนาจลงนาม)`,
    ];
    [[1, sigTitles[0]], [3, sigTitles[1]], [5, sigTitles[2]]].forEach(([col, val]) => {
      const cell = sheet.getRow(r).getCell(col);
      cell.value = val;
      cell.font = { size: 9, name: 'Arial' };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = border;
    });
    sheet.getRow(r).height = 32;
    r++;

    for (let s = 0; s < 4; s++) {
      sheet.mergeCells(`A${r}:B${r}`);
      sheet.mergeCells(`C${r}:D${r}`);
      sheet.mergeCells(`E${r}:F${r}`);
      const isFirst = s === 0;
      const isLast  = s === 3;
      [1, 3, 5].forEach(col => {
        sheet.getRow(r).getCell(col).border = {
          left:   thin,
          right:  thin,
          top:    isFirst ? thin : undefined,
          bottom: isLast  ? thin : undefined,
        };
      });
      sheet.getRow(r).height = 16;
      r++;
    }

    sheet.mergeCells(`A${r}:B${r}`);
    sheet.mergeCells(`C${r}:D${r}`);
    sheet.mergeCells(`E${r}:F${r}`);
    const sigNames = [
      '( ................................................ )',
      '(นายประกอบ นาคชำนาญ)',
      '(นายสงคราม กองอังกาบ)',
    ];
    [[1, sigNames[0]], [3, sigNames[1]], [5, sigNames[2]]].forEach(([col, val]) => {
      const cell = sheet.getRow(r).getCell(col);
      cell.value = val;
      cell.font = { size: 9, name: 'Arial' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = border;
    });
    sheet.getRow(r).height = 16;
    r++;

    sheet.mergeCells(`A${r}:B${r}`);
    sheet.mergeCells(`C${r}:D${r}`);
    sheet.mergeCells(`E${r}:F${r}`);
    [[1, 'วันที่...................................'], [3, ''], [5, '']].forEach(([col, val]) => {
      const cell = sheet.getRow(r).getCell(col);
      cell.value = val;
      cell.font = { size: 9, name: 'Arial' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = border;
    });
    sheet.getRow(r).height = 16;
    r++;
    const boxEnd = r - 1;

    const COLS = 6;
    for (let br = boxStart; br <= boxEnd; br++) {
      const row = sheet.getRow(br);
      const isFirst = br === boxStart;
      const isLast  = br === boxEnd;
      for (let col = 1; col <= COLS; col++) {
        const cell = row.getCell(col);
        const existing = cell.border || {};
        const updated = { ...existing };
        if (col === 1)    updated.left   = thin;
        if (col === COLS) updated.right  = thin;
        if (isFirst)      updated.top    = thin;
        if (isLast)       updated.bottom = thin;
        cell.border = updated;
      }
    }

    r++;

    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } };
    sheet.mergeCells(`A${r}:C${r}`);
    sheet.mergeCells(`D${r}:F${r}`);
    const fyRow = sheet.getRow(r);
    fyRow.height = 24;
    const fyLeft = fyRow.getCell(1);
    fyLeft.value = `99 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210\n99 Chaengwattana Road, Thung Song Hong, Lak Si, Bangkok 10210`;
    fyLeft.font = { size: 9, name: 'Arial' };
    fyLeft.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    fyLeft.fill = yellowFill;
    const fyRight = fyRow.getCell(4);
    fyRight.value = `www.ntplc.co.th  |  Contact Center 1888\nเลขประจำตัวผู้เสียภาษีอากร / Tax ID : 0107564000014`;
    fyRight.font = { size: 9, name: 'Arial' };
    fyRight.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
    fyRight.fill = yellowFill;
    [2, 3, 5, 6].forEach(col => { fyRow.getCell(col).fill = yellowFill; });
    r++;

    sheet.mergeCells(`A${r}:C${r}`);
    sheet.mergeCells(`D${r}:F${r}`);
    const fnRow = sheet.getRow(r);
    fnRow.height = 14;
    const fnLeft = fnRow.getCell(1);
    fnLeft.value = 'NT001 รหัสพัสดุ 10065112 กระดาษจดหมาย (ใช้ภายนอก) หน่วยนับ BK.';
    fnLeft.font = { size: 8, color: { argb: 'FF6B7280' }, name: 'Arial' };
    fnLeft.alignment = { horizontal: 'left', vertical: 'middle' };
    const fnRight = fnRow.getCell(4);
    fnRight.value = 'พิมพ์ที่ : ศูนย์บริการสั่งพิมพ์ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042';
    fnRight.font = { size: 8, color: { argb: 'FF6B7280' }, name: 'Arial' };
    fnRight.alignment = { horizontal: 'right', vertical: 'middle' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `ใบเสนอราคา-${quotation.quotation_number}.xlsx`);
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
    <div className="bg-gray-100 min-h-screen print:bg-white print:min-h-0 print:p-0">

      {/* TOP NAV */}
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
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
              >
                <FiDownload size={18} />
                <span>PDF</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
              >
                <FiDownload size={18} />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT */}
      <div className="p-6 print:p-0 print:pt-0">
        <div>
          <QuotationDocument
            quotation={quotation}
            settings={settings}
            showLogo={showLogo}
            showFooter={showFooter}
          />
        </div>
      </div>

      {/* FLOATING TOOLBAR — print:hidden */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end gap-2">

        {/* Panel */}
        {toolbarOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-52 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ตั้งค่าการแสดงผล</p>
            <ToggleSwitch
              label="โลโก้"
              checked={showLogo}
              onChange={setShowLogo}
            />
            <ToggleSwitch
              label="Footer"
              checked={showFooter}
              onChange={setShowFooter}
            />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setToolbarOpen(o => !o)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 ${
            toolbarOpen
              ? 'bg-gray-800 text-white'
              : 'bg-yellow-400 hover:bg-yellow-500 text-black'
          }`}
        >
          {toolbarOpen ? <FiX size={20} /> : <FiSettings size={20} />}
        </button>
      </div>

    </div>
  );
}