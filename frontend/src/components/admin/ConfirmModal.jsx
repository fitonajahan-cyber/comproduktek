import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ open, title, onCancel, onConfirm, loading, headerTitle = "Konfirmasi Hapus", confirmText = "Hapus Permanen" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 font-dash">
      <div 
        role="alertdialog" 
        aria-modal="true" 
        aria-labelledby="confirm-modal-title" 
        aria-describedby="confirm-modal-desc"
        className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-sm p-6"
      >
        <div className="w-9 h-9 rounded-md bg-red-50 flex items-center justify-center mb-3">
          <AlertTriangle className="w-[18px] h-[18px] text-red-600" />
        </div>
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-dashNavy mb-2">{headerTitle}</h3>
        <p id="confirm-modal-desc" className="text-sm text-dashNavy/70 mb-6">{title}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition">
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition"
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
