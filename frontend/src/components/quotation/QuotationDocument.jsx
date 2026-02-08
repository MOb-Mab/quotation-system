// frontend/src/components/quotation/QuotationDocument.jsx
import React from 'react';

export default function QuotationDocument({ quotation, settings }) {
  const {
    company_name_th,
    company_name_en,
    company_address,
    company_phone,
    header_color,
    footer_background_color,
    footer_address_line1,
    footer_address_line2,
    footer_nt_reference,
    footer_additional_text,
    footer_website,
    footer_contact_center,
    footer_tax_info,
    show_logo,
    show_company_name,
    show_signature_section,
    show_page_number,
    logo_url,
    signature_title_1,
    signature_title_2,
    signature_title_3,
  } = settings;

  const {
    quotation_number,
    issue_date,
    expiry_date,
    customer_name,
    customer_address,
    recipient,
    items,
    sub_total,
    discount_percent,
    vat_percent,
    vat,
    grand_total,
    note,
    prepared_by,
    prepared_phone,
    validity_days,
    payment_terms,
  } = quotation;

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white max-w-[210mm] mx-auto shadow-lg print:shadow-none">
      
      {/* HEADER */}
      <div
        className="p-6 flex justify-between items-center"
        style={{ backgroundColor: header_color || '#FBBF24' }}
      >
        <div className="flex items-center gap-4">
          {show_logo && logo_url && (
            <img src={logo_url} alt="Logo" className="h-16" />
          )}
          {show_company_name && (
            <div>
              <h1 className="font-bold text-xl text-black">
                {company_name_th}
              </h1>
              <p className="text-sm text-black/80">{company_name_en}</p>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm font-semibold text-black">เลขที่ใบเสนอราคา (มหาชน)</p>
            <p className="text-lg font-bold text-black">{quotation_number}</p>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="text-center py-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">ใบเสนอราคา</h2>
        <p className="text-sm text-gray-600 mt-1">บริการ ISI</p>
      </div>

      {/* BODY */}
      <div className="p-8 text-sm space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">เรียน:</span>
              <span>{recipient || customer_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">ชื่อลูกค้า:</span>
              <span>{customer_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">ที่อยู่ลูกค้า:</span>
              <span>{customer_address}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">เลขที่ใบเสนอราคา:</span>
              <span>{quotation_number}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">วันที่:</span>
              <span>{formatDate(issue_date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">วันหมดอายุใน:</span>
              <span>{validity_days || 30} วัน</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">Expire Date:</span>
              <span>{formatDate(expiry_date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">ผู้จัดทำใบเสนอราคา:</span>
              <span>{prepared_by}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[120px]">โทรศัพท์:</span>
              <span>{prepared_phone}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6">
          <p className="font-semibold mb-3">
            บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) ขอเสนอราคาบริการระบบ Network รายละเอียดดังนี้
          </p>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-center w-16">ลำดับ</th>
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-center w-20">จำนวน</th>
                <th className="border border-gray-300 p-2 text-center w-24">หน่วย</th>
                <th className="border border-gray-300 p-2 text-right w-32">ราคาต่อหน่วย</th>
                <th className="border border-gray-300 p-2 text-right w-32">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" className="border border-gray-300 p-2 bg-gray-50 font-semibold">
                  รายละเอียดดังนี้
                </td>
              </tr>

              {items && items.map((item, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                  <td className="border border-gray-300 p-2">
                    {item.name}
                    {item.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        ({item.description})
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(item.cost)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mt-4">
          <div className="w-80">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-2 px-4 text-right font-semibold">หมายเหตุ</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(sub_total)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-right">รับประกันอุปกรณ์เป็นระยะเวลา 1 ปี ส่วนลด .....%</td>
                  <td className="py-2 px-4 text-right">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-right font-semibold">ลูกค้าชำระได้ทั้งเงินสดและเช็ค</td>
                  <td className="py-2 px-4 text-right font-semibold">ราคาหลังหักลดแล้วทั้งสิ้น</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="py-2 px-4 text-right">ใบเสนอราคานี้มีกำหนด {validity_days || 30} วัน นับจากวันเสนอราคา</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(sub_total)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-right">{payment_terms || 'ชำระเงินภายใน 60 วัน'}</td>
                  <td className="py-2 px-4 text-right">ภาษีมูลค่าเพิ่ม {vat_percent || 7}%</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="py-2 px-4 text-right"></td>
                  <td className="py-2 px-4 text-right">รวมเป็นเงินทั้งสิ้น</td>
                </tr>
                <tr className="bg-gray-100 font-bold text-lg">
                  <td className="py-2 px-4 text-right">ห้าหมื่นห้าพันแปดร้อยห้าสิบบาทถ้วน</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(grand_total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {note && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-semibold mb-2">หมายเหตุ:</p>
            <div className="whitespace-pre-line text-sm">{note}</div>
          </div>
        )}
      </div>

      {/* SIGNATURE */}
      {show_signature_section && (
        <div className="px-8 pb-6">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="border border-gray-300 p-4 rounded">
              <div className="h-24 mb-2"></div>
              <div className="border-t border-gray-300 pt-2">
                <p className="font-semibold text-xs">{signature_title_1}</p>
                <p className="text-xs mt-2">( ................................................................ )</p>
                <p className="text-xs">วันที่..........................................................</p>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded">
              <div className="h-24 mb-2"></div>
              <div className="border-t border-gray-300 pt-2">
                <p className="font-semibold text-xs whitespace-pre-line">{signature_title_2}</p>
                <p className="text-xs mt-2">( {prepared_by} )</p>
                <p className="text-xs">ผู้จัดการศูนย์ขายและบริการ</p>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded">
              <div className="h-24 mb-2"></div>
              <div className="border-t border-gray-300 pt-2">
                <p className="font-semibold text-xs whitespace-pre-line">{signature_title_3}</p>
                <p className="text-xs mt-2">( ........................................................  )</p>
                <p className="text-xs">({customer_name})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="p-4 text-xs text-white" style={{ backgroundColor: footer_background_color || '#FBBF24' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="font-semibold">{footer_address_line1}</p>
            <p>{footer_address_line2}</p>
            <p className="mt-2">{footer_nt_reference}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-semibold">{footer_website} | {footer_contact_center}</p>
            <p>{footer_tax_info}</p>
            <p className="mt-2">{footer_additional_text}</p>
          </div>
        </div>
        {show_page_number && (
          <div className="text-center mt-3 pt-3 border-t border-white/30">
            <p>หน้า 1 / 1</p>
          </div>
        )}
      </div>
    </div>
  );
}