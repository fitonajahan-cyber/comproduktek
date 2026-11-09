import { useState, useEffect, useMemo } from "react";
import CrudManager from "../../components/admin/CrudManager";
import api from "../../services/api";

const columns = [
  { key: "name", label: "Nama Produk" },
  { key: "category", label: "Kategori" },
  { key: "unit_pengampu", label: "Unit Pengampu" },
  { key: "status", label: "Status" },
];

const fields = [
  { name: "name", label: "Nama Produk", type: "text", required: true },
  { name: "category", label: "Kategori", type: "text", required: true },
  {
    name: "unit_pengampu",
    label: "Unit Pengampu",
    type: "text",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Aktif", "Dalam Pengembangan", "Nonaktif"],
    required: true,
  },
  { name: "description", label: "Deskripsi", type: "textarea" },
  { name: "image", label: "Gambar Produk", type: "file" },
];

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "nama_asc", label: "Nama Produk (A - Z)", sortKey: "name" },
  { value: "nama_desc", label: "Nama Produk (Z - A)", sortKey: "name" },
  { value: "kategori_asc", label: "Kategori (A - Z)", sortKey: "category" },
  { value: "kategori_desc", label: "Kategori (Z - A)", sortKey: "category" },
  { value: "status_asc", label: "Status (A - Z)", sortKey: "status" },
  { value: "status_desc", label: "Status (Z - A)", sortKey: "status" },
];

const countByUnit = (items) => {
  const counts = {};
  items.forEach((item) => {
    counts[item.unit_pengampu] = (counts[item.unit_pengampu] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0] : null;
};

export default function ProductManage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { limit: 1000 } });
      setAllProducts(res.data.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  const metrics = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return null;

    const aktif = allProducts.filter((p) => p.status === "Aktif").length;
    const nonaktif = allProducts.filter((p) => p.status === "Nonaktif").length;
    const topUnit = countByUnit(allProducts);

    return {
      total: allProducts.length,
      aktif,
      nonaktif,
      topUnit: topUnit ? `${topUnit[0]} (${topUnit[1]})` : "-",
    };
  }, [allProducts]);

  const infoCards = [
    { label: "Total Produk", value: metrics?.total || 0, loading },
    { label: "Produk Aktif", value: metrics?.aktif || 0, loading },
    { label: "Produk Nonaktif", value: metrics?.nonaktif || 0, loading },
    {
      label: "Unit Terbanyak",
      value: metrics?.topUnit || "-",
      loading,
      subtitle: "Unit + Jumlah",
    },
  ];

  const handleCrudComplete = () => {
    loadAllProducts();
  };

  return (
    <CrudManager
      title="Produk"
      subtitle="Kelola produk dan unit pengampunya."
      endpoint="/products"
      columns={columns}
      fields={fields}
      sortOptions={sortOptions}
      infoCards={infoCards}
      onDataChange={handleCrudComplete}
    />
  );
}
