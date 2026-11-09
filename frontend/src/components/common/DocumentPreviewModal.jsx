import { useEffect, useRef, useState } from "react";
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { renderAsync } from "docx-preview";
import api from "../../services/api";

/**
 * DocumentPreviewModal
 * Komponen modal untuk menampilkan preview dokumen (PDF, DOCX, Gambar) langsung di browser
 * tanpa mengunduh ke penyimpanan lokal (in-memory viewing).
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string (Judul modal / nama kegiatan)
 * - fileName: string (Nama file, e.g. "instruksi.pdf")
 * - fileEndpoint: string (Endpoint API untuk fetch blob file, misal `/program-kerja/1/download/perencanaan?mode=preview`)
 * - downloadEndpoint: string (Opsional endpoint download langsung)
 */
export default function DocumentPreviewModal({
  isOpen,
  onClose,
  title = "Preview Dokumen",
  fileName = "",
  fileEndpoint = "",
  downloadEndpoint = "",
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [fileType, setFileType] = useState(null); // 'pdf' | 'docx' | 'image' | 'unsupported'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileBlob, setFileBlob] = useState(null);

  const docxContainerRef = useRef(null);

  // Deteksi ekstensi file
  const getExtension = (name) => {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };

  useEffect(() => {
    if (!isOpen || !fileEndpoint) {
      // Reset state & bersihkan blob jika modal ditutup
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl(null);
      setFileBlob(null);
      setError(null);
      setLoading(true);
      setFileType(null);
      setIsFullscreen(false);
      return;
    }

    let isMounted = true;
    const ext = getExtension(fileName);

    const loadDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(fileEndpoint, {
          responseType: "blob",
        });

        if (!isMounted) return;

        const blob = response.data;
        setFileBlob(blob);

        if (ext === "pdf" || blob.type === "application/pdf") {
          setFileType("pdf");
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
        } else if (
          ext === "docx" ||
          blob.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          setFileType("docx");
          setLoading(false);
          // DOCX rendering ditangani oleh effect renderDocx setelah DOM container siap
        } else if (
          ["jpg", "jpeg", "png", "webp"].includes(ext) ||
          blob.type.startsWith("image/")
        ) {
          setFileType("image");
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
        } else {
          setFileType("unsupported");
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Gagal memuat dokumen:", err);
        setError(
          err.response?.data?.message ||
            "Gagal memuat pratinjau dokumen. Pastikan Anda memiliki akses dan file tersedia.",
        );
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, fileEndpoint, fileName]);

  // Effect khusus untuk render DOCX ke docxContainerRef
  useEffect(() => {
    if (fileType === "docx" && fileBlob && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = "";
      renderAsync(fileBlob, docxContainerRef.current, undefined, {
        className: "docx-preview-container",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
      }).catch((err) => {
        console.error("Gagal merender DOCX:", err);
        setError("Gagal merender dokumen Word (.docx). File mungkin terproteksi atau rusak.");
      });
    }
  }, [fileType, fileBlob]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle manual download fallback
  const handleDownload = () => {
    if (fileBlob) {
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "dokumen";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (downloadEndpoint) {
      window.open(downloadEndpoint, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-dashNavy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full rounded-none fixed inset-0 z-50"
            : "w-full max-w-5xl h-[90vh] max-h-[900px]"
        }`}
      >
        {/* Header Toolbar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-dashAccent/10 text-dashAccent flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-dashNavy truncate">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                  {fileName || "Dokumen"}
                </span>
                {fileType && (
                  <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                    {fileType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {fileBlob && (
              <button
                onClick={handleDownload}
                title="Unduh Salinan Dokumen"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 transition border border-gray-200 bg-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              className="p-1.5 rounded-lg text-gray-500 hover:text-dashNavy hover:bg-gray-200 transition"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              title="Tutup Preview (Esc)"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-gray-100 overflow-auto relative flex flex-col">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-dashAccent" />
              <p className="text-sm font-medium">Memuat pratinjau dokumen...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-dashNavy mb-1">
                Gagal Memuat Dokumen
              </h4>
              <p className="text-xs text-gray-500 mb-4">{error}</p>
              {downloadEndpoint && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-dashAccent text-white text-xs font-semibold hover:brightness-95 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Coba Unduh File Langsung
                </button>
              )}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 1. PDF Viewer */}
              {fileType === "pdf" && blobUrl && (
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  title={fileName}
                  className="w-full h-full flex-1 border-0 bg-white"
                />
              )}

              {/* 2. DOCX Viewer */}
              {fileType === "docx" && (
                <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-gray-200/70">
                  <div
                    ref={docxContainerRef}
                    className="docx-render-host bg-white shadow-lg rounded-sm max-w-4xl w-full min-h-[600px] p-6 sm:p-10 text-gray-800"
                    style={{
                      fontFamily:
                        "'Calibri', 'Arial', 'Segoe UI', sans-serif",
                    }}
                  />
                </div>
              )}

              {/* 3. Image Viewer */}
              {fileType === "image" && blobUrl && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={blobUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* 4. Unsupported Format Fallback */}
              {fileType === "unsupported" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-dashNavy mb-1">
                    Pratinjau Tidak Tersedia
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Format file ini (
                    <span className="font-semibold uppercase">
                      .{getExtension(fileName)}
                    </span>
                    ) tidak mendukung pratinjau langsung di browser. Anda dapat
                    mengunduhnya untuk membuka di aplikasi terkait.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-dashAccent text-white text-xs font-semibold hover:brightness-95 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh File (
                    {fileName})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <span>In-Memory Preview — Dokumen tidak disimpan di perangkat</span>
          <span>Satlak Dukteksi Pussiberad</span>
        </div>
      </div>
    </div>
  );
}
