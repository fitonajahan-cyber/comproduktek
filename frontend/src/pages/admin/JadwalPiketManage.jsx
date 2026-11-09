import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, RefreshCw, RotateCcw, AlertCircle, Search, Filter, ArrowUpDown, Download } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import ConfirmModal from "../../components/admin/ConfirmModal";
import FormModal from "../../components/admin/FormModal";
import Toast from "../../components/admin/Toast";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import { useToast } from "../../hooks/useToast";
import { exportToExcel, formatDDMMYYYY } from "../../utils/exportUtils";

const BULAN = [
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
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const statusOptions = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "completed", label: "Selesai" },
  { value: "absent", label: "Tidak Hadir" },
];

const formatLocalDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getToday = () => {
  const today = new Date();
  return {
    bulan: today.getMonth() + 1,
    tahun: today.getFullYear(),
    tanggal: formatLocalDate(today),
  };
};
const getDayName = (date) => HARI[new Date(`${date}T00:00:00`).getDay()];
const getDaysCount = (bulan, tahun) => new Date(tahun, bulan, 0).getDate();

const StatusBadge = ({ status }) => {
  const map = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    absent: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {statusOptions.find((s) => s.value === status)?.label || status}
    </span>
  );
};

export default function JadwalPiketManage() {
  const today = useMemo(getToday, []);
  const [bulan, setBulan] = useState(today.bulan);
  const [tahun, setTahun] = useState(today.tahun);
  const [items, setItems] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingSwapItems, setPendingSwapItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("tanggal_asc");
  const [activeTab, setActiveTab] = useState("jadwal");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewType, setReviewType] = useState("status");
  const [reviewLoading, setReviewLoading] = useState(false);
  const { toast, showToast } = useToast();

  const daysCount = useMemo(() => getDaysCount(bulan, tahun), [bulan, tahun]);
  const rotationCount = soldiers.length
    ? Math.ceil(daysCount / soldiers.length)
    : "—";

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (filterStatus !== "all") {
      result = result.filter((item) => item.status === filterStatus);
    }

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter((item) => {
        const soldierName = (item.Soldier?.full_name || "").toLowerCase();
        const soldierUname = (item.Soldier?.username || "").toLowerCase();
        const soldierPangkat = (item.Soldier?.pangkat || "").toLowerCase();
        const keterangan = (item.keterangan || "").toLowerCase();
        const tanggal = (item.tanggal_piket || "").toLowerCase();
        return (
          soldierName.includes(lowerQ) ||
          soldierUname.includes(lowerQ) ||
          soldierPangkat.includes(lowerQ) ||
          keterangan.includes(lowerQ) ||
          tanggal.includes(lowerQ)
        );
      });
    }

    result.sort((a, b) => {
      const dateA = a.tanggal_piket || "";
      const dateB = b.tanggal_piket || "";
      const nameA = (a.Soldier?.full_name || a.Soldier?.username || "").toLowerCase();
      const nameB = (b.Soldier?.full_name || b.Soldier?.username || "").toLowerCase();
      const statusOrder = { scheduled: 1, completed: 2, absent: 3 };

      switch (sortBy) {
        case "tanggal_desc":
          return dateB.localeCompare(dateA);
        case "nama_asc":
          return nameA.localeCompare(nameB);
        case "nama_desc":
          return nameB.localeCompare(nameA);
        case "status_asc":
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        case "status_desc":
          return (statusOrder[b.status] || 99) - (statusOrder[a.status] || 99);
        case "tanggal_asc":
        default:
          return dateA.localeCompare(dateB);
      }
    });

    return result;
  }, [items, q, filterStatus, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jadwalRes, soldierRes] = await Promise.all([
        api.get("/jadwal-piket", { params: { bulan, tahun, limit: 100 } }),
        api.get("/soldiers", { params: { eligible: "piket", limit: 1000 } }),
      ]);
      setItems(jadwalRes.data.data || []);
      setSoldiers(
        Array.isArray(soldierRes.data)
          ? soldierRes.data
          : soldierRes.data.data || [],
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal memuat data jadwal piket.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingItems = async () => {
    try {
      const res = await api.get("/jadwal-piket", {
        params: { approval_status: "pending", limit: 100 },
      });
      setPendingItems(res.data.data || []);
    } catch (error) {
      // silent
    }
  };

  const fetchPendingSwapItems = async () => {
    try {
      const res = await api.get("/jadwal-piket", {
        params: { swap_approval_status: "pending", limit: 100 },
      });
      setPendingSwapItems(res.data.data || []);
    } catch (error) {
      // silent
    }
  };

  useEffect(() => {
    if (activeTab === "jadwal") fetchData();
    else if (activeTab === "usulan") fetchPendingItems();
    else fetchPendingSwapItems();
  }, [bulan, tahun, activeTab]);

  useEffect(() => {
    fetchPendingItems();
    fetchPendingSwapItems();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/jadwal-piket/generate", { bulan, tahun });
      showToast(
        `${res.data.message} Total: ${res.data.meta.total_generated} hari, ${res.data.meta.total_eligible} anggota eligible.`,
        "success",
      );
      fetchData();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal generate jadwal piket.",
        "error",
      );
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/jadwal-piket/${editingItem.id}`, formData);
      setEditingItem(null);
      showToast("Jadwal piket berhasil diperbarui.", "success");
      fetchData();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal memperbarui jadwal piket.",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/jadwal-piket/${deleteItem.id}`);
      setDeleteItem(null);
      showToast("Jadwal piket berhasil dihapus.", "success");
      fetchData();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menghapus jadwal piket.",
        "error",
      );
    }
  };

  const handleReset = async () => {
    try {
      await api.delete("/jadwal-piket/reset", { params: { bulan, tahun } });
      setResetOpen(false);
      showToast("Jadwal piket bulan ini berhasil direset.", "success");
      fetchData();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal reset jadwal piket.",
        "error",
      );
    }
  };

  const handleReview = async () => {
    try {
      setReviewLoading(true);
      await api.put(`/jadwal-piket/${reviewingItem.id}/${reviewType === "swap" ? "review-tukar" : "review-usulan"}`, {
        action: reviewAction,
      });
      showToast(
        `Usulan berhasil di${reviewAction === "approve" ? "setujui" : "tolak"}.`,
        "success",
      );
      setReviewingItem(null);
      setReviewAction(null);
      if (reviewType === "swap") fetchPendingSwapItems();
      else fetchPendingItems();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mereview usulan.",
        "error",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const fields = [
    {
      name: "soldier_id",
      label: "Anggota Piket",
      type: "select",
      required: true,
      options: soldiers.map((soldier) => ({
        value: String(soldier.id),
        label: soldier.full_name || soldier.username,
      })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "keterangan",
      label: "Keterangan",
      type: "textarea",
      required: false,
    },
  ];

  return (
    <div className="font-dash">
      <PageHeader
        title="Jadwal Piket"
        subtitle="Kelola jadwal piket bulanan Satlak Duktek."
      />

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: "jadwal", label: "Jadwal Piket", icon: CalendarCheck },
          { key: "usulan", label: "Usulan Status", icon: AlertCircle },
          { key: "tukar", label: "Usulan Tukar", icon: AlertCircle },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t transition ${activeTab === tab.key ? "text-dashAccent border-b-2 border-dashAccent" : "text-dashNavy/50 hover:text-dashNavy"}`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "usulan" && pendingItems.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingItems.length}
                </span>
              )}
              {tab.key === "tukar" && pendingSwapItems.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingSwapItems.length}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "jadwal" && (
        <>
          <div className="mb-5 mt-5">
            <InfoCardGrid
              cards={[
                { label: "Total Hari", value: daysCount, loading },
                { label: "Jadwal Terisi", value: items.length, loading },
                {
                  label: "Anggota Eligible",
                  value: soldiers.length || "—",
                  loading,
                },
                { label: "Rotasi/Bulan", value: rotationCount, loading },
              ]}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full sm:w-44 pl-9 pr-8 py-2.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
            >
              {BULAN.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full sm:w-28 px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-dashAccent px-4 py-2.5 text-sm font-semibold text-white hover:bg-dashAccent/90 disabled:opacity-60 transition"
            >
              <RefreshCw className="w-4 h-4" /> Generate Jadwal
            </button>
            <button
              onClick={() => setResetOpen(true)}
              disabled={loading || items.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Bulan Ini
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama prajurit, pangkat, tanggal, atau keterangan..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
              />
            </div>

            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-44 pl-9 pr-8 py-2.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="scheduled">Terjadwal</option>
                <option value="completed">Selesai</option>
                <option value="absent">Tidak Hadir</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-8 py-2.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
              >
                <option value="tanggal_asc">Tanggal (Terlama / Awal)</option>
                <option value="tanggal_desc">Tanggal (Terbaru / Akhir)</option>
                <option value="nama_asc">Nama Anggota (A - Z)</option>
                <option value="nama_desc">Nama Anggota (Z - A)</option>
                <option value="status_asc">Status (Terjadwal Dahulu)</option>
                <option value="status_desc">Status (Tidak Hadir Dahulu)</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => {
                const exportData = filteredAndSortedItems.map((item, idx) => ({
                  No: idx + 1,
                  Tanggal: formatDDMMYYYY(item.tanggal_piket),
                  Hari: getDayName(item.tanggal_piket),
                  "Nama Anggota": item.Soldier?.nama || item.Soldier?.username || "-",
                  Pangkat: item.Soldier?.pangkat || "-",
                  NRP: item.Soldier?.nrp || "-",
                  Jabatan: item.Soldier?.jabatan || "-",
                  Status: statusOptions.find((s) => s.value === item.status)?.label || item.status,
                  Keterangan: item.keterangan || "-",
                }));
                exportToExcel(exportData, `Jadwal_Piket_${BULAN[bulan - 1]}_${tahun}`, "Jadwal Piket");
              }}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition shrink-0"
              title="Export Jadwal ke Excel (.xlsx)"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>

          <JadwalTable
            items={filteredAndSortedItems}
            today={today}
            loading={loading}
            onEdit={setEditingItem}
            onDelete={setDeleteItem}
          />
        </>
      )}
      {activeTab === "usulan" && (
        <PendingTable
          items={pendingItems}
          loading={loading}
          onReview={(item, action) => {
            setReviewType("status");
            setReviewingItem(item);
            setReviewAction(action);
          }}
        />
      )}
      {activeTab === "tukar" && (
        <SwapPendingTable
          items={pendingSwapItems}
          loading={loading}
          onReview={(item, action) => {
            setReviewType("swap");
            setReviewingItem(item);
            setReviewAction(action);
          }}
        />
      )}

      {editingItem && (
        <FormModal
          open={!!editingItem}
          title={`Edit Jadwal ${formatDate(editingItem.tanggal_piket)}`}
          fields={fields}
          initialValues={{
            soldier_id: String(editingItem.soldier_id),
            status: editingItem.status,
            keterangan: editingItem.keterangan || "",
          }}
          onCancel={() => setEditingItem(null)}
          onSubmit={handleUpdate}
        />
      )}
      <ConfirmModal
        open={!!deleteItem}
        title={`Yakin ingin menghapus jadwal piket tanggal ${deleteItem ? formatDate(deleteItem.tanggal_piket) : ""}?`}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        headerTitle="Hapus Jadwal Piket"
      />
      <ConfirmModal
        open={resetOpen}
        title={`Yakin ingin menghapus semua jadwal piket ${BULAN[bulan - 1]} ${tahun}?`}
        onCancel={() => setResetOpen(false)}
        onConfirm={handleReset}
        headerTitle="Reset Jadwal Bulan Ini"
      />
      <ConfirmModal
        open={!!reviewingItem}
        title={`Yakin ingin ${reviewAction === "approve" ? "menyetujui" : "menolak"} usulan ${reviewType === "swap" ? "tukar" : "status"} ${reviewingItem ? formatDate(reviewingItem.tanggal_piket) : ""}?`}
        onCancel={() => {
          setReviewingItem(null);
          setReviewAction(null);
          setReviewType("status");
        }}
        onConfirm={handleReview}
        loading={reviewLoading}
        headerTitle="Review Usulan Piket"
      />

      <Toast toast={toast} />
    </div>
  );
}

function JadwalTable({ items, today, loading, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold">Hari</th>
              <th className="text-left px-4 py-3 font-semibold">Anggota</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Keterangan</th>
              <th className="text-right px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={`border-t border-gray-100 hover:bg-gray-50/50 transition ${item.tanggal_piket === today.tanggal ? "bg-dashMint/30" : ""}`}
              >
                <td className="px-4 py-3 text-dashNavy font-medium">
                  {formatDate(item.tanggal_piket)}
                </td>
                <td className="px-4 py-3 text-dashNavy/70">
                  {getDayName(item.tanggal_piket)}
                </td>
                <td className="px-4 py-3 text-dashNavy">
                  {item.Soldier?.full_name || item.Soldier?.username || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-dashNavy/70">
                  {item.keterangan || "-"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden space-y-3 p-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white border ${item.tanggal_piket === today.tanggal ? "border-dashAccent" : "border-gray-200"} rounded-lg p-4 shadow-dashCard`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-dashNavy">
                  {formatDate(item.tanggal_piket)}
                </p>
                <p className="text-xs text-dashNavy/50 mt-1">
                  {getDayName(item.tanggal_piket)}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 text-sm font-medium text-dashNavy">
              {item.Soldier?.full_name || item.Soldier?.username || "-"}
            </p>
            <p className="text-sm text-dashNavy/60 mt-1">
              {item.keterangan || "Tidak ada keterangan"}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-dashNavy hover:bg-dashSky/20 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item)}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 && (
        <div className="py-12 text-center text-dashNavy/50">
          <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
          Tidak ada data jadwal piket yang sesuai.
        </div>
      )}
    </div>
  );
}

