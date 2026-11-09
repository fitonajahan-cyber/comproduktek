import { useEffect, useState } from "react";
import TeamPickerField from "./TeamPickerField";

/**
 * Form modal khusus halaman Program Kerja (TIDAK memakai FormModal generic).
 * Ada 2 kebutuhan yang tidak didukung FormModal generik:
 * 1. TeamPickerField (searchable checkbox list anggota tim)
 * 2. Input file dokumen dengan accept=".pdf,.doc,.docx"
 *
 * Submit mengirim (values, timIds, file) ke onSubmit milik parent.
 */
export default function ProgramKerjaFormModal({
  open,
  title,
  soldiers = [],
  orgStructures = [],
  initialValues,
  submitting,
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState({});
  const [timIds, setTimIds] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setTimIds((initialValues?.tim || []).map((t) => t.id));
      setFile(null);
      setFileName("");
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (name, value) =>
    setValues((v) => ({ ...v, [name]: value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setFileName(f ? f.name : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, timIds, file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center px-4 py-6 overflow-y-auto font-dash">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proker-form-modal-title"
        className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-3xl max-h-[90vh] p-5 overflow-y-auto"
      >
        <h3
          id="proker-form-modal-title"
          className="text-lg font-semibold text-dashNavy mb-5"
        >
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label
                htmlFor="field-program"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Nama Program / Tugas
              </label>
              <input
                id="field-program"
                type="text"
                value={values.program || ""}
                onChange={(e) => handleChange("program", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="field-pic_soldier_id"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Penanggung Jawab (PIC)
              </label>
              <select
                id="field-pic_soldier_id"
                value={values.pic_soldier_id || ""}
                onChange={(e) =>
                  handleChange("pic_soldier_id", e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
              >
                <option value="">Pilih...</option>
                {soldiers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.username} — {s.pangkat || "Pangkat belum diisi"}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="field-keterangan"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Keterangan
              </label>
              <textarea
                id="field-keterangan"
                rows={3}
                value={values.keterangan || ""}
                onChange={(e) => handleChange("keterangan", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="field-tanggal_mulai"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Tanggal Mulai
              </label>
              <input
                id="field-tanggal_mulai"
                type="date"
                value={values.tanggal_mulai || ""}
                onChange={(e) => handleChange("tanggal_mulai", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="field-deadline"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Deadline Target
              </label>
              <input
                id="field-deadline"
                type="date"
                value={values.deadline || ""}
                onChange={(e) => handleChange("deadline", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="field-tanggal_selesai"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Tanggal Selesai Aktual (Opsional)
              </label>
              <input
                id="field-tanggal_selesai"
                type="date"
                value={values.tanggal_selesai || ""}
                onChange={(e) =>
                  handleChange("tanggal_selesai", e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
              />
            </div>

            <div className="flex items-end">
              <label
                htmlFor="field-is_selesai"
                className="flex items-center gap-2 cursor-pointer mt-1"
              >
                <input
                  id="field-is_selesai"
                  type="checkbox"
                  checked={!!values.is_selesai}
                  onChange={(e) =>
                    handleChange("is_selesai", e.target.checked)
                  }
                  className="w-4 h-4 text-dashAccent border-gray-300 rounded focus:ring-dashAccent/40 focus:ring-2"
                />
                <span className="text-sm font-medium text-dashNavy">
                  Konfirmasi Telah Selesai
                </span>
              </label>
            </div>

            {values.is_selesai === false &&
              values.deadline &&
              (() => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const deadlineDate = new Date(values.deadline);
                deadlineDate.setHours(0, 0, 0, 0);
                if (now <= deadlineDate) return null;
                return (
                  <div className="md:col-span-2">
                    <label
                      htmlFor="field-alasan_keterlambatan"
                      className="text-sm font-medium text-dashNavy block mb-1"
                    >
                      Alasan Keterlambatan (Wajib jika Terlambat)
                    </label>
                    <textarea
                      id="field-alasan_keterlambatan"
                      rows={3}
                      value={values.alasan_keterlambatan || ""}
                      onChange={(e) =>
                        handleChange("alasan_keterlambatan", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    />
                  </div>
                );
              })()}

            {/* Picker anggota tim (many-to-many) */}
            <TeamPickerField
              soldiers={soldiers}
              selectedIds={timIds}
              onChange={setTimIds}
            />

            {/* Upload dokumen perencanaan (opsional) */}
            <div className="md:col-span-2">
              <label
                htmlFor="field-file_perencanaan"
                className="text-sm font-medium text-dashNavy block mb-1"
              >
                Dokumen Perencanaan (Opsional)
              </label>
              {editingFilePerencanaan(values) && (
                <p className="text-xs text-gray-500 mb-1">
                  Saat ini:{" "}
                  <span className="font-medium">
                    {editingFilePerencanaan(values)}
                  </span>{" "}
                  — unggah file baru untuk mengganti.
                </p>
              )}
              <input
                id="field-file_perencanaan"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-dashNavy hover:file:bg-gray-200 cursor-pointer"
              />
              {fileName && (
                <p className="text-xs text-gray-500 mt-1">
                  File dipilih: {fileName}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-dashAccent text-white rounded-md px-4 py-2 text-sm font-semibold hover:brightness-95 disabled:opacity-60 transition"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function editingFilePerencanaan(values) {
  return values.file_perencanaan || "";
}
