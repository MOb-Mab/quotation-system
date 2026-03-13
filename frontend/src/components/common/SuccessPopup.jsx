import { FiCheckCircle } from 'react-icons/fi';

export default function SuccessPopup({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-scale-in">
        
        <FiCheckCircle className="mx-auto text-green-500" size={64} />

        <h2 className="text-xl font-semibold mt-4">
          สำเร็จ
        </h2>

        <p className="text-gray-600 mt-2">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500
                     text-black font-semibold py-2 rounded-lg"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}