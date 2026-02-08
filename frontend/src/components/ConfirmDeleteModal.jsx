export default function ConfirmDeleteModal({
    open,
    quotationNumber,
    onCancel,
    onConfirm,
  }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">
            ยืนยันการลบใบเสนอราคา
          </h2>
  
          <p className="text-gray-600 text-lg mb-8">
            คุณต้องการลบใบเสนอราคา{" "}
            <span className="font-semibold text-black">
              "{quotationNumber}"
            </span>{" "}
            หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
  
          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border
                         font-semibold hover:bg-gray-100"
            >
              ยกเลิก
            </button>
  
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl
                         bg-red-500 hover:bg-red-600
                         text-white font-semibold"
            >
              ลบใบเสนอราคา
            </button>
          </div>
        </div>
      </div>
    );
  }
  