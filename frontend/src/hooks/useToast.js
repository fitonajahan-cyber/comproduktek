import { useState, useRef, useCallback } from 'react';

/**
 * useToast - Custom hook untuk menampilkan notifikasi toast.
 *
 * @param {number} [duration=3000] - Durasi toast dalam milidetik.
 * @returns {{ toast: {type: string, message: string}|null, showToast: Function, hideToast: Function }}
 *
 * @example
 * const { toast, showToast } = useToast();
 * showToast('Data berhasil disimpan!');
 * showToast('Gagal menyimpan data.', 'error');
 */
export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback(
    (message, type = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ type, message });

      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, duration);
    },
    [duration],
  );

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
