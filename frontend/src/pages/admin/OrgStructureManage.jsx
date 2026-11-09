import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import api from "../../services/api";
import FormModal from "../../components/admin/FormModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import Toast from "../../components/admin/Toast";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import { buildTree } from "../../components/public/orgTreeUtils";

import { HIDDEN_NODES, isHiddenNode } from "../../constants/appConstants";
import { useToast } from "../../hooks/useToast";
import OrgNodeCard from "../../components/admin/OrgNodeCard";

const ORG_FIELDS = [
  { name: "photo", label: "Foto Profil", type: "file", colSpan: 2 },
  {
    name: "name",
    label: "Nama Lengkap",
    type: "text",
    required: true,
    colSpan: 1,
  },
  { name: "rank", label: "Pangkat", type: "text", colSpan: 1 },
  {
    name: "disc_kode",
    label: "Kode Karakter DISC (mis. DC)",
    type: "text",
    colSpan: 1,
  },
  {
    name: "disc_label",
    label: "Label Karakter (pisahkan koma sesuai urutan huruf)",
    type: "text",
    colSpan: 1,
  },
  {
    name: "kekuatan_utama",
    label: "Kekuatan Utama",
    type: "textarea",
    colSpan: 1,
  },
  {
    name: "rekomendasi_pengembangan",
    label: "Rekomendasi Pengembangan Diri",
    type: "textarea",
    colSpan: 1,
  },
  {
    name: "cara_komunikasi",
    label: "Cara Berkomunikasi",
    type: "textarea",
    colSpan: 2,
  },
];

// Komponen Rekursif untuk Tampilan Hierarki (Standar)
const AdminOrgNode = ({ node, onEdit, onEmpty }) => {
  const sortedChildren = node.children
    ? [...node.children].sort((a, b) => {
        if (a.position === "_TRUNK_" && b.position !== "_TRUNK_") return 1;
        if (a.position !== "_TRUNK_" && b.position === "_TRUNK_") return -1;
        return 0;
      })
    : [];

  if (isHiddenNode(node.position)) {
    return (
      <>
        {sortedChildren.map((child) => (
          <AdminOrgNode
            key={child.id}
            node={child}
            onEdit={onEdit}
            onEmpty={onEmpty}
          />
        ))}
      </>
    );
  }

  return (
    <OrgNodeCard
      node={node}
      onEdit={onEdit}
      onEmpty={onEmpty}
      childrenNodes={
        sortedChildren.length > 0
          ? sortedChildren.map((child) => (
              <AdminOrgNode
                key={child.id}
                node={child}
                onEdit={onEdit}
                onEmpty={onEmpty}
              />
            ))
          : null
      }
    />
  );
};