function SwapPendingTable({ items, loading, onReview }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-dashNavy text-left">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Tanggal Asal</th>
            <th className="text-left px-4 py-3 font-semibold">Pemohon</th>
            <th className="text-left px-4 py-3 font-semibold">Tanggal Target</th>
            <th className="text-left px-4 py-3 font-semibold">Pengganti</th>
            <th className="text-left px-4 py-3 font-semibold">Alasan</th>
            <th className="text-right px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-4 py-3 text-dashNavy font-medium">{formatDate(item.tanggal_piket)}</td>
              <td className="px-4 py-3 text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</td>
              <td className="px-4 py-3 text-dashNavy font-medium">{item.SwapWithSchedule ? formatDate(item.SwapWithSchedule.tanggal_piket) : "-"}</td>
              <td className="px-4 py-3 text-dashNavy">{item.SwapWithSchedule?.Soldier?.full_name || item.SwapWithSchedule?.Soldier?.username || "-"}</td>
              <td className="px-4 py-3 text-dashNavy/70 max-w-xs truncate">{item.swap_reason || "-"}</td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onReview(item, "approve")} className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
                    Setujui
                  </button>
                  <button onClick={() => onReview(item, "reject")} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                    Tolak
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && items.length === 0 && (
        <div className="py-12 text-center text-dashNavy/50">
          <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
          Tidak ada usulan tukar pending.
        </div>
      )}
    </div>
  );
}

function PendingTable({ items, loading, onReview }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-dashNavy text-left">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
            <th className="text-left px-4 py-3 font-semibold">Anggota</th>
            <th className="text-left px-4 py-3 font-semibold">
              Status Saat Ini
            </th>
            <th className="text-left px-4 py-3 font-semibold">Usulan</th>
            <th className="text-left px-4 py-3 font-semibold">Keterangan</th>
            <th className="text-right px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-gray-100 hover:bg-gray-50/50 transition"
            >
              <td className="px-4 py-3 text-dashNavy font-medium">
                {formatDate(item.tanggal_piket)}
              </td>
              <td className="px-4 py-3 text-dashNavy">
                {item.Soldier?.full_name || item.Soldier?.username || "-"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status_usulan} />
              </td>
              <td className="px-4 py-3 text-dashNavy/70">
                {item.keterangan_usulan || "-"}
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onReview(item, "approve")}
                    className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => onReview(item, "reject")}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Tolak
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && items.length === 0 && (
        <div className="py-12 text-center text-dashNavy/50">
          <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
          Tidak ada usulan pending.
        </div>
      )}
    </div>
  );
}
