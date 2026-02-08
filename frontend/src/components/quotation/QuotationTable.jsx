import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function QuotationTable({
  quotations,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">เลขที่</th>
            <th className="px-4 py-3 text-left">ลูกค้า</th>
            <th className="px-4 py-3 text-left">วันที่</th>
            <th className="px-4 py-3 text-right">ยอดรวม</th>
            <th className="px-4 py-3 text-center">สถานะ</th>
            <th className="px-4 py-3 text-center">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {quotations.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center text-gray-400 py-6"
              >
                ยังไม่มีใบเสนอราคา
              </td>
            </tr>
          ) : (
            quotations.map((q) => (
              <tr
                key={q._id}
                className="hover:bg-gray-50 border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  {q.quotation_number}
                </td>

                <td className="px-4 py-3">
                  {q.customer_name}
                </td>

                <td className="px-4 py-3">
                  {new Date(q.issue_date).toLocaleDateString('th-TH')}
                </td>

                <td className="px-4 py-3 text-right">
                  {q.grand_total?.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {q.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onView(q._id)}
                      className="text-blue-500 hover:text-blue-700"
                      title="ดู"
                    >
                      <FiEye />
                    </button>

                    <button
                      onClick={() => onEdit(q._id)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="แก้ไข"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => onDelete(q._id)}
                      className="text-red-500 hover:text-red-700"
                      title="ลบ"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