export default function OrgStructureManage() {
  const [rawItems, setRawItems] = useState([]);
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk Fitur Searching & Sorting
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("hierarki");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State untuk Empty Modal
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
  const [itemToEmpty, setItemToEmpty] = useState(null);
  const [emptying, setEmptying] = useState(false);

  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get("/org-structures", { params: { limit: 200 } })
      .then((r) => {
        setRawItems(r.data.data);
        setRoots(buildTree(r.data.data));
      })
      .catch(() => showToast("Gagal memuat data struktur organisasi.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (values, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      const allowedKeys = [
        "name",
        "rank",
        "position",
        "box_color",
        "display_order",
        "disc_kode",
        "disc_label",
        "kekuatan_utama",
        "rekomendasi_pengembangan",
        "cara_komunikasi",
      ];

      allowedKeys.forEach((key) => {
        if (values[key] !== null && values[key] !== undefined) {
          fd.append(key, values[key]);
        }
      });

      if (
        values.parent_id !== null &&
        values.parent_id !== undefined &&
        values.parent_id !== ""
      ) {
        fd.append("parent_id", values.parent_id);
      }

      if (files.photo) {
        fd.append("photo", files.photo);
      }

      await api.put(`/org-structures/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Data personel berhasil diperbarui.");

      setFormOpen(false);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menyimpan data.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEmptyConfirm = (node) => {
    setItemToEmpty(node);
    setEmptyConfirmOpen(true);
  };

  const executeEmpty = async () => {
    if (!itemToEmpty) return;
    setEmptying(true);
    try {
      await api.put(`/org-structures/${itemToEmpty.id}/empty`);
      showToast(`Data personel ${itemToEmpty.position} berhasil dikosongkan.`);
      setEmptyConfirmOpen(false);
      setItemToEmpty(null);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal mengosongkan data.",
        "error",
      );
    } finally {
      setEmptying(false);
    }
  };

  const isSearchingOrSorting = q.trim() !== "" || sortBy !== "hierarki";

  const filteredAndSortedItems = useMemo(() => {
    if (!isSearchingOrSorting) return [];

    let result = rawItems.filter((item) => !isHiddenNode(item.position));

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(lowerQ) ||
          (item.position || "").toLowerCase().includes(lowerQ) ||
          (item.rank || "").toLowerCase().includes(lowerQ),
      );
    }

    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const posA = (a.position || "").toLowerCase();
      const posB = (b.position || "").toLowerCase();

      switch (sortBy) {
        case "nama_asc":
          return nameA.localeCompare(nameB);
        case "nama_desc":
          return nameB.localeCompare(nameA);
        case "jabatan_asc":
          return posA.localeCompare(posB);
        case "jabatan_desc":
          return posB.localeCompare(posA);
        default:
          return 0;
      }
    });

    return result;
  }, [rawItems, q, sortBy]);

  const metrics = useMemo(() => {
    const visibleItems = rawItems.filter(
      (item) => !isHiddenNode(item.position),
    );
    const filled = visibleItems.filter(
      (item) => item.name && item.name.trim(),
    ).length;
    const empty = visibleItems.length - filled;
    const withPhoto = visibleItems.filter((item) => item.photo).length;

    return {
      total: visibleItems.length,
      filled,
      empty,
      withPhoto,
    };
  }, [rawItems]);

  const infoCards = [
    { label: "Total Jabatan", value: metrics.total, loading },
    { label: "Terisi", value: metrics.filled, loading },
    { label: "Kosong", value: metrics.empty, loading },
    { label: "Dengan Foto", value: metrics.withPhoto, loading },
  ];

  return (
    <div className="font-dash">
      <PageHeader
        title="Kelola Personel Struktur Organisasi"
        subtitle="Isi nama dan pangkat untuk setiap jabatan yang telah ditetapkan dalam struktur resmi."
      />

      <div className="mb-5">
        <InfoCardGrid cards={infoCards} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, pangkat, atau jabatan..."
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
            <option value="hierarki">Urutan Bagan / Hierarki</option>
            <option value="nama_asc">Nama (A - Z)</option>
            <option value="nama_desc">Nama (Z - A)</option>
            <option value="jabatan_asc">Jabatan (A - Z)</option>
            <option value="jabatan_desc">Jabatan (Z - A)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 shadow-dashCard border border-gray-200">
        {loading && (
          <p className="text-center text-dashNavy/40 py-10">
            Memuat hierarki...
          </p>
        )}
        {!loading && rawItems.length === 0 && (
          <p className="text-center text-dashNavy/40 py-10">
            Struktur belum diinisialisasi di database.
          </p>
        )}

        {!loading &&
          rawItems.length > 0 &&
          !isSearchingOrSorting &&
          roots.map((rootNode) => (
            <AdminOrgNode
              key={rootNode.id}
              node={rootNode}
              onEdit={openEdit}
              onEmpty={openEmptyConfirm}
            />
          ))}

        {!loading &&
          isSearchingOrSorting &&
          filteredAndSortedItems.length === 0 && (
            <p className="text-center text-dashNavy/40 py-10">
              Personel tidak ditemukan.
            </p>
          )}

        {!loading &&
          isSearchingOrSorting &&
          filteredAndSortedItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wide">
                Menampilkan {filteredAndSortedItems.length} hasil
              </p>
              {filteredAndSortedItems.map((item) => (
                <OrgNodeCard
                  key={item.id}
                  node={item}
                  onEdit={openEdit}
                  onEmpty={openEmptyConfirm}
                />
              ))}
            </div>
          )}
      </div>

      <FormModal
        open={formOpen}
        title={`Edit Personel: ${editing?.position || ""}`}
        fields={ORG_FIELDS}
        initialValues={editing || {}}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={emptyConfirmOpen}
        headerTitle="Kosongkan Jabatan"
        title={`Yakin ingin mengosongkan data personel untuk jabatan ${itemToEmpty?.position}? Tindakan ini juga akan mereset akun login prajurit tersebut ke password default.`}
        confirmText="Kosongkan"
        loading={emptying}
        onCancel={() => setEmptyConfirmOpen(false)}
        onConfirm={executeEmpty}
      />

      <Toast toast={toast} />
    </div>
  );
}
