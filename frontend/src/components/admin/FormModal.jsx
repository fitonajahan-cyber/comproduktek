import { useEffect, useState } from "react";

/**
 * fields: [{ name, label, type: 'text'|'textarea'|'select'|'date'|'file'|'number'|'checkbox', options?: [], colSpan?: 1 | 2, showIf?: (values) => boolean }]
 * options untuk type 'select' menerima 2 bentuk:
 *  - array string, mis. ['Aktif', 'Nonaktif']  -> value dan label sama
 *  - array objek,  mis. [{ value: 3, label: 'Budi - Kabagops' }] -> value (mis. ID)
 *    berbeda dari label yang ditampilkan. Dipakai untuk dropdown "Atasan Langsung".
 */
export default function FormModal({
  open,
  title,
  fields,
  initialValues,
  onCancel,
  onSubmit,
  submitting,
}) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setFiles({});
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (name, value) =>
    setValues((v) => ({ ...v, [name]: value }));
  const handleFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, files);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto font-dash">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="form-modal-title"
        className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-3xl p-6"
      >
        <h3 id="form-modal-title" className="text-lg font-semibold text-dashNavy mb-5">
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => {
              if (f.showIf && !f.showIf(values)) return null;
              
              return (
              <div
                key={f.name}
                className={f.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"}
              >
                {f.type !== "checkbox" && (
                  <label htmlFor={`field-${f.name}`} className="text-sm font-medium text-dashNavy block mb-1">
                    {f.label}
                  </label>
                )}
                {f.hint && f.type !== "checkbox" && (
                  <p className="text-xs text-gray-500 mb-1">{f.hint}</p>
                )}

                {f.type === "textarea" && (
                  <textarea
                    id={`field-${f.name}`}
                    rows={4}
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  />
                )}

                {f.type === "select" && (
                  <select
                    id={`field-${f.name}`}
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  >
                    <option value="">Pilih...</option>
                    {f.options.map((o) => {
                      const optValue = typeof o === "object" ? o.value : o;
                      const optLabel = typeof o === "object" ? o.label : o;
                      return (
                        <option key={optValue} value={optValue}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                )}

                {f.type === "file" && (
                  <input
                    id={`field-${f.name}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(f.name, e.target.files[0])}
                    className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-dashNavy hover:file:bg-gray-200 cursor-pointer"
                  />
                )}

                {["text", "date", "number", "password"].includes(f.type) && (
                  <input
                    id={`field-${f.name}`}
                    type={f.type}
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  />
                )}

                {f.type === "checkbox" && (
                  <label htmlFor={`field-${f.name}`} className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      id={`field-${f.name}`}
                      type="checkbox"
                      checked={!!values[f.name]}
                      onChange={(e) => handleChange(f.name, e.target.checked)}
                      className="w-4 h-4 text-dashAccent border-gray-300 rounded focus:ring-dashAccent/40 focus:ring-2"
                      required={f.required}
                    />
                    <span className="text-sm font-medium text-dashNavy">
                      {f.label}
                    </span>
                  </label>
                )}
              </div>
            )})}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
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
