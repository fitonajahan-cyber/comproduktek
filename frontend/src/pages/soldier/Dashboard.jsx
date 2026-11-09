import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import { isEligiblePiket } from "../../lib/piketEligibility";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/admin/Toast";
import ConfirmModal from "../../components/admin/ConfirmModal";
import MiniCalendar from "../../components/common/MiniCalendar";
import PiketUpdateModal from "../../components/soldier/PiketUpdateModal";
import RincianAbsensiModal from "../../components/soldier/RincianAbsensiModal";
import DocumentPreviewModal from "../../components/common/DocumentPreviewModal";
import {
  User,
  Lock,
  LogOut,
  CheckCircle2,
  Camera,
  ChevronDown,
  ChevronLeft,
  CalendarCheck,
  FileText,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  ChevronRight,
  Save,
  Building2,
  Plane,
  GraduationCap,
  Users,
  Download,
  Eye,
  CornerDownRight,
  ClipboardList,
  ArrowRightLeft,
  Send,
  Inbox,
} from "lucide-react";

const PROKER_PAGE_SIZE = 6;

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

const StatusBadge = ({ status }) => {
  switch (status) {
    case "hijau":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
          Beres
        </span>
      );
    case "merah":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
          Terlambat
        </span>
      );
    case "biru":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dashAccent/10 text-dashAccent border border-dashAccent/30">
          Dalam Pengerjaan
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
          {status}
        </span>
      );
  }
};

// Komponen inline untuk tambah sesi baru ke laporan hari ini
function AddSesiInline({ laporanId, onAdded, showToast }) {
  const [open, setOpen] = useState(false);
  const [aktivitas, setAktivitas] = useState("");
  const [outputHasil, setOutputHasil] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!aktivitas.trim() || !outputHasil.trim()) {
      showToast("Aktivitas dan output harus diisi.", "error");
      return;
    }
    try {
      setLoading(true);
      await api.post("/laporan-harian/sesi", {
        laporan_id: laporanId,
        aktivitas,
        output_hasil: outputHasil,
      });
      showToast("Sesi ditambahkan.", "success");
      setAktivitas("");
      setOutputHasil("");
      setOpen(false);
      onAdded();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Gagal menambah sesi.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open)
    return (
      <button
        id="inline-add-sesi"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-semibold text-dashAccent hover:underline transition mt-1"
      >
        <Plus className="w-3 h-3" /> Tambah Sesi Baru
      </button>
    );

  return (
    <div className="border border-dashAccent/30 rounded-lg p-3 space-y-2 bg-dashAccent/5 mt-1">
      <p className="text-xs font-semibold text-dashNavy">Tambah Sesi Baru</p>
      <textarea
        id="inline-aktivitas"
        value={aktivitas}
        onChange={(e) => setAktivitas(e.target.value)}
        rows={2}
        placeholder="Aktivitas..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
      />
      <textarea
        id="inline-output"
        value={outputHasil}
        onChange={(e) => setOutputHasil(e.target.value)}
        rows={2}
        placeholder="Output/Hasil..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-500"
        >
          Batal
        </button>
        <button
          id="inline-save-sesi"
          onClick={handleSubmit}
          disabled={loading}
          className="text-xs font-semibold text-dashAccent hover:underline disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Sesi"}
        </button>
      </div>
    </div>
  );
}

