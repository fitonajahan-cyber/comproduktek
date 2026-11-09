import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/admin/Toast";
import ConfirmModal from "../../components/admin/ConfirmModal";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Users,
  Calendar,
  Download,
} from "lucide-react";
import { exportToExcel, formatDDMMYYYY } from "../../utils/exportUtils";

export default function LaporanManage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, showToast } = useToast();

  const fetchLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (tanggal) params.tanggal = tanggal;
      const res = await api.get("/laporan-harian", { params });
      setLaporan(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast("Gagal memuat laporan harian.", "error");
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/laporan-harian/${deleteTarget.id}`);
      showToast("Laporan berhasil dihapus.");
      setDeleteTarget(null);
      fetchLaporan();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Gagal menghapus.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!laporan || laporan.length === 0) return null;

    const uniqueSoldiers = new Set(laporan.map((l) => l.soldier_id)).size;
    const totalSesi = laporan.reduce(
      (sum, l) => sum + (l.LaporanHarianSesis?.length || 0),
      0,
    );

    return {
      total: laporan.length,
      uniqueSoldiers,
      totalSesi,
      avgSesiPerLaporan:
        laporan.length > 0
          ? Math.round((totalSesi / laporan.length) * 10) / 10
          : 0,
    };
  }, [laporan]);

  const infoCards = [
    { label: "Total Laporan", value: metrics?.total || 0, loading },
    { label: "Personel Unik", value: metrics?.uniqueSoldiers || 0, loading },
    { label: "Total Sesi", value: metrics?.totalSesi || 0, loading },
    {
      label: "Rata-rata/Laporan",
      value: metrics?.avgSesiPerLaporan || 0,
      loading,
      subtitle: "sesi",
    },
  ];

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("hierarki");

  const filtered = laporan.filter((l) => {
    const name = (
      l.Soldier?.full_name ??
      l.Soldier?.username ??
      ""
    ).toLowerCase();
    const position = (l.Soldier?.OrgStructure?.position ?? "").toLowerCase();
    const lowerQ = q.toLowerCase();
    return name.includes(lowerQ) || position.includes(lowerQ);
  });

  const filteredAndSorted = [...filtered].sort((a, b) => {
    const nameA = (
      a.Soldier?.full_name ??
      a.Soldier?.username ??
      ""
    ).toLowerCase();
    const nameB = (
      b.Soldier?.full_name ??
      b.Soldier?.username ??
      ""
    ).toLowerCase();
    const dateA = a.tanggal || "";
    const dateB = b.tanggal || "";

    if (sortBy === "hierarki") {
      const orderA = a.Soldier?.OrgStructure?.display_order ?? 999999;
      const orderB = b.Soldier?.OrgStructure?.display_order ?? 999999;
      return orderA - orderB;
    }
    if (sortBy === "nama_asc") return nameA.localeCompare(nameB);
    if (sortBy === "nama_desc") return nameB.localeCompare(nameA);
    if (sortBy === "tanggal_asc") return dateA.localeCompare(dateB);
    if (sortBy === "tanggal_desc") return dateB.localeCompare(dateA);
    return 0;
  });

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Reset page to 1 when search, sort, or date filter changes
  useEffect(() => {
    setPage(1);
  }, [q, tanggal, sortBy]);

  return (
    <div className="font-dash">
      <PageHeader
        title="Laporan Aktivitas Harian"
        subtitle="Rekap laporan kegiatan harian seluruh personel."
      />

      <div className="mb-5">
        <InfoCardGrid cards={infoCards} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search-laporan"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau jabatan..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            id="tanggal-filter-laporan"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="text-sm text-dashNavy bg-transparent focus:outline-none"
          />
          {tanggal && (
            <button
              onClick={() => setTanggal("")}
              className="text-xs text-dashNavy/40 hover:text-red-500 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-8 py-2.5 border border-gray-200 rounded-md text-sm text-dashNavy bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
          >
            <option value="hierarki">Urutan Jabatan (Hierarki)</option>
            <option value="nama_asc">Nama (A - Z)</option>
            <option value="nama_desc">Nama (Z - A)</option>
            <option value="tanggal_desc">Terbaru</option>
            <option value="tanggal_asc">Terlama</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={() => {
            const exportData = [];
            filteredAndSorted.forEach((lap) => {
              const prajurit = lap.Soldier?.full_name || lap.Soldier?.username || "-";
              const jabatan = lap.Soldier?.OrgStructure?.position || "-";
              if (lap.LaporanHarianSesis && lap.LaporanHarianSesis.length > 0) {
                lap.LaporanHarianSesis.forEach((sesi, sIdx) => {
                  exportData.push({
                    Tanggal: formatDDMMYYYY(lap.tanggal),
                    "Nama Personel": prajurit,
                    Jabatan: jabatan,
                    Sesi: sesi.sesi || `Sesi ${sIdx + 1}`,
                    Kegiatan: sesi.aktivitas || "-",
                    Hasil: sesi.hasil || "-",
                    Keterangan: sesi.keterangan || "-",
                  });
                });
              } else {
                exportData.push({
                  Tanggal: formatDDMMYYYY(lap.tanggal),
                  "Nama Personel": prajurit,
                  Jabatan: jabatan,
                  Sesi: "-",
                  Kegiatan: "Tidak ada rincian sesi",
                  Hasil: "-",
                  Keterangan: "-",
                });
              }
            });
            exportToExcel(exportData, `Rekap_Laporan_Harian_${tanggal ? formatDDMMYYYY(tanggal) : "Semua"}`, "Laporan Harian");
          }}
          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition shrink-0"
          title="Export Laporan ke Excel (.xlsx)"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>

        <button
          id="refresh-laporan"
          onClick={fetchLaporan}
          className="inline-flex items-center justify-center bg-dashAccent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:bg-dashAccent/90 transition shrink-0"
        >
          Muat Ulang
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-10 text-center text-sm text-dashNavy/50">
          Memuat data laporan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-dashNavy/50">
          <FileText className="w-8 h-8 mx-auto mb-2 text-dashNavy/20" />
          Tidak ada laporan ditemukan.
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedData.map((l) => (
            <div
              key={l.id}
              className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition">
                <button
                  id={`expand-laporan-${l.id}`}
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => toggleExpand(l.id)}
                >
                  <span className="text-dashNavy/30">
                    {expanded[l.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-dashNavy">
                      {l.Soldier?.full_name ?? l.Soldier?.username ?? "—"}
                    </p>
                    <p className="text-xs text-dashNavy/50 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(l.tanggal)}
                      <span className="mx-1">·</span>
                      <Users className="w-3 h-3" />
                      {l.LaporanHarianSesis?.length ?? 0} sesi
                      {l.Soldier?.OrgStructure?.position && (
                        <>
                          <span className="mx-1">·</span>
                          <span>{l.Soldier.OrgStructure.position}</span>
                        </>
                      )}
                    </p>
                  </div>
                </button>
                <button
                  id={`delete-laporan-${l.id}`}
                  onClick={() => setDeleteTarget(l)}
                  className="flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-red-100 text-red-600 hover:bg-red-600 hover:text-white ml-3"
                >
                  Hapus
                </button>
              </div>

              {/* Expanded detail */}
              {expanded[l.id] && (
                <div className="border-t border-gray-100 px-4 py-3">
                  {!l.LaporanHarianSesis ||
                  l.LaporanHarianSesis.length === 0 ? (
                    <p className="text-sm text-dashNavy/40">Tidak ada sesi.</p>
                  ) : (
                    <div className="space-y-3">
                      {l.LaporanHarianSesis.map((s) => (
                        <div
                          key={s.id}
                          className="flex gap-4 text-sm border-l-2 border-dashSky/40 pl-3"
                        >
                          <span className="text-dashNavy/40 font-semibold whitespace-nowrap w-14 shrink-0">
                            Sesi {s.urutan_sesi}
                          </span>
                          <div className="space-y-0.5 flex-1">
                            <p className="text-dashNavy font-medium">
                              {s.aktivitas}
                            </p>
                            <p className="text-dashNavy/60 text-xs">
                              {s.output_hasil}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-sm transition ${p === page ? "bg-dashNavy text-white" : "bg-white border border-gray-200 text-dashNavy hover:border-dashAccent"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        headerTitle="Hapus Laporan"
        title={`Hapus seluruh laporan milik "${deleteTarget?.Soldier?.full_name ?? deleteTarget?.Soldier?.username}" pada ${formatDate(deleteTarget?.tanggal)}? Semua sesi akan ikut terhapus.`}
        confirmText="Hapus Permanen"
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
