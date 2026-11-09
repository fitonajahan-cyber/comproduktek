import { useState, useEffect, useMemo } from "react";
import CrudManager from "../../components/admin/CrudManager";
import { formatDate } from "../../lib/dateUtils";
import api from "../../services/api";

const columns = [
  { key: "title", label: "Judul" },
  { key: "category", label: "Kategori" },
  {
    key: "news_date",
    label: "Tanggal",
    render: (item) => formatDate(item.news_date),
  },
  {
    key: "thumbnail",
    label: "Thumbnail",
    render: (item) =>
      item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-10 w-16 object-cover rounded"
        />
      ) : (
        "—"
      ),
  },
];

const fields = [
  { name: "title", label: "Judul Berita", type: "text", required: true },
  {
    name: "category",
    label: "Kategori Berita",
    type: "select",
    required: true,
    options: [
      { value: "Kegiatan Siber", label: "Kegiatan Siber" },
      { value: "Edukasi & Riset", label: "Edukasi & Riset" },
      { value: "Teknologi", label: "Teknologi" },
      { value: "Pengumuman", label: "Pengumuman" },
      { value: "Operasional", label: "Operasional" },
    ],
  },
  { name: "news_date", label: "Tanggal", type: "date", required: true },
  { name: "content", label: "Isi Berita", type: "textarea", required: true },
  { name: "thumbnail", label: "Thumbnail (gambar)", type: "file" },
];

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "judul_asc", label: "Judul (A - Z)", sortKey: "title" },
  { value: "judul_desc", label: "Judul (Z - A)", sortKey: "title" },
  { value: "tanggal_asc", label: "Tanggal Terlama", sortKey: "news_date" },
  { value: "tanggal_desc", label: "Tanggal Terbaru", sortKey: "news_date" },
  { value: "kategori_asc", label: "Kategori (A - Z)", sortKey: "category" },
  { value: "kategori_desc", label: "Kategori (Z - A)", sortKey: "category" },
];

const countByCategory = (items) => {
  const counts = {};
  items.forEach((item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0] : null;
};

export default function NewsManage() {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAllNews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news", { params: { limit: 1000 } });
      setAllNews(res.data.data || []);
    } catch (error) {
      console.error("Error loading all news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllNews();
  }, []);

  const metrics = useMemo(() => {
    if (!allNews || allNews.length === 0) return null;

    const thisMonth = allNews.filter((item) => {
      const newsDate = new Date(item.news_date);
      const current = new Date();
      return (
        newsDate.getMonth() === current.getMonth() &&
        newsDate.getFullYear() === current.getFullYear()
      );
    }).length;

    const latestNews = allNews.sort(
      (a, b) => new Date(b.news_date) - new Date(a.news_date),
    )[0];

    const topCategory = countByCategory(allNews);

    return {
      total: allNews.length,
      thisMonth,
      latestDate: latestNews ? formatDate(latestNews.news_date) : "-",
      topCategory: topCategory ? `${topCategory[0]} (${topCategory[1]})` : "-",
    };
  }, [allNews]);

  const infoCards = [
    { label: "Total Berita", value: metrics?.total || 0, loading },
    { label: "Bulan Ini", value: metrics?.thisMonth || 0, loading },
    {
      label: "Terbaru",
      value: metrics?.latestDate || "-",
      loading,
      subtitle: "Tanggal publikasi",
    },
    {
      label: "Kategori Terbanyak",
      value: metrics?.topCategory || "-",
      loading,
      subtitle: "Kategori + Jumlah",
    },
  ];

  const handleCrudComplete = () => {
    loadAllNews();
  };

  return (
    <CrudManager
      title="Berita"
      subtitle="Kelola berita dan pengumuman untuk halaman publik website."
      endpoint="/news"
      columns={columns}
      fields={fields}
      sortOptions={sortOptions}
      infoCards={infoCards}
      onDataChange={handleCrudComplete}
    />
  );
}
