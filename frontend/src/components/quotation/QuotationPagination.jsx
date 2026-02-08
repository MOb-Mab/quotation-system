export default function QuotationPagination({ page, totalPages, onChange }) {
    return (
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-4 py-1 rounded border disabled:opacity-50"
        >
          ◀ ก่อนหน้า
        </button>
  
        <span className="text-sm">
          หน้า {page} / {totalPages}
        </span>
  
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-4 py-1 rounded border disabled:opacity-50"
        >
          ถัดไป ▶
        </button>
      </div>
    );
  }
  