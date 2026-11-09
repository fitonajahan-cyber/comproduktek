import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

/**
 * Searchable checkbox list untuk memilih anggota tim program kerja.
 * - soldiers: array dari GET /soldiers (include Pangkat)
 * - selectedIds: array of soldier id
 * - onChange(ids): dipanggil setiap kali seleksi berubah
 */
export default function TeamPickerField({
  soldiers = [],
  selectedIds = [],
  onChange,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) return soldiers;
    return soldiers.filter((s) => {
      const name = (s.full_name || "").toLowerCase();
      const username = (s.username || "").toLowerCase();
      const pangkat = (s.pangkat || s.Pangkat?.nama || s.OrgStructure?.rank || "").toLowerCase();
      return (
        name.includes(lower) ||
        username.includes(lower) ||
        pangkat.includes(lower)
      );
    });
  }, [soldiers, search]);

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-dashNavy block mb-1">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-gray-500" /> Anggota Tim (Opsional)
        </span>
      </label>
      <p className="text-xs text-gray-500 mb-1.5">
        Centang soldier yang menjadi anggota tim proker ini.{" "}
        {selectedIds.length > 0 && (
          <span className="font-semibold text-dashAccent">
            {selectedIds.length} dipilih.
          </span>
        )}
      </p>

      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama soldier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
        />
      </div>

      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Soldier tidak ditemukan.
          </p>
        ) : (
          filtered.map((s) => (
            <label
              key={s.id}
              htmlFor={`tim-soldier-${s.id}`}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                id={`tim-soldier-${s.id}`}
                type="checkbox"
                checked={selectedIds.includes(s.id)}
                onChange={() => toggle(s.id)}
                className="w-4 h-4 text-dashAccent border-gray-300 rounded focus:ring-dashAccent/40 focus:ring-2"
              />
              <span className="text-sm text-gray-700">
                {s.full_name || s.username || `Soldier #${s.id}`}{" "}
                <span className="text-gray-400">
                  ({s.pangkat || s.Pangkat?.nama || s.OrgStructure?.rank || "Pangkat belum diisi"})
                </span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
