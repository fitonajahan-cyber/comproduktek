import { useEffect, useState, useMemo } from "react";
import {
  Newspaper,
  Package,
  Images,
  Mail,
  CalendarDays,
  Users,
} from "lucide-react";
import api from "../../services/api";
import MiniCalendar from "../../components/common/MiniCalendar";
import DonutChart from "../../components/admin/DonutChart";
import { isHiddenNode } from "../../constants/appConstants";

const widgets = [
  { key: "totalNews", label: "Total Berita", icon: Newspaper, tint: "navy" },
  {
    key: "totalProducts",
    label: "Total Produk",
    icon: Package,
    tint: "accent",
  },
  {
    key: "totalGalleries",
    label: "Total Foto Galeri",
    icon: Images,
    tint: "sky",
  },
  {
    key: "unreadMessages",
    label: "Pesan Belum Dibaca",
    icon: Mail,
    tint: "mint",
    accent: true,
  },
];

const TINT_CLASSES = {
  navy: { chip: "bg-dashNavy/5", icon: "text-dashNavy" },
  accent: { chip: "bg-dashAccent/10", icon: "text-dashAccent" },
  sky: { chip: "bg-dashSky/25", icon: "text-dashNavy" },
  mint: { chip: "bg-dashMint/60", icon: "text-dashNavy" },
};

const CHART_COLORS = {
  dashNavy: "#293681",
  dashAccent: "#4274D9",
  dashSky: "#95CCDD",
};

const MEMBER_CATEGORIES = [
  { key: "merah", label: "Pucuk Pimpinan", color: CHART_COLORS.dashNavy },
  { key: "oranye", label: "Pemimpin Unit", color: CHART_COLORS.dashAccent },
  { key: "teal", label: "Staf", color: CHART_COLORS.dashSky },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [members, setMembers] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((r) => setData(r.data.data))
      .catch(() => {});

    // Endpoint publik dipakai ulang untuk menghitung
    api
      .get("/org-structures", { params: { limit: 1000 } })
      .then((r) => {
        // Abaikan node spacer agar tidak dihitung dalam distribusi
        const actualMembers = (r.data.data || []).filter(
          (m) => !isHiddenNode(m.position),
        );

        setMembers(actualMembers);
      })
      .catch(() => setMembers([]));
  }, []);

  const segments = useMemo(
    () =>
      members
        ? MEMBER_CATEGORIES.map((c) => ({
            label: c.label,
            color: c.color,
            value: members.filter((m) => m.box_color === c.key).length,
          })).filter((s) => s.value > 0)
        : [],
    [members],
  );

  const totalMembers = members ? members.length : 0;

  return (
    <div className="font-dash">
      <h1 className="text-xl font-semibold text-dashNavy mb-6">
        Ringkasan Dashboard
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {widgets.map((w) => {
          const Icon = w.icon;
          const isAlert = w.accent && data?.[w.key] > 0;
          const t = TINT_CLASSES[w.tint];
          return (
            <div
              key={w.key}
              className={`bg-white rounded-lg border p-5 shadow-dashCard transition ${
                isAlert ? "border-dashAccent" : "border-gray-200"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${t.chip}`}
              >
                <Icon className={`w-[18px] h-[18px] ${t.icon}`} />
              </div>
              <p className="text-3xl font-semibold text-dashNavy">
                {data ? data[w.key] : "—"}
              </p>
              <p className="text-sm text-dashNavy/60 mt-1">{w.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-lg border border-gray-200 shadow-dashCard p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-dashMint/60 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-dashNavy" />
            </div>
            <h2 className="text-sm font-semibold text-dashNavy">Kalender</h2>
          </div>
          <MiniCalendar />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-dashCard p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-dashAccent/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-dashAccent" />
            </div>
            <h2 className="text-sm font-semibold text-dashNavy">
              Distribusi Anggota
            </h2>
          </div>
          <DonutChart segments={segments} total={totalMembers} />
        </div>
      </div>
    </div>
  );
}