export default function SoldierDashboard() {
  const { user, logout, refreshUser } = useAuth();

  // Toast notifikasi (hook + komponen bersama dengan dashboard admin)
  const { toast, showToast, hideToast } = useToast(3500);

  // State Dropdown Header
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State Modal (Ganti Foto & Ganti Password)
  const [activeModal, setActiveModal] = useState(null); // 'photo' | 'password' | null

  // State Form Ganti Foto
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  useEffect(() => {
    if (!selectedPhoto) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto]);

  // State Form Ganti Password
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [messagePass, setMessagePass] = useState({ type: "", text: "" });

  // State Form Edit Profil
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [messageEdit, setMessageEdit] = useState({ type: "", text: "" });

  // State Program Kerja
  const [prokers, setProkers] = useState([]);
  const [prokerLoading, setProkerLoading] = useState(false);
  const [prokerPage, setProkerPage] = useState(1);
  const [hasilFiles, setHasilFiles] = useState({}); // { [prokerId]: File }
  const [uploadingHasilId, setUploadingHasilId] = useState(null);
  const [hapusHasilConfirmProker, setHapusHasilConfirmProker] = useState(null);
  const [deletingHasilId, setDeletingHasilId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { title, fileName, fileEndpoint, downloadEndpoint }

  // State Piket Calendar & Usulan Tukar
  const [piketRefreshTrigger, setPiketRefreshTrigger] = useState(0);
  const [piketModalSchedule, setPiketModalSchedule] = useState(null);
  const [swapHistory, setSwapHistory] = useState([]);
  const [swapHistoryLoading, setSwapHistoryLoading] = useState(false);
  const [swapTab, setSwapTab] = useState("outgoing"); // 'outgoing' | 'incoming'

  const outgoingSwaps = useMemo(
    () => swapHistory.filter((item) => item.is_requester),
    [swapHistory],
  );
  const incomingSwaps = useMemo(
    () => swapHistory.filter((item) => !item.is_requester),
    [swapHistory],
  );

  // Riwayat tukar jadwal hanya relevan untuk anggota aktif yang eligible piket
  const piketEligible = useMemo(() => isEligiblePiket(user), [user]);

  const fetchSwapHistory = useCallback(async () => {
    try {
      setSwapHistoryLoading(true);
      const res = await api.get("/jadwal-piket/my-swaps");
      setSwapHistory(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      /* silent */
    } finally {
      setSwapHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (piketEligible) fetchSwapHistory();
  }, [fetchSwapHistory, piketRefreshTrigger, piketEligible]);

  // ── STATE ABSENSI ────────────────────────────────────────────────────────
  const toLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [absensiList, setAbsensiList] = useState([]);
  const [absensiStats, setAbsensiStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    dd: 0,
    bp: 0,
    dl: 0,
    dik: 0,
    satgas: 0,
    tk: 0,
    belum_diisi: 0,
  });
  const [absensiLoading, setAbsensiLoading] = useState(false);
  const [sanggahanForm, setSanggahanForm] = useState(null); // { id, status_usulan, keterangan_sanggahan }
  const [sanggahanLoading, setSanggahanLoading] = useState(false);
  const [showRincianAbsensiModal, setShowRincianAbsensiModal] = useState(false);
  const fetchAbsensi = useCallback(async () => {
    try {
      setAbsensiLoading(true);
      const today = toLocalToday();
      const [listRes, statsRes] = await Promise.all([
        api.get("/absensi", { params: { tanggal: today } }),
        api.get("/absensi/stats"),
      ]);
      setAbsensiList(Array.isArray(listRes.data) ? listRes.data : []);
      setAbsensiStats(statsRes.data);
    } catch (e) {
      /* silent */
    } finally {
      setAbsensiLoading(false);
    }
  }, []);

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
      fetchAbsensi();
    } catch (e) {
      showToast(
        e.response?.data?.message ?? "Gagal mengajukan sanggahan.",
        "error",
      );
    } finally {
      setSanggahanLoading(false);
    }
  };

  // ── STATE LAPORAN HARIAN ─────────────────────────────────────────────────
  const [laporanList, setLaporanList] = useState([]);
  const [laporanLoading, setLaporanLoading] = useState(false);
  const [laporanExpandedId, setLaporanExpandedId] = useState(null);
  // Form tambah laporan hari ini
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanSesiRows, setLaporanSesiRows] = useState([
    { aktivitas: "", output_hasil: "" },
  ]);
  const [laporanSubmitting, setLaporanSubmitting] = useState(false);
  // today's laporan header id (for add/edit sesi on existing)
  const [todayLaporanId, setTodayLaporanId] = useState(null);
  // Edit sesi mode
  const [editSesi, setEditSesi] = useState(null); // { id, aktivitas, output_hasil }
  const [editSesiLoading, setEditSesiLoading] = useState(false);
  // Konfirmasi hapus sesi (ConfirmModal)
  const [sesiToDelete, setSesiToDelete] = useState(null);
  const [deleteSesiLoading, setDeleteSesiLoading] = useState(false);

  const fetchLaporan = useCallback(async () => {
    try {
      setLaporanLoading(true);
      const res = await api.get("/laporan-harian/mine");
      const data = Array.isArray(res.data) ? res.data : [];
      setLaporanList(data);
      const today = toLocalToday();
      const todayEntry = data.find((l) => l.tanggal === today);
      setTodayLaporanId(todayEntry ? todayEntry.id : null);
    } catch (e) {
      /* silent */
    } finally {
      setLaporanLoading(false);
    }
  }, []);

  const submitLaporan = async () => {
    const valid = laporanSesiRows.every(
      (r) => r.aktivitas.trim() && r.output_hasil.trim(),
    );
    if (!valid) {
      showToast("Semua baris sesi harus diisi.", "error");
      return;
    }
    try {
      setLaporanSubmitting(true);
      await api.post("/laporan-harian", { sesi: laporanSesiRows });
      showToast("Laporan berhasil disimpan.", "success");
      setShowLaporanForm(false);
      setLaporanSesiRows([{ aktivitas: "", output_hasil: "" }]);
      fetchLaporan();
    } catch (e) {
      showToast(
        e.response?.data?.message ?? "Gagal menyimpan laporan.",
        "error",
      );
    } finally {
      setLaporanSubmitting(false);
    }
  };

  const submitEditSesi = async () => {
    if (!editSesi) return;
    try {
      setEditSesiLoading(true);
      await api.put(`/laporan-harian/sesi/${editSesi.id}`, {
        aktivitas: editSesi.aktivitas,
        output_hasil: editSesi.output_hasil,
      });
      showToast("Sesi diperbarui.", "success");
      setEditSesi(null);
      fetchLaporan();
    } catch (e) {
      showToast(
        e.response?.data?.message ?? "Gagal memperbarui sesi.",
        "error",
      );
    } finally {
      setEditSesiLoading(false);
    }
  };

  const deleteSesi = async (sesiId) => {
    try {
      setDeleteSesiLoading(true);
      await api.delete(`/laporan-harian/sesi/${sesiId}`);
      showToast("Sesi dihapus.", "success");
      fetchLaporan();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Gagal menghapus sesi.", "error");
    } finally {
      setDeleteSesiLoading(false);
      setSesiToDelete(null);
    }
  };
  // Helper untuk mendapatkan URL gambar dari Backend
  // Menggunakan path relatif (/uploads/...) agar melewati Vite proxy
  // saat development dan tetap berfungsi di production.
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    // Jika sudah berupa URL lengkap (http/https), kembalikan apa adanya
    if (photoPath.startsWith("http")) return photoPath;

    // Bersihkan awalan duplikat "/uploads/" jika terlanjur tersimpan di DB
    let cleanPath = photoPath;
    if (cleanPath.startsWith("/uploads/")) {
      cleanPath = cleanPath.replace("/uploads/", "");
    }
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    // Gunakan path relatif — Vite proxy akan meneruskan ke backend:5000
    return `/uploads/${cleanPath}`;
  };
  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProkers = () => {
    setProkerLoading(true);
    api
      .get("/program-kerja", { params: { limit: 50 } })
      .then((res) => setProkers(res.data.data || []))
      .catch((err) => console.error("Gagal memuat program kerja:", err))
      .finally(() => setProkerLoading(false));
  };

  useEffect(() => {
    loadProkers();
    fetchAbsensi();
    fetchLaporan();
  }, [fetchAbsensi, fetchLaporan]);

  // Reset halaman pagination program kerja saat data berubah
  useEffect(() => {
    setProkerPage(1);
  }, [prokers.length]);

  const totalProkerPages = Math.ceil(prokers.length / PROKER_PAGE_SIZE);
  const prokerPageStart = (prokerPage - 1) * PROKER_PAGE_SIZE + 1;
  const prokerPageEnd = Math.min(prokerPage * PROKER_PAGE_SIZE, prokers.length);
  const visibleProkers = prokers.slice(
    (prokerPage - 1) * PROKER_PAGE_SIZE,
    prokerPage * PROKER_PAGE_SIZE,
  );

  // Handle Toggle Selesai Proker oleh Soldier
  const handleToggleSelesai = async (proker) => {
    try {
      const newStatus = !proker.is_selesai;
      await api.put(`/program-kerja/${proker.id}/soldier-update`, {
        is_selesai: newStatus,
      });
      loadProkers();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal memperbarui status tugas.",
        "error",
      );
    }
  };

  // Soldier adalah PIC (org structure match) ATAU anggota tim proker?
  const isPJatauTim = (proker) =>
    user?.org_structure_id === proker.pic_org_structure_id ||
    proker.tim?.some((t) => t.id === user?.id);

  // Handle Upload Dokumen Hasil oleh PJ / anggota tim
  const handleUploadHasil = async (proker) => {
    const file = hasilFiles[proker.id];
    if (!file) {
      showToast("Pilih file dokumen hasil terlebih dahulu.", "error");
      return;
    }
    setUploadingHasilId(proker.id);
    try {
      const formData = new FormData();
      formData.append("file_hasil", file);
      await api.put(`/program-kerja/${proker.id}/hasil`, formData);
      showToast("Dokumen hasil berhasil diunggah.", "success");
      setHasilFiles((f) => ({ ...f, [proker.id]: null }));
      loadProkers();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal mengunggah dokumen hasil.",
        "error",
      );
    } finally {
      setUploadingHasilId(null);
    }
  };

  // Handle Hapus Dokumen Hasil oleh PJ / anggota tim
  const handleDeleteHasil = async () => {
    if (!hapusHasilConfirmProker) return;
    try {
      setDeletingHasilId(hapusHasilConfirmProker.id);
      await api.delete(
        `/program-kerja/${hapusHasilConfirmProker.id}/file-hasil`,
      );
      showToast("Dokumen hasil berhasil dihapus.", "success");
      setHapusHasilConfirmProker(null);
      loadProkers();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menghapus dokumen hasil.",
        "error",
      );
    } finally {
      setDeletingHasilId(null);
    }
  };

  // Handle Upload Foto
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    const formData = new FormData();
    formData.append("photo", selectedPhoto);
    formData.append("full_name", user?.full_name || "");

    setLoadingPhoto(true);
    try {
      await api.put("/soldiers/profile", formData);

      setActiveModal(null);
      setSelectedPhoto(null);
      await refreshUser(); // Update foto di context tanpa reload halaman
      showToast("Foto profil berhasil diperbarui!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal mengupload foto.",
        "error",
      );
    } finally {
      setLoadingPhoto(false);
    }
  };

  // Handle Edit Profil
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    setMessageEdit({ type: "", text: "" });
    try {
      await api.put("/soldiers/profile", {
        full_name: editFullName,
        username: editUsername,
      });
      setActiveModal(null);
      await refreshUser();
      showToast("Profil berhasil diperbarui.", "success");
    } catch (err) {
      setMessageEdit({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui profil.",
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Handle Ganti Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessagePass({
        type: "error",
        text: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    setLoadingPass(true);
    setMessagePass({ type: "", text: "" });
    try {
      await api.put("/soldiers/profile", { oldPassword, password });
      setMessagePass({
        type: "success",
        text: "Password berhasil diperbarui.",
      });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err) {
      setMessagePass({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui password.",
      });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-panel font-dash pb-12">
      {/* Toast notifikasi (komponen bersama) */}
      <Toast toast={toast} />

      {/* 1. NAVBAR / HEADER ATAS DENGAN DROPDOWN PROFIL */}
      <div className="bg-white px-4 md:px-6 lg:px-8 py-2.5 lg:h-14 flex justify-between items-center sticky top-0 z-30 lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-40 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Logo Dukteksi"
            width="40"
            height="40"
            className="w-10 h-10 rounded-md object-contain shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-navy  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-extrabold text-sm md:text-lg tracking-tight uppercase leading-none">
            SATLAK DUKTEKSI
          </span>
        </div>

        {/* Dropdown Profil Kanan Atas */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-dashNavy transition py-1 px-2 rounded-lg hover:bg-gray-50"
          >
            <span>{user?.full_name || user?.username || "Prajurit"}</span>
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
              {user?.photo ? (
                <img
                  src={getPhotoUrl(user.photo)}
                  alt="Profile"
                  className="w-full h-full object-cover object-[50%_10%]"
                />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-dashCard border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setEditFullName(user?.full_name || "");
                  setEditUsername(user?.username || "");
                  setActiveModal("profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <User className="w-4 h-4 text-gray-500" /> Edit Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("photo");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <Camera className="w-4 h-4 text-gray-500" /> Ganti Foto Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("password");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <Lock className="w-4 h-4 text-gray-500" /> Ganti Password
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        {/* ── SIDEBAR KIRI — FIXED PANEL (desktop) ── */}
        <aside className="mt-5 flex flex-col gap-4 w-full px-4 md:px-6 lg:mt-0 lg:fixed lg:top-14 lg:left-0 lg:z-20 lg:h-[calc(100vh-56px)] lg:w-[380px] lg:overflow-y-auto lg:border-r lg:border-gray-100 lg:bg-panel lg:px-6 lg:pt-6 lg:pb-5">
          {/* 2a. Card Profil Ringkas */}
          <div className="w-full shrink-0 bg-white border border-gray-200 rounded-lg shadow-dashCard p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {user?.photo ? (
                  <img
                    src={getPhotoUrl(user.photo)}
                    alt="Avatar"
                    className="w-full h-full object-cover object-[50%_10%]"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-dashNavy uppercase truncate">
                  {user?.full_name || user?.username}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {user?.pangkat ||
                  user?.OrgStructure?.rank ||
                  user?.OrgStructure?.position
                    ? [
                        user?.pangkat || user?.OrgStructure?.rank,
                        user?.OrgStructure?.position,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Pangkat & jabatan belum diisi"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-4 pt-3 border-t border-gray-100">
              Satlak Dukungan Teknologi Siber
            </p>
          </div>

          {/* 2b. Card Rekap Absensi Ringkas */}
          <div className="w-full shrink-0 bg-white border border-gray-200 rounded-lg shadow-dashCard p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Rekap Absensi -{" "}
              {new Date().toLocaleDateString("id-ID", { month: "long" })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Hadir",
                  value: absensiStats.hadir,
                  bg: "bg-green-50",
                  text: "text-green-600",
                },
                {
                  label: "Sakit",
                  value: absensiStats.sakit,
                  bg: "bg-amber-50",
                  text: "text-amber-600",
                },
                {
                  label: "Izin",
                  value: absensiStats.izin,
                  bg: "bg-dashAccent/10",
                  text: "text-dashAccent",
                },
                {
                  label: "Alpa",
                  value: absensiStats.tk,
                  bg: "bg-red-50",
                  text: "text-red-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} rounded-lg p-3 text-center`}
                >
                  <div
                    className={`text-xl font-bold leading-none tabular-nums ${s.text}`}
                  >
                    {s.value ?? 0}
                  </div>
                  <div className={`text-xs mt-1 ${s.text}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2c. Card Kategori Penugasan Lain */}
          <div className="w-full flex-1 bg-white border border-gray-200 rounded-lg shadow-dashCard p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
              Kategori Penugasan Lain
            </p>
            <div className="space-y-2">
              {[
                { label: "Dinas Dalam", key: "dd", icon: Building2 },
                { label: "Dinas Luar", key: "dl", icon: Plane },
                { label: "Pendidikan", key: "dik", icon: GraduationCap },
                { label: "Satgas", key: "satgas", icon: Users },
                { label: "Bawah Perintah", key: "bp", icon: CornerDownRight },
              ].map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-2 py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <s.icon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 truncate">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-dashNavy tabular-nums">
                    {absensiStats[s.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-gray-100">
              <button
                id="lihat-rincian-absensi"
                onClick={() => setShowRincianAbsensiModal(true)}
                className="w-full flex items-center justify-between gap-2 border border-dashNavy/20 text-dashNavy text-xs font-semibold rounded-lg py-2 px-3 hover:bg-dashNavy/5 transition"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Lihat Rincian Absensi
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── KONTEN UTAMA (KOLOM KANAN) ── */}
        <main className="mt-4 lg:mt-14 lg:pt-6 space-y-6 min-w-0 px-4 md:px-6 lg:ml-[380px] lg:px-6 lg:max-w-[1400px]">
          {/* 3. BAGIAN UTAMA: PROGRAM KERJA SAYA (JURNAL SAYA) */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Daftar Program Kerja
              </h2>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                - {prokers.length} total
              </span>
            </div>

            {prokerLoading ? (
              <p className="text-gray-400 py-10">Memuat program kerja...</p>
            ) : prokers.length === 0 ? (
              <div className="py-8">
                <p className="text-sm text-gray-500">
                  Belum ada program kerja.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleProkers.map((proker) => (
                    <div
                      key={proker.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-dashCard p-5 flex flex-col"
                    >
                      <div className="mb-4">
                        <h3 className="font-bold text-dashNavy text-sm mb-1">
                          {proker.program}
                        </h3>
                        <div className="w-full h-px bg-gray-50 my-3"></div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-sm text-gray-500">
                            {proker.keterangan}
                          </p>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1 mt-auto pt-2">
                          <div className="flex justify-between">
                            <span>Penanggung Jawab:</span>
                            <span className="text-gray-500 font-medium">
                              {proker.picSoldier?.full_name ||
                                proker.picSoldier?.username ||
                                proker.pic?.position ||
                                "Belum ditentukan"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mulai:</span>
                            <span className="text-gray-500">
                              {formatDate(proker.tanggal_mulai)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Deadline:</span>
                            <span className="text-gray-500">
                              {formatDate(proker.deadline)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tim:</span>
                            <span className="text-gray-500 font-medium">
                              {proker.tim?.length || 0} Orang
                            </span>
                          </div>
                          {proker.tim?.length > 0 && (
                            <div className="text-gray-400 pt-0.5">
                              {proker.tim
                                .map((t) => t.full_name || t.username)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dokumen: hanya PIC / anggota tim yang bisa aksi */}
                      {isPJatauTim(proker) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {proker.file_perencanaan ? (
                            <button
                              onClick={() =>
                                setPreviewDoc({
                                  title: `Instruksi: ${proker.program}`,
                                  fileName: proker.file_perencanaan,
                                  fileEndpoint: `/program-kerja/${proker.id}/download/perencanaan?mode=preview`,
                                  downloadEndpoint: `/api/program-kerja/${proker.id}/download/perencanaan`,
                                })
                              }
                              className="text-xs text-dashAccent font-semibold hover:underline flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Dokumen
                              Instruksi
                            </button>
                          ) : (
                            <p className="text-xs text-gray-400 italic">
                              Dokumen instruksi belum diunggah.
                            </p>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-600 font-semibold">
                                Dokumen Hasil:
                              </p>
                              {proker.file_hasil && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewDoc({
                                        title: `Hasil: ${proker.program}`,
                                        fileName: proker.file_hasil,
                                        fileEndpoint: `/program-kerja/${proker.id}/download/hasil?mode=preview`,
                                        downloadEndpoint: `/api/program-kerja/${proker.id}/download/hasil`,
                                      })
                                    }
                                    className="text-[11px] text-dashAccent font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" /> Lihat Hasil
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHapusHasilConfirmProker(proker)
                                    }
                                    className="text-[11px] text-red-500 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                            {proker.file_hasil && (
                              <p className="text-[11px] text-gray-400 truncate mb-1.5">
                                Terupload: {proker.file_hasil}
                              </p>
                            )}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                setHasilFiles((f) => ({
                                  ...f,
                                  [proker.id]: e.target.files[0] || null,
                                }))
                              }
                              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-dashNavy cursor-pointer"
                            />
                            <button
                              onClick={() => handleUploadHasil(proker)}
                              disabled={
                                uploadingHasilId === proker.id ||
                                !hasilFiles[proker.id]
                              }
                              className="mt-1.5 text-xs bg-dashAccent text-white rounded-md px-3 py-1.5 font-semibold hover:brightness-95 disabled:opacity-50 transition"
                            >
                              {uploadingHasilId === proker.id
                                ? "Mengunggah..."
                                : proker.file_hasil
                                  ? "Ganti File Hasil"
                                  : "Upload Dokumen Hasil"}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="w-full h-px bg-gray-50 my-4"></div>

                      <div className="flex justify-between items-center mt-auto">
                        <StatusBadge status={proker.status} />
                        {isPJatauTim(proker) && (
                          <button
                            onClick={() => handleToggleSelesai(proker)}
                            className="text-xs text-dashAccent font-semibold hover:underline flex items-center gap-1"
                          >
                            {proker.is_selesai ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                                Selesai
                              </>
                            ) : (
                              "Tandai Selesai"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalProkerPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">
                      Menampilkan {prokerPageStart}–{prokerPageEnd} dari{" "}
                      {prokers.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setProkerPage((p) => Math.max(1, p - 1))}
                        disabled={prokerPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from(
                        { length: totalProkerPages },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <button
                          key={p}
                          onClick={() => setProkerPage(p)}
                          className={`w-7 h-7 text-xs font-semibold rounded-lg transition ${
                            p === prokerPage
                              ? "bg-dashNavy text-white"
                              : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setProkerPage((p) =>
                            Math.min(totalProkerPages, p + 1),
                          )
                        }
                        disabled={prokerPage === totalProkerPages}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── 4. KALENDER PIKET SAYA & RIWAYAT TUKAR ── */}
          <div className="space-y-6">
            <div>
              <div className="mb-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Kalender Piket Saya
                </h2>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard p-5">
                <MiniCalendar
                  isSoldier={true}
                  currentUser={user}
                  onUpdateClick={(schedule) => setPiketModalSchedule(schedule)}
                  refreshTrigger={piketRefreshTrigger}
                />
              </div>
            </div>

            {/* Aktivitas Tukar Jadwal Piket (hanya anggota aktif eligible piket) */}
            {piketEligible && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-dashAccent" />
                      Aktivitas Tukar Jadwal Piket
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {swapTab === "outgoing"
                        ? "Daftar jadwal piket yang Anda ajukan untuk bertukar dengan rekan lain."
                        : "Daftar pertukaran jadwal yang diajukan oleh rekan lain ke jadwal piket Anda."}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSwapTab("outgoing")}
                      className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                        swapTab === "outgoing"
                          ? "bg-white text-dashNavy shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5 text-dashAccent" />
                      Pengajuan Saya
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          swapTab === "outgoing"
                            ? "bg-dashAccent/10 text-dashAccent"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {outgoingSwaps.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwapTab("incoming")}
                      className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                        swapTab === "incoming"
                          ? "bg-white text-dashNavy shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Inbox className="w-3.5 h-3.5 text-dashAccent" />
                      Ditukar oleh Rekan
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          swapTab === "incoming"
                            ? "bg-dashAccent/10 text-dashAccent"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {incomingSwaps.length}
                      </span>
                    </button>
                  </div>
                </div>

                {swapHistoryLoading ? (
                  <p className="text-gray-400 py-4 text-xs">
                    Memuat riwayat tukar...
                  </p>
                ) : (swapTab === "outgoing" ? outgoingSwaps : incomingSwaps).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400">
                      {swapTab === "outgoing"
                        ? "Belum ada pengajuan tukar jadwal yang Anda buat."
                        : "Belum ada rekan yang mengajukan tukar ke jadwal piket Anda."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-500">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase border-b border-gray-100">
                          {swapTab === "outgoing" ? (
                            <>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Tgl Piket Saya (Semula)
                              </th>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Ditukar Dengan
                              </th>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Tgl Piket Rekan
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Pemohon (Rekan yang Mengajukan)
                              </th>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Tgl Piket Pemohon
                              </th>
                              <th className="text-left px-3 py-2.5 font-semibold">
                                Tgl Piket Saya (Semula)
                              </th>
                            </>
                          )}
                          <th className="text-left px-3 py-2.5 font-semibold">
                            Alasan
                          </th>
                          <th className="text-center px-3 py-2.5 font-semibold">
                            Status Persetujuan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(swapTab === "outgoing" ? outgoingSwaps : incomingSwaps).map((item) => {
                          const requesterPerson = item.requester;
                          const partnerPerson = item.partner;
                          const requesterDate = item.requester_date;
                          const partnerDate = item.partner_date;

                          const statusBadge = {
                            pending: {
                              text: "Menunggu Persetujuan Admin",
                              class:
                                "bg-amber-50 text-amber-700 border-amber-200",
                            },
                            approved: {
                              text: "Disetujui Admin",
                              class:
                                "bg-green-50 text-green-700 border-green-200",
                            },
                            rejected: {
                              text: "Ditolak Admin",
                              class: "bg-red-50 text-red-700 border-red-200",
                            },
                            none: {
                              text: "-",
                              class: "bg-gray-50 text-gray-500 border-gray-200",
                            },
                          }[item.swap_approval_status] || {
                            text: item.swap_approval_status,
                            class: "bg-gray-50 text-gray-500 border-gray-200",
                          };

                          const renderPersonCell = (person) => (
                            <div>
                              <span className="font-medium text-gray-700">
                                {person?.full_name || person?.username || "-"}
                              </span>
                              {(person?.OrgStructure?.position ||
                                person?.pangkat ||
                                person?.OrgStructure?.rank) && (
                                <p className="text-[10px] text-gray-400">
                                  {person?.OrgStructure?.position || ""}{" "}
                                  {person?.pangkat || person?.OrgStructure?.rank
                                    ? `(${person?.pangkat || person?.OrgStructure?.rank})`
                                    : ""}
                                </p>
                              )}
                            </div>
                          );

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50/60 transition"
                            >
                              {swapTab === "outgoing" ? (
                                <>
                                  <td className="px-3 py-3 font-semibold text-dashNavy">
                                    {formatDate(requesterDate)}
                                  </td>
                                  <td className="px-3 py-3">
                                    {renderPersonCell(partnerPerson)}
                                  </td>
                                  <td className="px-3 py-3 text-gray-700 font-medium">
                                    {formatDate(partnerDate)}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-3">
                                    {renderPersonCell(requesterPerson)}
                                  </td>
                                  <td className="px-3 py-3 text-gray-700 font-medium">
                                    {formatDate(requesterDate)}
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-dashNavy">
                                    {formatDate(partnerDate)}
                                  </td>
                                </>
                              )}
                              <td
                                className="px-3 py-3 text-gray-600 max-w-[200px] truncate"
                                title={item.swap_reason}
                              >
                                {item.swap_reason || "-"}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge.class}`}
                                >
                                  {statusBadge.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 5. REKAP ABSENSI — DETAIL ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> Rekap Absensi - Detail
              </h2>
              <span className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full">
                {new Date().toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Table */}
            {absensiLoading ? (
              <p className="text-gray-400 py-4 text-sm">Memuat absensi...</p>
            ) : absensiList.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada data absensi.</p>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
                <table className="w-full text-sm text-gray-500">
                  <thead>
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
                    {absensiList.map((a) => {
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
                                  id={`sanggahan-btn-${a.id}`}
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
                                      id="sanggahan-status-usulan"
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
                                      id="sanggahan-keterangan"
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
                                    id="sanggahan-submit"
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
              </div>
            )}
          </div>

          {/* ── 6. LAPORAN AKTIVITAS HARIAN ── */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Laporan Aktivitas Harian
              </h2>
              {!todayLaporanId && !showLaporanForm && (
                <button
                  id="buat-laporan-hari-ini"
                  onClick={() => setShowLaporanForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Buat Laporan Hari Ini
                </button>
              )}
            </div>

            {/* Form buat laporan baru (hari ini) */}
            {showLaporanForm && !todayLaporanId && (
              <div className="bg-white border border-dashAccent/30 rounded-lg shadow-dashCard p-5 mb-5">
                <p className="text-sm font-semibold text-dashNavy mb-3">
                  Laporan Hari Ini
                </p>
                <div className="space-y-3">
                  {laporanSesiRows.map((row, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-lg p-3 space-y-2"
                    >
                      <p className="text-xs font-semibold text-gray-400">
                        Sesi {i + 1}
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Aktivitas
                        </label>
                        <textarea
                          id={`sesi-aktivitas-${i}`}
                          value={row.aktivitas}
                          onChange={(e) =>
                            setLaporanSesiRows((prev) =>
                              prev.map((r, idx) =>
                                idx === i
                                  ? { ...r, aktivitas: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          rows={2}
                          placeholder="Uraikan aktivitas yang dilakukan..."
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Output / Hasil
                        </label>
                        <textarea
                          id={`sesi-output-${i}`}
                          value={row.output_hasil}
                          onChange={(e) =>
                            setLaporanSesiRows((prev) =>
                              prev.map((r, idx) =>
                                idx === i
                                  ? { ...r, output_hasil: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          rows={2}
                          placeholder="Hasil yang dicapai..."
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                        />
                      </div>
                      {laporanSesiRows.length > 1 && (
                        <button
                          onClick={() =>
                            setLaporanSesiRows((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-xs text-red-600 hover:text-red-700 transition"
                        >
                          Hapus sesi ini
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    id="tambah-sesi-baru"
                    onClick={() =>
                      setLaporanSesiRows((prev) => [
                        ...prev,
                        { aktivitas: "", output_hasil: "" },
                      ])
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-dashAccent hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Tambah Sesi
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => {
                        setShowLaporanForm(false);
                        setLaporanSesiRows([
                          { aktivitas: "", output_hasil: "" },
                        ]);
                      }}
                      className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      id="simpan-laporan"
                      onClick={submitLaporan}
                      disabled={laporanSubmitting}
                      className="px-4 py-2 text-xs font-semibold bg-dashNavy text-white rounded-lg hover:bg-dashNavy/90 disabled:opacity-60 transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {laporanSubmitting ? "Menyimpan..." : "Simpan Laporan"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Daftar laporan */}
            {laporanLoading ? (
              <p className="text-gray-400 py-4 text-sm">Memuat laporan...</p>
            ) : laporanList.length === 0 ? (
              <p className="text-sm text-gray-400">
                Belum ada laporan aktivitas.
              </p>
            ) : (
              <div className="space-y-3">
                {laporanList.map((l) => {
                  const isToday = l.tanggal === toLocalToday();
                  const isExpanded = laporanExpandedId === l.id;
                  return (
                    <div
                      key={l.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden"
                    >
                      <button
                        id={`expand-laporan-${l.id}`}
                        onClick={() =>
                          setLaporanExpandedId(isExpanded ? null : l.id)
                        }
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 text-left transition"
                      >
                        <span className="text-sm font-semibold text-dashNavy">
                          {formatDate(l.tanggal)}{" "}
                          {isToday && (
                            <span className="ml-2 text-xs text-dashAccent font-normal">
                              (Hari Ini)
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{l.LaporanHarianSesis?.length ?? 0} sesi</span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                          {l.LaporanHarianSesis?.map((s) => (
                            <div key={s.id}>
                              {editSesi?.id === s.id ? (
                                <div className="border border-dashAccent/30 rounded-lg p-3 space-y-2">
                                  <textarea
                                    id={`edit-aktivitas-${s.id}`}
                                    value={editSesi.aktivitas}
                                    onChange={(e) =>
                                      setEditSesi((prev) => ({
                                        ...prev,
                                        aktivitas: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
                                  />
                                  <textarea
                                    id={`edit-output-${s.id}`}
                                    value={editSesi.output_hasil}
                                    onChange={(e) =>
                                      setEditSesi((prev) => ({
                                        ...prev,
                                        output_hasil: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditSesi(null)}
                                      className="text-xs text-gray-400 hover:text-gray-500"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      id={`save-edit-sesi-${s.id}`}
                                      onClick={submitEditSesi}
                                      disabled={editSesiLoading}
                                      className="text-xs font-semibold text-dashAccent hover:underline"
                                    >
                                      {editSesiLoading
                                        ? "Menyimpan..."
                                        : "Simpan"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-3 border-l-2 border-dashSky/40 pl-3">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-semibold">
                                      Sesi {s.urutan_sesi}
                                    </p>
                                    <p className="text-sm text-dashNavy font-medium mt-0.5">
                                      {s.aktivitas}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {s.output_hasil}
                                    </p>
                                  </div>
                                  {isToday && (
                                    <div className="flex gap-1.5 mt-1 shrink-0">
                                      <button
                                        id={`edit-sesi-${s.id}`}
                                        onClick={() =>
                                          setEditSesi({
                                            id: s.id,
                                            aktivitas: s.aktivitas,
                                            output_hasil: s.output_hasil,
                                          })
                                        }
                                        className="p-1 rounded hover:bg-dashAccent/10 text-dashAccent/70 hover:text-dashAccent transition"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        id={`delete-sesi-${s.id}`}
                                        onClick={() => setSesiToDelete(s.id)}
                                        className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-600 transition"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {/* Add sesi on today's laporan */}
                          {isToday && (
                            <AddSesiInline
                              laporanId={l.id}
                              onAdded={fetchLaporan}
                              showToast={showToast}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* PIKET UPDATE MODAL */}
      {piketModalSchedule && (
        <PiketUpdateModal
          schedule={piketModalSchedule}
          onClose={() => setPiketModalSchedule(null)}
          onSuccess={() => setPiketRefreshTrigger((prev) => prev + 1)}
          showToast={showToast}
        />
      )}

      {/* KONFIRMASI HAPUS SESI */}
      <ConfirmModal
        open={sesiToDelete !== null}
        title="Sesi yang dihapus tidak dapat dikembalikan. Lanjutkan?"
        loading={deleteSesiLoading}
        onCancel={() => setSesiToDelete(null)}
        onConfirm={() => deleteSesi(sesiToDelete)}
      />

      {/* --- MODAL POP-UP GANTI FOTO PROFIL --- */}
      {activeModal === "photo" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-modal-title"
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-dashCard"
          >
            <h3
              id="photo-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Ganti Foto Profil
            </h3>
            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
                  {selectedPhoto ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.photo ? (
                    <img
                      src={getPhotoUrl(user.photo)}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedPhoto(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-dashAccent/10 file:text-dashAccent hover:file:bg-dashAccent/20 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPhoto || !selectedPhoto}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashAccent text-white hover:brightness-95 disabled:opacity-50"
                >
                  {loadingPhoto ? "Mengupload..." : "Simpan Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP EDIT PROFIL --- */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-dashCard"
          >
            <h3
              id="profile-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Edit Profil
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>

              {messageEdit.text && (
                <div
                  className={`p-3 rounded-lg text-xs ${messageEdit.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {messageEdit.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50"
                >
                  {loadingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP GANTI PASSWORD --- */}
      {activeModal === "password" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-dashCard"
          >
            <h3
              id="password-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Ganti Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>

              {messagePass.text && (
                <div
                  className={`p-3 rounded-lg text-xs ${messagePass.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {messagePass.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPass}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50"
                >
                  {loadingPass ? "Menyimpan..." : "Perbarui Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RINCIAN ABSENSI BULANAN --- */}
      {showRincianAbsensiModal && (
        <RincianAbsensiModal
          onClose={() => setShowRincianAbsensiModal(false)}
          showToast={showToast}
          onSanggahanSubmitted={fetchAbsensi}
        />
      )}

      {/* --- MODAL KONFIRMASI HAPUS DOKUMEN HASIL --- */}
      <ConfirmModal
        open={!!hapusHasilConfirmProker}
        headerTitle="Hapus Dokumen Hasil"
        title={`Yakin ingin menghapus dokumen hasil untuk program kerja "${hapusHasilConfirmProker?.program}"? File tidak dapat dikembalikan.`}
        confirmText="Hapus Dokumen"
        loading={!!deletingHasilId}
        onCancel={() => setHapusHasilConfirmProker(null)}
        onConfirm={handleDeleteHasil}
      />

      {/* --- MODAL PREVIEW DOKUMEN (PDF / DOCX) --- */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title}
        fileName={previewDoc?.fileName}
        fileEndpoint={previewDoc?.fileEndpoint}
        downloadEndpoint={previewDoc?.downloadEndpoint}
      />
    </div>
  );
}
