// frontend/src/pages/QuotationList.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import QuotationTable from '../components/quotation/QuotationTable';
import QuotationPagination from '../components/quotation/QuotationPagination';
import ConfirmDeleteModal from '../components/common/ConfirmModal';
import { getQuotations, deleteQuotation } from '../services/quotation.service';
import { FiPlus, FiSearch, FiX, FiChevronDown, FiFilter } from 'react-icons/fi';
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

  const hasActiveFilter = search || statusFilter;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ใบเสนอราคา</h1>

        {/* ซ่อนปุ่มสร้างถ้าเป็น viewer */}
        {isAdmin && (
          <button
            onClick={() => navigate('/quotations/create')}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-xl shadow transition-colors"
          >
            <FiPlus size={18} />สร้างใบเสนอราคา
          </button>
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

      <QuotationTable
        quotations={quotations}
        onView={(id) => navigate(`/quotations/${id}/preview`)}
        onEdit={(id) => navigate(`/quotations/edit/${id}`)}
        onDelete={(id) => setDeleteTarget(quotations.find((q) => q._id === id))}
        onChangeStatus={handleChangeStatus}
        canEdit={isAdmin}
        canDelete={isAdmin}
      />

      <QuotationPagination page={page} totalPages={totalPages} onChange={setPage} />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="ลบใบเสนอราคา"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคา ${
          deleteTarget?.quotation_number || ''
        } ?`}
        variant="danger"
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
      />
    </div>
  );
}