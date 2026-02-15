//frontend/src/pages/QuotationList.jsx
import { useEffect, useState } from 'react';
import QuotationTable from '../components/quotation/QuotationTable';
import QuotationPagination from '../components/quotation/QuotationPagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { getQuotations, deleteQuotation } from '../services/quotation.service';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import * as quotationService from '../services/quotation.service';



export default function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    fetchQuotations(page);
  }, [page]);

  const fetchQuotations = async (page) => {
    const res = await getQuotations(page, limit);
    setQuotations(res.data);
    setTotalPages(res.totalPages);
  };

  const handleDeleteConfirm = async () => {
    await deleteQuotation(deleteTarget._id);
    setDeleteTarget(null);
    fetchQuotations(page);
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await quotationService.updateQuotation(id, {
        status: newStatus,
      });
  
      setQuotations((prev) =>
        prev.map((q) =>
          q._id === id ? { ...q, status: newStatus } : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  
  

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ใบเสนอราคา</h1>

        <button
          onClick={() => navigate('/quotations/create')}
          className="flex items-center gap-2
                     bg-yellow-400 hover:bg-yellow-500
                     text-black font-semibold
                     px-5 py-3 rounded-xl shadow"
        >
          <FiPlus size={20} />
          สร้างใบเสนอราคา
        </button>
      </div>

      <QuotationTable
        quotations={quotations}
        onView={(id) => navigate(`/quotations/${id}/preview`)}
        onEdit={(id) => navigate(`/quotations/edit/${id}`)}
        onDelete={(id) =>
          setDeleteTarget(
            quotations.find((q) => q._id === id)
          )
        }
        onChangeStatus={handleChangeStatus}   
      />

      <QuotationPagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        quotationNumber={deleteTarget?.quotation_number}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
