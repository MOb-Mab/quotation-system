// frontend/src/pages/QuotationList.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import QuotationTable from '../components/quotation/QuotationTable';
import QuotationPagination from '../components/quotation/QuotationPagination';
import ConfirmDeleteModal from '../components/common/ConfirmModal';
import { getQuotations, deleteQuotation } from '../services/quotation.service';
import { FiPlus, FiSearch, FiX, FiChevronDown, FiFilter, FiTrash2, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import * as quotationService from '../services/quotation.service';
import { useRole } from '../hooks/useRole';

const STATUS_OPTIONS = [
  { value: '',        label: 'ทุกสถานะ', color: null },
  { value: 'ร่าง',    label: 'ร่าง',     color: 'bg-gray-100 text-gray-600' },
  { value: 'ส่งแล้ว', label: 'ส่งแล้ว', color: 'bg-blue-100 text-blue-600' },
  { value: 'อนุมัติ', label: 'อนุมัติ', color: 'bg-green-100 text-green-600' },
  { value: 'ปฏิเสธ',  label: 'ปฏิเสธ',  color: 'bg-red-100 text-red-600' },
  { value: 'หมดอายุ', label: 'หมดอายุ', color: 'bg-orange-100 text-orange-600' },
];

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all min-w-[140px] justify-between ${
          value ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <FiFilter size={14} className={value ? 'text-yellow-600' : 'text-gray-400'} />
          <span>{selected.label}</span>
        </div>
        <FiChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px] overflow-hidden">
          {STATUS_OPTIONS.map(({ value: v, label, color }) => (
            <button
              key={v}
              type="button"
              onClick={() => { onChange(v); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${value === v ? 'bg-yellow-50' : ''}`}
            >
              {color
                ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
                : <span className="text-gray-500">{label}</span>
              }
              {value === v && <span className="ml-auto text-yellow-500 font-bold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuotationList() {
  const [quotations, setQuotations]     = useState([]);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Bulk delete state ─────────────────────────────────────────────────────
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [bulkSelected, setBulkSelected]     = useState({});
  const [confirmBulk, setConfirmBulk]       = useState(false);

  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchQuotations = useCallback(async (p) => {
    const res = await getQuotations(p, limit, search, statusFilter);
    setQuotations(res.data);
    setTotalPages(Math.max(1, res.totalPages));
  }, [search, statusFilter]);

  useEffect(() => {
    fetchQuotations(page);
  }, [page, search, statusFilter]);

  const handleClearSearch = () => { setSearchInput(''); setSearch(''); };

  // ── Single delete ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    await deleteQuotation(deleteTarget._id);
    setDeleteTarget(null);
    fetchQuotations(page);
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await quotationService.updateQuotation(id, { status: newStatus });
      setQuotations((prev) => prev.map((q) => q._id === id ? { ...q, status: newStatus } : q));
    } catch (err) { console.error(err); }
  };

  // ── Bulk delete helpers ───────────────────────────────────────────────────
  const toggleBulkSelect = (id) => {
    setBulkSelected(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const isAllSelected = quotations.length > 0 && quotations.every(q => bulkSelected[q._id]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setBulkSelected({});
    } else {
      const all = {};
      quotations.forEach(q => { all[q._id] = true; });
      setBulkSelected(all);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Object.keys(bulkSelected);
    for (const id of ids) {
      await deleteQuotation(id);
    }
    setBulkSelected({});
    setBulkDeleteMode(false);
    setConfirmBulk(false);
    fetchQuotations(page);
  };

  const exitBulkMode = () => {
    setBulkDeleteMode(false);
    setBulkSelected({});
  };

  const selectedCount = Object.keys(bulkSelected).length;
  const hasActiveFilter = search || statusFilter;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ใบเสนอราคา</h1>

        {isAdmin && (
          <div className="flex gap-3">
            {bulkDeleteMode ? (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {isAllSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
                <button
                  onClick={() => { if (selectedCount > 0) setConfirmBulk(true); }}
                  disabled={selectedCount === 0}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
                >
                  <FiTrash2 size={15} />ลบที่เลือก ({selectedCount})
                </button>
                <button
                  onClick={exitBulkMode}
                  className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setBulkDeleteMode(true)}
                  className="bg-white border border-red-300 hover:bg-red-50 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold"
                >
                  <FiTrash2 size={15} />เลือกลบ
                </button>
                <button
                  onClick={() => navigate('/quotations/create')}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-xl shadow transition-colors"
                >
                  <FiPlus size={18} />สร้างใบเสนอราคา
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ค้นหาเลขที่ หรือ ชื่อลูกค้า..."
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
            />
            {searchInput && (
              <button type="button" onClick={handleClearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />
        <StatusDropdown value={statusFilter} onChange={setStatusFilter} />

        {hasActiveFilter && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg"
          >
            <FiX size={13} />ล้างทั้งหมด
          </button>
        )}
        {hasActiveFilter && (
          <span className="text-sm text-gray-400 ml-auto">พบ {quotations.length} รายการ</span>
        )}
      </div>

      {/* ── ตาราง + Checkbox column เมื่ออยู่ใน bulk mode ── */}
      {bulkDeleteMode ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-center">
                  <div
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mx-auto transition-colors ${
                      isAllSelected ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300 hover:border-red-400'
                    }`}
                  >
                    {isAllSelected && <FiCheck size={12} className="text-white" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">เลขที่ใบเสนอราคา</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ลูกค้า</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">วันที่ออกใบเสนอราคา</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ยอดรวม</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-12">ไม่พบรายการ</td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr
                    key={q._id}
                    onClick={() => toggleBulkSelect(q._id)}
                    className={`cursor-pointer transition-colors ${
                      bulkSelected[q._id] ? 'bg-red-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                          bulkSelected[q._id] ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
                        }`}
                      >
                        {bulkSelected[q._id] && <FiCheck size={12} className="text-white" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{q.quotation_number}</td>
                    <td className="px-4 py-3 text-gray-600">{q.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {q.issue_date ? new Date(q.issue_date).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {q.grand_total ? `฿${q.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        q.status === 'ร่าง'    ? 'bg-gray-100 text-gray-600' :
                        q.status === 'ส่งแล้ว' ? 'bg-blue-100 text-blue-600' :
                        q.status === 'อนุมัติ' ? 'bg-green-100 text-green-600' :
                        q.status === 'ปฏิเสธ'  ? 'bg-red-100 text-red-600' :
                        q.status === 'หมดอายุ' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {q.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <QuotationTable
          quotations={quotations}
          onView={(id) => navigate(`/quotations/${id}/preview`)}
          onEdit={(id) => navigate(`/quotations/edit/${id}`)}
          onDelete={(id) => setDeleteTarget(quotations.find((q) => q._id === id))}
          onChangeStatus={handleChangeStatus}
          canEdit={isAdmin}
          canDelete={isAdmin}
        />
      )}

      <QuotationPagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* ── Single delete modal ── */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="ลบใบเสนอราคา"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคา ${deleteTarget?.quotation_number || ''} ?`}
        variant="danger"
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
      />

      {/* ── Bulk delete modal ── */}
      <ConfirmDeleteModal
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="ลบใบเสนอราคา"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคาที่เลือกทั้งหมด ${selectedCount} รายการ?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        variant="danger"
        confirmLabel={`ลบ ${selectedCount} รายการ`}
        cancelLabel="ยกเลิก"
      />
    </div>
  );
}