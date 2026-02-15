// frontend/src/components/quotation/QuotationDocument.jsx
import React from 'react';

export default function QuotationDocument({ quotation }) {
  // ✅ Hardcoded values (ไม่ต้องใช้ settings prop แล้ว)
  const COMPANY_NAME = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  const LOGO_PATH = '/NT logo.png';
  
  // Footer settings (hardcoded)
  const FOOTER_ADDRESS_LINE1 = '99 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210';
  const FOOTER_ADDRESS_LINE2 = '99 Chaengwattana Road, Thung Song Hong, Lak Si, Bangkok 10210';
  const FOOTER_NT_REFERENCE = 'NT001 รหัสบัสด 10065112 กระดานจดหมาย (ใช้กายบอก) หม่งขมัย BK.';
  const FOOTER_ADDITIONAL_TEXT = 'พิมพ์โดย : ศูนย์บริการสั่งเติมไป บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042';
  const FOOTER_WEBSITE = 'www.ntplc.co.th';
  const FOOTER_CONTACT_CENTER = 'Contact Center 1888';
  const FOOTER_TAX_INFO = 'เลขประจำตัวผู้เสียภาษีอากร / Tax ID : 0107564000014';
  const FOOTER_BACKGROUND_COLOR = '#FBBF24';
  const SHOW_PAGE_NUMBER = true;
  
  // Signature titles (hardcoded)
  const SIGNATURE_TITLE_2 = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)\nผู้เสนอราคา (ผู้มีอำนาจลงนาม)';
  const SIGNATURE_TITLE_3 = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)\nผู้อนุมัติ (ผู้มีอำนาจลงนาม)';

  // ✅ ข้อมูลที่มาจาก quotation (จาก QuotationCreate)
  const {
    quotation_number,
    issue_date,
    expiry_date,
    customer_name,
    customer_address,
    recipient,
    prepared_by,
    prepared_phone,
    coordinator_name,
    coordinator_phone,
    validity_days,
    items = [],
    sub_total = 0,
    discount = 0,
    discount_percent = 0,
    vat = 0,
    vat_percent = 7,
    grand_total = 0,
    note,
  } = quotation || {};

  // NOTE FORMAT
  const noteLines = note && note.trim() !== ''
    ? note.split('\n').slice(0, 4)
    : ['-'];

  while (noteLines.length < 4) {
    noteLines.push('');
  }

  // CALCULATION
  const subtotalAfterDiscount = sub_total - (discount || 0);

  const displayDiscountPercent =
    discount_percent && discount_percent > 0
      ? `${discount_percent}%`
      : '.....%';

  const displayDiscount =
    discount && discount > 0
      ? formatCurrency(discount)
      : '-';

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMarginText = (cost, margin) => {
    if (!margin || margin <= 0) return null;
    // แสดงตัวเลขเป็นจำนวนเต็มโดยไม่มีทศนิยม
    const costInt = Math.round(parseFloat(cost || 0));
    return `${costInt.toLocaleString('th-TH')} × ${margin}%`;
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
  };

  const showValue = (value) => {
    return value && value.toString().trim() !== ''
      ? value
      : '......................................';
  };

  return (
    <div className="bg-white max-w-[210mm] mx-auto shadow-lg print:shadow-none p-6">
      
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={LOGO_PATH} alt="NT logo" className="h-16" />
        </div>
      </div>

      {/* BIG BORDER BOX */}
      <div className="border border-black p-2">
        {/* TITLE */}
        <div className="text-center py-2 mb-4">
          <h1 className="text-sm font-bold text-center">
            {COMPANY_NAME}
            <br />
            ใบเสนอราคา
          </h1>
        </div>

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-2 mb-4 text-sm">

          {/* LEFT COLUMN */}
          <div className="space-y-0.5">

            <div className="relative h-5">
              <span className=" absolute left-[70px]">
                เรียน
              </span>

              <span className="absolute left-[122px]">
                :
              </span>

              <span className="absolute left-[129px] right-0">
                {showValue(recipient)}
              </span>
            </div>

            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className=" text-right">ชื่อลูกค้า</span>
              <span className="text-center">:</span>
              <span>{showValue(customer_name)}</span>
            </div>

            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className="text-right">ที่อยู่ลูกค้า</span>
              <span className="text-center">:</span>
              <span>{showValue(customer_address)}</span>
            </div>

            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className=" text-right">ผู้ประสานงาน</span>
              <span className="text-center">:</span>
              <span>{showValue(coordinator_name)}</span>
            </div>

            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className=" text-right">โทรศัพท์</span>
              <span className="text-center">:</span>
              <span>{showValue(coordinator_phone)}</span>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-0.5">

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">เลขที่ใบเสนอราคา</span>
              <span className="text-center">:</span>
              <span>{quotation_number}</span>
            </div>

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">วันที่</span>
              <span className="text-center">:</span>
              <span>{showValue(formatDate(issue_date))}</span>
            </div>

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">ยืนราคาภายใน (วัน)</span>
              <span className="text-center">:</span>
              <span>{showValue(validity_days)}</span>
            </div>

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">Expire Date</span>
              <span className="text-center">:</span>
              <span>{showValue(formatDate(expiry_date))}</span>
            </div>

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">ผู้จัดทำใบเสนอราคา</span>
              <span className="text-center">:</span>
              <span>{showValue(prepared_by)}</span>
            </div>

            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className=" text-right">โทรศัพท์</span>
              <span className="text-center">:</span>
              <span>{showValue(prepared_phone)}</span>
            </div>

          </div>

        </div>

        {/* SERVICE DESCRIPTION */}
        <div className="text-sm mb-2">
          <p>{COMPANY_NAME} ขอเสนอราคาบริการระบบ Network รายละเอียดดังนี้</p>
        </div>

        {/* TABLE WITHOUT LEFT/RIGHT BORDERS */}
        <div className="-mx-2 mb-4">
          <table className="w-full border-collapse border-t border-b border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-t border-b border-r border-black p-2 text-center w-12">ลำดับ</th>
                <th className="border-t border-b border-r border-black p-2 text-center">รายการ</th>
                <th className="border-t border-b border-r border-black p-2 text-center w-16">จำนวน</th>
                <th className="border-t border-b border-r border-black p-2 text-center w-20">หน่วย</th>
                <th className="border-t border-b border-r border-black p-2 text-center w-28">ราคาต่อหน่วย</th>
                <th className="border-t border-b border-black p-2 text-center w-28">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-2 bg-gray-50 font-semibold text-xs"></td>
                <td className="border-b border-r border-black p-2 bg-gray-50 font-semibold text-xs">รายละเอียดดังนี้</td>
                <td className="border-b border-r border-black p-2 bg-gray-50 font-semibold text-xs"></td>
                <td className="border-b border-r border-black p-2 bg-gray-50 font-semibold text-xs"></td>
                <td className="border-b border-r border-black p-2 bg-gray-50 font-semibold text-xs"></td>
                <td className="border-b border-black p-2 bg-gray-50 font-semibold text-xs"></td>
              </tr>

              {/* รายการสินค้า */}
              {items && items.map((item, i) => (
                <tr key={i}>
                  <td className="border-b border-r border-black p-2 text-center">{i + 1}</td>
                  <td className="border-b border-r border-black p-2">
                    {item.name}
                    {item.description && (
                      <div className="text-xs text-gray-600">({item.description})</div>
                    )}
                  </td>
                  <td className="border-b border-r border-black p-2 text-center">{item.quantity}</td>
                  <td className="border-b border-r border-black p-2 text-center">{item.unit}</td>
                  <td className="border-b border-r border-black p-2 text-right">
  {formatCurrency(item.cost)}
  {item.margin > 0 && (
    <span className="text-gray-500 ml-1">
      × {item.margin}%
    </span>
  )}
</td>

                  <td className="border-b border-black p-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}

              {/* Empty rows ถ้ามีน้อยกว่า 5 */}
              {items && items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border-b border-r border-black p-2">&nbsp;</td>
                  <td className="border-b border-r border-black p-2"></td>
                  <td className="border-b border-r border-black p-2"></td>
                  <td className="border-b border-r border-black p-2"></td>
                  <td className="border-b border-r border-black p-2"></td>
                  <td className="border-b border-black p-2"></td>
                </tr>
              ))}

              {/* แถว 1: หมายเหตุ + รวมเงิน */}
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                  <span className="font-semibold">หมายเหตุ</span>
                </td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">
                  รวมเงิน
                </td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">
                  {formatCurrency(sub_total)}
                </td>
              </tr>

              {/* แถว 2 */}
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                  {noteLines[0]}
                </td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">
                  ส่วนลด {displayDiscountPercent}
                </td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">
                  {displayDiscount}
                </td>
              </tr>

              {/* แถว 3 */}
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                  {noteLines[1]}
                </td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">
                  ราคาหลังหักส่วนลด
                </td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">
                  {formatCurrency(subtotalAfterDiscount)}
                </td>
              </tr>

              {/* แถว 4 */}
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                  {noteLines[2]}
                </td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">
                  ภาษีมูลค่าเพิ่ม {vat_percent}%
                </td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">
                  {formatCurrency(vat)}
                </td>
              </tr>

              {/* แถว 5 */}
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                  {noteLines[3]}
                </td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">
                  รวมเป็นเงินทั้งสิ้น
                </td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">
                  {formatCurrency(grand_total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ADDITIONAL NOTE */}
        <div className="text-center text-xs mb-4 py-2">
          <p className="text-left text-xs">หมายเหตุ : ราคาที่บริษัทฯ เสนอนี้ ใช้สำหรับการเสนอราคาครั้งนี้เท่านั้น ไม่สามารถนำไปอ้างอิงได้</p>
        </div>

        {/* SIGNATURE */}
        <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border border-black p-3 text-center text-xs">

{/* หัวข้อ */}
<p className>
  ยืนยันคำสั่งซื้อในใบเสนอราคา
</p>

{/* คำอธิบาย */}
<p className="mt-1">
  สำหรับลูกค้า (ผู้มีอำนาจลงนามอนุมัติ / ประทับตราบริษัท)
</p>

{/* เส้นลายเซ็น */}
<div className="border-t border-black my-2"></div>

{/* พื้นที่ว่างสำหรับลายเซ็น */}
<div className="mb-12"></div>

{/* เส้นพิมพ์ชื่อ */}
<p className="mt-2">
  ................................................
</p>

{/* ชื่อในวงเล็บ */}
<p className="mt-2">
  ( ................................................ )
</p>

{/* วันที่ */}
<p className="mt-1">
  วันที่...........................................
</p>



            
          </div>

          <div className="border border-black p-3 text-center">
            {/* หัวข้อ */}
            <p className="text-xs whitespace-pre-line">
              {SIGNATURE_TITLE_2}
            </p>

            {/* เส้นสำหรับเซ็น */}
            <div className="border-t border-black my-2"></div>

            {/* พื้นที่ว่างสำหรับลายเซ็น */}
            <div className="mb-16"></div>

            {/* ชื่อ */}
            <p className="text-xs mt-2">
              (นายประกอบ นาคชำนาญ)
            </p>

            {/* ตำแหน่ง */}
            <p className="text-xs mt-1">
              ผู้จัดการศูนย์ขายและวิศวกรรมบริการ
            </p>
          </div>

          <div className="border border-black p-3 text-center">
            <p className="text-xs whitespace-pre-line">
              {SIGNATURE_TITLE_3}
            </p>

            <div className="border-t border-black my-2"></div>

            <div className="mb-16"></div>

            <p className="text-xs mt-2">
              (นายสงคราม กองอังกาบ)
            </p>

            <p className="text-xs mt-1">
              โทรคมนาคมจังหวัดนครปฐม
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER - กรอบสีเหลือง */}
      <div
        className="mt-6 py-[9px] px-3 text-black text-[10px] leading-none rounded-full"
        style={{ backgroundColor: FOOTER_BACKGROUND_COLOR }}
      >
        <div className="grid grid-cols-2 gap-1">
          <div>
            <p className="leading-none">
              {FOOTER_ADDRESS_LINE1}
            </p>
            <p className="leading-none">
              {FOOTER_ADDRESS_LINE2}
            </p>
          </div>

          <div className="text-right">
            <p className="leading-none">
              {FOOTER_WEBSITE} | {FOOTER_CONTACT_CENTER}
            </p>
            <p className="leading-none">
              {FOOTER_TAX_INFO}
            </p>
          </div>
        </div>
      </div>

      {/* ข้อความนอกกรอบสีเหลือง */}
      <div className="grid grid-cols-2 gap-1 px-3 mt-1 text-[10px] text-gray-700">
        <div>
          <p className="leading-none">
            {FOOTER_NT_REFERENCE}
          </p>
        </div>

        <div className="text-right">
          <p className="leading-none">
            {FOOTER_ADDITIONAL_TEXT}
          </p>
        </div>
      </div>

    </div>
  );
}