import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-md shadow-dashCard text-sm text-white font-dash ${
        isError ? 'bg-red-600' : 'bg-dashNavy'
      }`}
    >
      {isError ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {toast.message}
    </div>
  );
}
