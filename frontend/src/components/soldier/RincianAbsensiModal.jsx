import { useState, useEffect, useMemo, Fragment } from "react";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
} from "lucide-react";
import { exportToExcel, formatDDMMYYYY } from "../../utils/exportUtils";

// Mapping status — duplikasi dari Dashboard.jsx agar tidak menyentuh file yang sudah ada
const ABSENSI_STATUS_COLORS = {
  hadir: "bg-green-50 text-green-600",
  sakit: "bg-amber-50 text-amber-600",
  izin: "bg-dashAccent/10 text-dashAccent",
  dd: "bg-dashSky/30 text-dashNavy",
  bp: "bg-dashSky/30 text-dashNavy",
  dl: "bg-dashAccent/10 text-dashAccent",
  dik: "bg-dashSky/30 text-dashNavy",
  satgas: "bg-dashSky/30 text-dashNavy",
  tk: "bg-red-50 text-red-600",
  belum_diisi: "bg-gray-100 text-gray-500",
};

const ABSENSI_STATUS_LABELS = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  dd: "Dinas Dalam",
  bp: "Bawah Perintah",
  dl: "Dinas Luar",
  dik: "Pendidikan",
  satgas: "Satgas",
  tk: "Tanpa Keterangan",
  belum_diisi: "Belum Diisi",
};

const SANGGAHAN_COLORS = {
  none: "",
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
};

