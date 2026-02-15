import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function QuotationTable({
  quotations,
  onView,
  onEdit,
  onDelete,
  onChangeStatus, 
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">เลขที่</th>
            <th className="px-4 py-3 text-left">ลูกค้า</th>
            <th className="px-4 py-3 text-left">สร้างเมื่อ</th>
            <th className="px-4 py-3 text-left">แก้ไขล่าสุด</th>
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
  {new Date(q.created_date).toLocaleDateString('th-TH')}
</td>

<td className="px-4 py-3">
  {new Date(q.updated_date).toLocaleDateString('th-TH')}
</td>


                <td className="px-4 py-3 text-right">
                  {q.grand_total?.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}
                </td>

                <td className="px-4 py-3 text-center">
                <select
  value={q.status}
  onChange={(e) => onChangeStatus(q._id, e.target.value)}
  className={`
    px-4 py-2 rounded-full text-sm font-semibold
    border border-gray-200
    shadow-sm
    cursor-pointer
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    hover:shadow-md
    ${q.status === 'draft' && 'bg-gray-100 text-gray-700 focus:ring-gray-400'}
    ${q.status === 'sent' && 'bg-blue-100 text-blue-700 focus:ring-blue-400'}
    ${q.status === 'accepted' && 'bg-green-100 text-green-700 focus:ring-green-400'}
    ${q.status === 'rejected' && 'bg-red-100 text-red-700 focus:ring-red-400'}
    ${q.status === 'expired' && 'bg-orange-100 text-orange-700 focus:ring-orange-400'}
  `}
>
  <option value="draft">Draft</option>
  <option value="sent">Sent</option>
  <option value="accepted">Accepted</option>
  <option value="rejected">Rejected</option>
  <option value="expired">Expired</option>
</select>

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
