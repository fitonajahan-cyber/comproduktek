import { useEffect, useState, useMemo } from 'react';
import { formatDate, formatDateTime } from '../../lib/dateUtils';
import { X, Search, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';
import InfoCardGrid from '../../components/admin/InfoCardGrid';
import PageHeader from '../../components/admin/PageHeader';
import { useToast } from '../../hooks/useToast';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("tanggal_desc");

  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get('/messages', { params: { page, limit: 8 } })
      .then((r) => {
        setMessages(r.data.data);
        setTotalPages(r.data.pagination.totalPages || 1);
      })
      .catch(() => showToast('Gagal memuat pesan.', 'error'))
      .finally(() => setLoading(false));
  };

  const loadAllMessages = () => {
    api
      .get('/messages', { params: { limit: 1000 } })
      .then((r) => setAllMessages(r.data.data || []))
      .catch(() => showToast('Gagal memuat ringkasan pesan.', 'error'));
  };

  useEffect(load, [page]);
  useEffect(loadAllMessages, []);

  const openDetail = async (msg) => {
    try {
      const r = await api.get(`/messages/${msg.id}`);
      setDetail(r.data.data);
      // status mungkin berubah otomatis jadi "Sudah Dibaca" -> refresh list
      load();
    } catch {
      showToast('Gagal membuka pesan.', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/messages/${deleting.id}`);
      showToast('Pesan berhasil dihapus.');
      setDeleting(null);
      load();
    } catch {
      showToast('Gagal menghapus pesan.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAndSortedMessages = useMemo(() => {
    let result = [...messages];

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter((m) =>
        (m.sender_name || "").toLowerCase().includes(lowerQ) ||
        (m.subject || "").toLowerCase().includes(lowerQ) ||
        (m.message || "").toLowerCase().includes(lowerQ)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "tanggal_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "tanggal_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "nama_asc":
          return (a.sender_name || "").localeCompare(b.sender_name || "");
        case "nama_desc":
          return (b.sender_name || "").localeCompare(a.sender_name || "");
        case "status_unread":
          return a.status === "Belum Dibaca" ? -1 : 1;
        case "status_read":
          return a.status === "Sudah Dibaca" ? -1 : 1;
        default:
          return 0;
      }
    });

    return result;
  }, [messages, q, sortBy]);

  const metrics = useMemo(() => {
    if (!allMessages || allMessages.length === 0) return null;

    const unread = allMessages.filter(m => m.status === 'Belum Dibaca').length;
    const read = allMessages.filter(m => m.status === 'Sudah Dibaca').length;

    return {
      total: allMessages.length,
      unread,
      read
    };
  }, [allMessages]);

  const infoCards = [
    { label: 'Total Pesan', value: metrics?.total || 0, loading },
    { label: 'Belum Dibaca', value: metrics?.unread || 0, loading },
    { label: 'Sudah Dibaca', value: metrics?.read || 0, loading },
    { label: 'Rata-rata/Bulan', value: metrics?.total ? Math.round(metrics.total / 12) : 0, loading, subtitle: 'Estimasi' },
  ];

  return (
    <div className="font-dash">
      <PageHeader
        title="Kotak Masuk"
        subtitle="Lihat dan kelola pesan masuk dari pengunjung website."
      />

      <div className="mb-5">
        <InfoCardGrid cards={infoCards} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pengirim, subjek, atau isi pesan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>

        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
          >
            <option value="tanggal_desc">Tanggal Terbaru</option>
            <option value="tanggal_asc">Tanggal Terlama</option>
            <option value="nama_asc">Nama Pengirim (A - Z)</option>
            <option value="nama_desc">Nama Pengirim (Z - A)</option>
            <option value="status_unread">Status (Belum Dibaca Dulu)</option>
            <option value="status_read">Status (Sudah Dibaca Dulu)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-dashCard overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nama Pengirim</th>
              <th scope="col" className="px-4 py-3 font-semibold">Subjek</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
              <th scope="col" className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-dashNavy/40">Memuat...</td></tr>}
            {!loading && filteredAndSortedMessages.length === 0 && messages.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-dashNavy/40">Belum ada pesan.</td></tr>}
            {!loading && filteredAndSortedMessages.length === 0 && messages.length > 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-dashNavy/40">Pesan tidak ditemukan untuk kata kunci pencarian ini.</td></tr>}
            {filteredAndSortedMessages.map((m) => {
              const unread = m.status === 'Belum Dibaca';
              return (
                <tr key={m.id} className={`hover:bg-gray-50/50 transition ${unread ? 'font-semibold' : ''}`}>
                  <td className="px-4 py-3 cursor-pointer text-black" onClick={() => openDetail(m)}>{m.sender_name}</td>
                  <td className="px-4 py-3 cursor-pointer text-black" onClick={() => openDetail(m)}>{m.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${unread ? 'bg-dashAccent/15 text-dashAccent' : 'bg-gray-100 text-dashNavy/60'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-normal text-dashNavy/60">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button onClick={() => setDeleting(m)} className="flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-red-100 text-red-600 hover:bg-red-600 hover:text-white">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-sm transition ${p === page ? 'bg-dashNavy text-white' : 'bg-white border border-gray-200 text-dashNavy hover:border-dashAccent'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal detail pesan */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setDetail(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="inbox-detail-title" className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 id="inbox-detail-title" className="text-lg font-semibold text-dashNavy">Detail Pesan</h3>
              <button onClick={() => setDetail(null)} className="text-dashNavy/50 hover:text-dashNavy transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="text-sm space-y-2">
              <div><dt className="text-dashNavy/50">Nama</dt><dd className="font-medium text-black">{detail.sender_name}</dd></div>
              <div><dt className="text-dashNavy/50">Email</dt><dd className="font-medium text-black">{detail.sender_email}</dd></div>
              <div><dt className="text-dashNavy/50">Subjek</dt><dd className="font-medium text-black">{detail.subject}</dd></div>
              <div><dt className="text-dashNavy/50">Tanggal</dt><dd className="text-black">{formatDateTime(detail.created_at)}</dd></div>
              <div><dt className="text-dashNavy/50">Pesan</dt><dd className="whitespace-pre-line text-black">{detail.message}</dd></div>
            </dl>
            <button onClick={() => setDetail(null)} className="w-full mt-6 bg-dashAccent text-white rounded-md py-2.5 text-sm font-semibold hover:brightness-95 transition">Tutup</button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title={`Pesan dari "${deleting?.sender_name || ''}" akan dihapus permanen. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
