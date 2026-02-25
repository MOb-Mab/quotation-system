// frontend/src/components/quotation/QuotationDocument.jsx
import React from 'react';

export default function QuotationDocument({ quotation }) {
  const COMPANY_NAME = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  const LOGO_PATH = '/NT logo.png';
  
  const FOOTER_ADDRESS_LINE1 = '99 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210';
  const FOOTER_ADDRESS_LINE2 = '99 Chaengwattana Road,Thung Song Hong,Lak Si,Bangkok 10210';
  const FOOTER_NT_REFERENCE = 'NT001 รหัสพัสดุ 10065112 กระดาษจดหมาย (ใช้ภายนอก) หน่วยนับ BK.';
  const FOOTER_ADDITIONAL_TEXT = 'พิมพ์ที่ : ศูนย์บริการสั่งพิมพ์ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042';
  const FOOTER_WEBSITE = 'www.ntplc.co.th';
  const FOOTER_CONTACT_CENTER = 'Contact Center 1888';
  const FOOTER_TAX_INFO = 'เลขประจำตัวผู้เสียภาษีอากร / Tax ID : 0107564000014';
  const FOOTER_BACKGROUND_COLOR = '#FBBF24';
  
  const {
    quotation_number, issue_date, expiry_date, customer_name, customer_address,
    recipient, prepared_by, prepared_phone, coordinator_name, coordinator_phone,
    validity_days, items = [], sub_total = 0, discount = 0, discount_percent = 0,
    vat = 0, vat_percent = 7, grand_total = 0, note,
  } = quotation || {};

  const noteLines = note && note.trim() !== '' ? note.split('\n').slice(0, 4) : ['-'];
  while (noteLines.length < 4) noteLines.push('');

  const subtotalAfterDiscount = sub_total - (discount || 0);

  const displayDiscountPercent = discount_percent && discount_percent > 0 ? `${discount_percent}%` : '.....%';
  const displayDiscount = discount && discount > 0 ? formatCurrency(discount) : '-';

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ ราคาขายต่อหน่วย = ราคาทุน × (1 + margin%)
  const getSellPrice = (item) => {
    const cost = parseFloat(item.cost) || 0;
    const margin = parseFloat(item.margin) || 0;
    return cost + (cost * margin / 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const showValue = (value) => {
    return value && value.toString().trim() !== '' ? value : '......................................';
  };

  return (
<div className="pdf-content bg-white w-[210mm] mx-auto shadow-lg print:shadow-none p-4 print:p-0">      {/* HEADER */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-4">
          <img src={LOGO_PATH} alt="NT logo" className="h-12 print:h-10" />
        </div>
      </div>
  
      {/* BIG BORDER BOX */}
      <div className="border border-black p-2 print:p-2">
        
        {/* TITLE */}
        <div className="text-center py-1 mb-1">
          <h1 className="text-xs font-bold text-center print:text-[11px]">
            {COMPANY_NAME}<br />ใบเสนอราคา
          </h1>
        </div>
  
        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-2 mb-4 text-xs">
          <div className="space-y-0.5">
            <div className="relative h-5">
              <span className="absolute left-[77px]">เรียน</span>
              <span className="absolute left-[122px]">:</span>
              <span className="absolute left-[129px] right-0">{showValue(recipient)}</span>
            </div>
            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className="text-right">ชื่อลูกค้า</span><span className="text-center">:</span>
              <span>{showValue(customer_name)}</span>
            </div>
            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className="text-right">ที่อยู่ลูกค้า</span><span className="text-center">:</span>
              <span>{showValue(customer_address)}</span>
            </div>
            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className="text-right">ผู้ประสานงาน</span><span className="text-center">:</span>
              <span>{showValue(coordinator_name)}</span>
            </div>
            <div className="grid grid-cols-[120px_10px_1fr]">
              <span className="text-right">โทรศัพท์</span><span className="text-center">:</span>
              <span>{showValue(coordinator_phone)}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">เลขที่ใบเสนอราคา</span><span className="text-center">:</span>
              <span>{quotation_number}</span>
            </div>
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">วันที่</span><span className="text-center">:</span>
              <span>{showValue(formatDate(issue_date))}</span>
            </div>
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">ยืนราคาภายใน (วัน)</span><span className="text-center">:</span>
              <span>{showValue(validity_days)}</span>
            </div>
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">Expire Date</span><span className="text-center">:</span>
              <span>{showValue(formatDate(expiry_date))}</span>
            </div>
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">ผู้จัดทำใบเสนอราคา</span><span className="text-center">:</span>
              <span>{showValue(prepared_by)}</span>
            </div>
            <div className="grid grid-cols-[180px_10px_1fr]">
              <span className="text-right">โทรศัพท์</span><span className="text-center">:</span>
              <span>{showValue(prepared_phone)}</span>
            </div>
          </div>
        </div>

        {/* SERVICE DESCRIPTION */}
        <div className="text-xs mb-2">
          <p>{COMPANY_NAME} ขอเสนอราคาบริการระบบ Network รายละเอียดดังนี้</p>
        </div>

        {/* TABLE */}
        <div className="-mx-2 mb-1">
          <table className="w-full border-collapse border-t border-b border-black text-xs">
            <thead>
              <tr>
                <th className="border-t border-b border-r border-black p-1.5 text-center w-12">ลำดับ</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center">รายการ</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center w-16">จำนวน</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center w-20">หน่วย</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center w-28">ราคาต่อหน่วย</th>
                <th className="border-t border-b border-black p-1.5 text-center w-28">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-1.5"></td>
                <td className="border-b border-r border-black p-1.5">รายละเอียดดังนี้</td>
                <td className="border-b border-r border-black p-1.5"></td>
                <td className="border-b border-r border-black p-1.5"></td>
                <td className="border-b border-r border-black p-1.5"></td>
                <td className="border-b border-black p-1.5"></td>
              </tr>

              {items && items.map((item, i) => (
                <tr key={i}>
                  <td className="border-b border-r border-black p-1.5 text-center">{i + 1}</td>
                  <td className="border-b border-r border-black p-1.5">
                    {item.name}
                    {item.description && (
                      <div className="text-xs text-gray-600">({item.description})</div>
                    )}
                  </td>
                  <td className="border-b border-r border-black p-1.5 text-center">{item.quantity}</td>
                  <td className="border-b border-r border-black p-1.5 text-center">{item.unit}</td>
                  {/* ✅ ราคาต่อหน่วย = ราคาขาย (ทุน + margin%) */}
                  <td className="border-b border-r border-black p-1.5 text-right">
                    {formatCurrency(getSellPrice(item))}
                  </td>
                  <td className="border-b border-black p-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}

              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs"><span className="font-semibold">หมายเหตุ</span></td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">รวมเงิน</td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">{formatCurrency(sub_total)}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">{noteLines[0]}</td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">ส่วนลด {displayDiscountPercent}</td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">{displayDiscount}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">{noteLines[1]}</td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">ราคาหลังหักส่วนลด</td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">{formatCurrency(subtotalAfterDiscount)}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">{noteLines[2]}</td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">ภาษีมูลค่าเพิ่ม {vat_percent}%</td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">{formatCurrency(vat)}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border-b border-r border-black p-2 text-xs">{noteLines[3]}</td>
                <td colSpan="2" className="border-b border-r border-black p-2 text-right text-xs">รวมเป็นเงินทั้งสิ้น</td>
                <td className="border-b border-r border-black p-2"></td>
                <td className="border-b border-black p-2 text-right text-xs">{formatCurrency(grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ADDITIONAL NOTE */}
        <div className="text-xs mb-4 py-2">
          <p className="text-left">หมายเหตุ : ราคาที่บริษัทฯ เสนอนี้ ใช้สำหรับการเสนอราคาครั้งนี้เท่านั้น ไม่สามารถนำไปอ้างอิงได้</p>
        </div>

        {/* SIGNATURE */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-3">
          <div className="border border-black p-2 text-center text-xs">
            <p className='text-[10px] leading-tight'>ยืนยันคำสั่งซื้อในใบเสนอราคา</p>
            <p className="text-[10px] leading-tight whitespace-nowrap">สำหรับลูกค้า (ผู้มีอำนาจลงนามอนุมัติ / ประทับตราบริษัท)</p>
            <div className="border-t border-black my-2"></div>
            <div className="mb-10"></div>
            <p className="mt-2 text-[10px]">................................................</p>
            <p className="mt-2 text-[10px]">( ................................................ )</p>
            <p className="mt-1 text-[10px]">วันที่...........................................</p>
          </div>
          <div className="border border-black p-2 text-center text-xs">
            <p className="text-[11px] leading-tight whitespace-nowrap">บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)</p>
            <p className="text-[11px] leading-tight whitespace-nowrap">ผู้เสนอราคา (ผู้มีอำนาจลงนาม)</p>
            <div className="border-t border-black my-2"></div>
            <div className="mb-14"></div>
            <p className="mt-2 text-[11px]">(นายประกอบ นาคชำนาญ)</p>
            <p className="mt-1 text-[11px]">ผู้จัดการศูนย์ขายและวิศวกรรมบริการ</p>
          </div>
          <div className="border border-black p-2 text-center text-[11px]">
            <p className="text-[11px] leading-tight whitespace-nowrap">บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)</p>
            <p className="text-[11px] leading-tight whitespace-nowrap">ผู้อนุมัติ (ผู้มีอำนาจลงนาม)</p>
            <div className="border-t border-black my-2"></div>
            <div className="mb-14"></div>
            <p className="mt-2 text-[11px]">(นายสงคราม กองอังกาบ)</p>
            <p className="mt-1 text-[11px]">โทรคมนาคมจังหวัดนครปฐม</p>
          </div>
        </div>
      </div>

    {/* FOOTER */}
<div
  style={{ backgroundColor: FOOTER_BACKGROUND_COLOR, fontFamily: '"Kanit", sans-serif' }}
  className="mt-6 py-[9px] px-5 text-black text-[9px] leading-none rounded-full"
>
  <div className="grid grid-cols-2 gap-1">
    <div>
      <p className="leading-none">{FOOTER_ADDRESS_LINE1}</p>
      <p className="leading-none mt-1">{FOOTER_ADDRESS_LINE2}</p>
    </div>
    <div className="text-right">
      <p className="leading-none">{FOOTER_WEBSITE} | {FOOTER_CONTACT_CENTER}</p>
      <p className="leading-none mt-1">{FOOTER_TAX_INFO}</p>
    </div>
  </div>
</div>

<div
  style={{ fontFamily: '"Kanit", sans-serif' }}
  className="grid grid-cols-2 gap-1 px-3 mt-1 text-[9px] text-gray-700"
>
  <div><p className="leading-none">{FOOTER_NT_REFERENCE}</p></div>
  <div className="text-right"><p className="leading-none">{FOOTER_ADDITIONAL_TEXT}</p></div>
</div>

    </div>
  );
}