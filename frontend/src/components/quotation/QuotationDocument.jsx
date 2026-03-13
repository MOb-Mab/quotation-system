// frontend/src/components/quotation/QuotationDocument.jsx
import React from 'react';

export default function QuotationDocument({ quotation, showLogo = true, showFooter = true }) {
  const COMPANY_NAME = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  const LOGO_PATH = '/NT logo.png';
  const FOOTER_PATH = '/Footer.png';

  const {
    quotation_number, issue_date, expiry_date, customer_name, customer_address,
    recipient, prepared_by, prepared_phone, coordinator_name, coordinator_phone,
    validity_days, items = [], sub_total = 0, discount = 0, discount_percent = 0,
    vat = 0, vat_percent = 7, grand_total = 0, note,
  } = quotation || {};

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const noteLines = note && note.trim() !== '' ? note.split('\n') : [];

  const subtotalAfterDiscount = sub_total - (discount || 0);

  const displayDiscountPercent = discount_percent && discount_percent > 0 ? `${discount_percent}%` : '.....%';
  const displayDiscount = discount && discount > 0 ? formatCurrency(discount) : '-';

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

  const summaryItems = [
    { label: 'รวมเงิน', value: formatCurrency(sub_total) },
    { label: `ส่วนลด ${displayDiscountPercent}`, value: displayDiscount },
    { label: 'ราคาหลังหักส่วนลด', value: formatCurrency(subtotalAfterDiscount), nowrap: true },
    { label: `ภาษีมูลค่าเพิ่ม ${vat_percent}%`, value: formatCurrency(vat) },
    { label: 'รวมเป็นเงินทั้งสิ้น', value: formatCurrency(grand_total) },
  ];

  // row 0 = "หมายเหตุ" header, row 1..n = noteLines
  // totalRows must be at least 1 (header) + 4 (to align with 5 summary rows bottom-anchored)
  const totalRows = Math.max(noteLines.length, 4) + 1;
  const summaryStartRow = totalRows - 5;

  return (
    <div className="pdf-content bg-white w-[210mm] mx-auto shadow-lg print:shadow-none p-4 print:px-6 print:pt-6 print:pb-4">

      {/* HEADER */}
      {showLogo ? (
        <div className="flex items-start justify-between mb-1">
          <img src={LOGO_PATH} alt="NT logo" className="h-12 print:h-10" />
        </div>
      ) : (
        <div className="mb-3 print:mb-6" />
      )}

      {/* COMPANY NAME */}
      <div className="text-center py-1">
        <h1 className="text-xs font-bold print:text-[11px]">{COMPANY_NAME}</h1>
      </div>

      {/* BIG BORDER BOX */}
      <div className="border border-black p-2 print:p-2">

        {/* TITLE */}
        <div className="text-center py-1 mb-1">
          <h1 className="text-xs font-bold text-center print:text-[11px]">
            ใบเสนอราคา
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
          <table className="w-full border-collapse border-t border-b border-black text-xs table-fixed">
            <colgroup>
              <col className="w-10" />
              <col />
              <col className="w-12" />
              <col className="w-16" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr>
                <th className="border-t border-b border-r border-black p-1.5 text-center">ลำดับ</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center">รายการ</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center">จำนวน</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center">หน่วย</th>
                <th className="border-t border-b border-r border-black p-1.5 text-center">ราคาต่อหน่วย</th>
                <th className="border-t border-b border-black p-1.5 text-center">ราคารวม</th>
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
                  <td className="border-b border-r border-black p-1.5 overflow-hidden"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', lineBreak: 'strict' }}>
                    {item.name}
                    {item.description && (
                      <div className="text-xs text-gray-600"
                           style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', lineBreak: 'strict' }}>
                        ({item.description})
                      </div>
                    )}
                  </td>
                  <td className="border-b border-r border-black p-1.5 text-center">{item.quantity}</td>
                  <td className="border-b border-r border-black p-1.5 text-center">{item.unit}</td>
                  <td className="border-b border-r border-black p-1.5 text-right">
                    {formatCurrency(getSellPrice(item))}
                  </td>
                  <td className="border-b border-black p-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}

              {/* Dynamic summary rows — notes on left, summary anchored to bottom-right */}
              {Array.from({ length: totalRows }, (_, rowIdx) => {
                const leftContent = rowIdx === 0
                  ? <span className="font-semibold">หมายเหตุ</span>
                  : (noteLines[rowIdx - 1] ?? '');

                const summaryIdx = rowIdx - summaryStartRow;
                const summary = summaryIdx >= 0 && summaryIdx < summaryItems.length
                  ? summaryItems[summaryIdx]
                  : null;

                return (
                  <tr key={`sr-${rowIdx}`}>
                    <td colSpan="2" className="border-b border-r border-black p-2 text-xs">
                      {leftContent}
                    </td>
                    {summary ? (
                      <>
                        <td colSpan="2" className={`border-b border-r border-black p-2 text-right text-xs ${summary.nowrap ? 'whitespace-nowrap' : ''}`}>
                          {summary.label}
                        </td>
                        <td className="border-b border-r border-black p-2" />
                        <td className={`border-b border-black p-2 text-right text-xs ${summary.bold ? 'font-bold' : ''}`}>
                          {summary.value}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border-b border-r border-black p-2" />
                        <td className="border-b border-r border-black p-2" />
                        <td className="border-b border-r border-black p-2" />
                        <td className="border-b border-black p-2" />
                      </>
                    )}
                  </tr>
                );
              })}

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

      {/* Footer */}
      {showFooter && (
        <div className="mt-4">
          <img src={FOOTER_PATH} alt="NT Footer" className="w-full" />
        </div>
      )}

      {/* NT001 */}
      <div
        style={{ fontFamily: '"Kanit", sans-serif' }}
        className="grid grid-cols-2 gap-1 px-3 mt-1 text-[9px] text-gray-700"
      >
        <div><p className="leading-none">NT001 รหัสพัสดุ 10065112 กระดาษจดหมาย (ใช้ภายนอก) หน่วยนับ BK.</p></div>
        <div className="text-right"><p className="leading-none">พิมพ์ที่ : ศูนย์บริการสั่งพิมพ์ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) โทร. 0 2591 8042</p></div>
      </div>

    </div>
  );
}