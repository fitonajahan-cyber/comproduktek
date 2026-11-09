import { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../lib/dateUtils';

export default function PiketUpdateModal({ schedule, onClose, onSuccess, showToast }) {
  const [mode, setMode] = useState('status');
  const [status, setStatus] = useState('completed');
  const [keterangan, setKeterangan] = useState('');
  const [swapWith, setSwapWith] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [swapTargets, setSwapTargets] = useState([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isFutureDate = schedule ? String(schedule.tanggal_piket) > todayStr : false;
  const isCompletedBlocked = status === 'completed' && isFutureDate;

  const openSwapMode = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/jadwal-piket/${schedule.id}/swap-targets`);
      setSwapTargets(res.data.data || []);
      setMode('swap');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat calon tukar.', 'error');
    }
  };

  const groupedTargets = useMemo(() => {
    const groups = {};
    (swapTargets || []).forEach((target) => {
      const sId = target.soldier_id;
      if (!groups[sId]) {
        const targetSoldier = target?.Soldier || {};
        const pos = targetSoldier?.OrgStructure?.position;
        const rank = targetSoldier?.OrgStructure?.rank;
        const roleInfo = [pos, rank ? `(${rank})` : ''].filter(Boolean).join(' ');
        const label = `${targetSoldier?.full_name || targetSoldier?.username || 'Anggota'}${roleInfo ? ` – ${roleInfo}` : ''}`;
        groups[sId] = {
          soldierId: sId,
          label,
          schedules: [],
        };
      }
      groups[sId].schedules.push(target);
    });
    return Object.values(groups);
  }, [swapTargets]);

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    if (!swapWith || !swapReason.trim()) {
      showToast('Pilih anggota dan alasan wajib diisi.', 'error');
      return;
    }

    try {
      setSwapLoading(true);
      await api.put(`/jadwal-piket/${schedule.id}/usulan-tukar`, {
        swap_with_schedule_id: swapWith,
        swap_reason: swapReason.trim(),
      });
      showToast('Usulan tukar jadwal berhasil diajukan.', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan tukar jadwal.', 'error');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode !== 'status') return;
    if (isCompletedBlocked) {
      showToast('Status selesai hanya bisa diajukan pada hari H atau setelah tanggal piket.', 'error');
      return;
    }
    if (status === 'absent' && !keterangan.trim()) {
      showToast('Keterangan wajib diisi jika tidak hadir.', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      await api.put(`/jadwal-piket/${schedule.id}/usulan`, { status, keterangan });
      showToast('Usulan status piket berhasil diajukan.', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan usulan status piket.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!schedule) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" className="bg-white rounded-lg p-6 max-w-md w-full shadow-dashCard max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-dashNavy mb-1">
          {mode === 'swap' ? 'Tukar Jadwal Piket' : 'Update Status Piket'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Tanggal piket: <span className="font-medium text-gray-700">{formatDate(schedule.tanggal_piket)}</span>
        </p>

        <div className="flex gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setMode('status')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              mode === 'status'
                ? 'bg-dashNavy text-white border-dashNavy'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Status
          </button>
          <button
            type="button"
            onClick={openSwapMode}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              mode === 'swap'
                ? 'bg-dashNavy text-white border-dashNavy'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tukar Jadwal
          </button>
        </div>

        {mode === 'status' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
              >
                <option value="completed">Selesai</option>
                <option value="absent">Tidak Hadir</option>
              </select>
            </div>

            {isCompletedBlocked && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Status <strong>Selesai</strong> hanya dapat diajukan pada hari H atau setelah tanggal piket ({formatDate(schedule.tanggal_piket)}). Silakan pilih <strong>Tidak Hadir</strong> jika ingin mengajukan izin/ketidakhadiran lebih awal.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Keterangan
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                required={status === 'absent'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent resize-none"
                placeholder={status === 'absent' ? 'Isi alasan jika tidak hadir (izin, sakit, penugasan luar, dll)...' : 'Keterangan tambahan (opsional)...'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Batal
              </button>
              <button
                type="submit"
                disabled={submitLoading || isCompletedBlocked}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? 'Mengirim...' : 'Kirim Usulan'}
              </button>
            </div>
          </form>
        )}

        {mode === 'swap' && (
          <form onSubmit={handleSwapSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Pilih Anggota & Tanggal Pengganti
              </label>
              <select
                value={swapWith}
                onChange={(e) => setSwapWith(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
              >
                <option value="">Pilih anggota & tanggal piket</option>
                {groupedTargets.length === 0 ? (
                  <option value="" disabled>Tidak ada jadwal pengganti yang tersedia</option>
                ) : (
                  groupedTargets.map((group) => (
                    <optgroup key={group.soldierId} label={group.label}>
                      {group.schedules.map((target) => (
                        <option key={target.id} value={target.id}>
                          Piket: {formatDate(target.tanggal_piket)}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Jadwal pengganti harus berada di bulan yang sama, belum lewat, dan masih berstatus terjadwal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Alasan Tukar
              </label>
              <textarea
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent resize-none"
                placeholder="Jelaskan alasan pertukaran jadwal piket..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setMode('status')} className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Kembali
              </button>
              <button
                type="submit"
                disabled={swapLoading || !swapWith}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {swapLoading ? 'Mengajukan...' : 'Kirim Usulan Tukar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