const SANGGAHAN_LABELS = {
  none: "—",
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const STATUS_USULAN_OPTIONS = [
  { value: "hadir", label: "Hadir" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "dd", label: "Dinas Dalam" },
  { value: "bp", label: "Bawah Perintah" },
  { value: "dl", label: "Dinas Luar" },
  { value: "dik", label: "Pendidikan" },
  { value: "satgas", label: "Satgas" },
  { value: "tk", label: "Tanpa Keterangan" },
];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function RincianAbsensiModal({
  onClose,
  showToast,
  onSanggahanSubmitted,
}) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchTanggal, setSearchTanggal] = useState("");
  const [sanggahanForm, setSanggahanForm] = useState(null); // { id, status_usulan, keterangan_sanggahan }
  const [sanggahanLoading, setSanggahanLoading] = useState(false);

  const fetchList = async (b, t) => {
    try {
      setLoading(true);
      const res = await api.get("/absensi/monthly", {
        params: { bulan: b, tahun: t },
      });
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast(
        e.response?.data?.message ?? "Gagal memuat rincian absensi.",
        "error",
      );
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(bulan, tahun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulan, tahun]);

  const goPrevMonth = () => {
    setSanggahanForm(null);
    if (bulan === 1) {
      setBulan(12);
      setTahun((t) => t - 1);
    } else {
      setBulan((b) => b - 1);
    }
  };

  const goNextMonth = () => {
    setSanggahanForm(null);
    const today = new Date();
    const isCurrent =
      bulan === today.getMonth() + 1 && tahun === today.getFullYear();
    if (isCurrent) return;
    if (bulan === 12) {
      setBulan(1);
      setTahun((t) => t + 1);
    } else {
      setBulan((b) => b + 1);
    }
  };

  const today = new Date();
  const isCurrentMonth =
    bulan === today.getMonth() + 1 && tahun === today.getFullYear();

  const filteredList = useMemo(() => {
    const q = searchTanggal.trim().toLowerCase();
    return list.filter((a) => {
      if (filterStatus !== "semua" && a.status !== filterStatus) return false;
      if (q) {
        const raw = (a.tanggal || "").toLowerCase();
        const shown = formatDate(a.tanggal).toLowerCase();
        if (!raw.includes(q) && !shown.includes(q)) return false;
      }
      return true;
    });
  }, [list, filterStatus, searchTanggal]);

  const submitSanggahan = async () => {
    if (!sanggahanForm) return;
    try {
      setSanggahanLoading(true);
      await api.put(`/absensi/${sanggahanForm.id}/sanggahan`, {
        status_usulan: sanggahanForm.status_usulan,
        keterangan_sanggahan: sanggahanForm.keterangan_sanggahan,
      });
      showToast("Sanggahan berhasil diajukan.", "success");
      setSanggahanForm(null);
      await fetchList(bulan, tahun);
      onSanggahanSubmitted?.();
    } catch (e) {
      showToast(
        e.response?.data?.message ?? "Gagal mengajukan sanggahan.",
        "error",
      );
    } finally {
      setSanggahanLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rincian-absensi-modal-title"
        className="bg-white rounded-lg shadow-dashCard max-w-3xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h3
            id="rincian-absensi-modal-title"
            className="text-base font-bold text-dashNavy"
          >
            Rincian Data Rekap Absensi
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goPrevMonth}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-dashNavy bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg min-w-[120px] text-center">
              {MONTH_NAMES[bulan - 1]} {tahun}
            </span>
            <button
              onClick={goNextMonth}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Baris filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent"
            >
              <option value="semua">Semua Status</option>
              {Object.entries(ABSENSI_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Cari tanggal
            </label>
            <input
              type="text"
              value={searchTanggal}
              onChange={(e) => setSearchTanggal(e.target.value)}
              placeholder="Cari tanggal..."
              className="w-full sm:w-44 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent"
            />
            <button
              onClick={() => {
                const exportData = list.map((item, idx) => ({
                  No: idx + 1,
                  Tanggal: formatDDMMYYYY(item.tanggal),
                  Status: ABSENSI_STATUS_LABELS[item.status] || item.status,
                  "Status Sanggahan": SANGGAHAN_LABELS[item.sanggahan_status] || "-",
                  "Alasan Sanggahan": item.sanggahan_alasan || "-",
                  Keterangan: item.keterangan || "-",
                }));
                exportToExcel(
                  exportData,
                  `Rekap_Absensi_${MONTH_NAMES[bulan - 1]}_${tahun}`,
                  `Absensi ${MONTH_NAMES[bulan - 1]}`
                );
              }}
              className="h-[38px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition shrink-0"
              title="Export data absensi satu bulan penuh ke Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Memuat...
            </p>
          ) : filteredList.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Tidak ada data untuk ditampilkan.
            </p>
          ) : (
            <table className="w-full text-sm text-gray-500">
              <thead className="sticky top-0">
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold">
                    Tanggal
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Sanggahan
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Keterangan
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((a) => {
                  const isPending = a.sanggahan_status === "pending";
                  const isFormOpen = sanggahanForm?.id === a.id;
                  return (
                    <Fragment key={a.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-medium text-xs tabular-nums text-dashNavy">
                          {formatDate(a.tanggal)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ABSENSI_STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-500"}`}
                          >
                            {ABSENSI_STATUS_LABELS[a.status] ?? a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {a.sanggahan_status !== "none" ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SANGGAHAN_COLORS[a.sanggahan_status]}`}
                            >
                              {SANGGAHAN_LABELS[a.sanggahan_status]}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                          {a.keterangan || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!isPending && (
                            <button
                              onClick={() =>
                                setSanggahanForm(
                                  isFormOpen
                                    ? null
                                    : {
                                        id: a.id,
                                        status_usulan: a.status,
                                        keterangan_sanggahan: "",
                                      },
                                )
                              }
                              className="px-2 py-1 text-xs rounded-lg bg-dashNavy/10 text-dashNavy hover:bg-dashNavy/20 transition font-semibold"
                            >
                              {isFormOpen ? "Batal" : "Sanggah"}
                            </button>
                          )}
                          {isPending && (
                            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 justify-center">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                      {isFormOpen && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 pb-3 pt-0 bg-amber-50/50"
                          >
                            <div className="border border-amber-200 rounded-lg p-4 space-y-3">
                              <p className="text-xs font-semibold text-amber-600">
                                Ajukan Sanggahan
                              </p>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                  Status Usulan
                                </label>
                                <select
                                  value={sanggahanForm.status_usulan}
                                  onChange={(e) =>
                                    setSanggahanForm((prev) => ({
                                      ...prev,
                                      status_usulan: e.target.value,
                                    }))
                                  }
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent"
                                >
                                  {STATUS_USULAN_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                  Alasan
                                </label>
                                <textarea
                                  value={sanggahanForm.keterangan_sanggahan}
                                  onChange={(e) =>
                                    setSanggahanForm((prev) => ({
                                      ...prev,
                                      keterangan_sanggahan: e.target.value,
                                    }))
                                  }
                                  rows={2}
                                  placeholder="Jelaskan alasan sanggahan..."
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                                />
                              </div>
                              <button
                                onClick={submitSanggahan}
                                disabled={sanggahanLoading}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 transition"
                              >
                                {sanggahanLoading
                                  ? "Mengajukan..."
                                  : "Kirim Sanggahan"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
