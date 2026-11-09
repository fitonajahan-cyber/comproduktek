import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Shield,
  Cpu,
  Image as ImageIcon,
  X,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RevealSection from "../../components/common/RevealSection";
import { formatDate } from "../../lib/dateUtils";

const getResponsiveGridClass = (index, totalItems) => {
  if (totalItems < 3) return "col-span-1 row-span-1";

  // Pola diubah untuk menyesuaikan UI Bento Grid (Besar di tengah)
  const patterns = {
    0: "col-span-1 row-span-1",
    1: "col-span-1 row-span-1 md:col-span-2 md:row-span-2", // Item besar ditempatkan di indeks ke-1 (tengah)
    2: "col-span-1 row-span-1",
    3: "col-span-1 row-span-1",
    4: "col-span-1 row-span-1",
  };

  return patterns[index % 5] || "col-span-1 row-span-1";
};

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    api
      .get("/galleries", { params: { limit: 100 } })
      .then((r) => {
        const rawData = r.data.data || [];
        const mappedData = rawData.map((item, index) => ({
          id: item.id || index + 1,
          image: item.image,
          description: item.description || "Dokumentasi Kegiatan Satuan",
          gallery_date: item.gallery_date ? formatDate(item.gallery_date) : "",
        }));

        setPhotos(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data galeri:", err);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(photos.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPhotos = photos.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedPhoto) setSelectedPhoto(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen pb-20 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 space-y-10">
        {/* Section Header Judul */}
        <RevealSection className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy dark:text-white tracking-tight">
            Dokumentasi Kegiatan
          </h1>
          <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light">
            Kumpulan dokumentasi foto dan arsip visual kegiatan operasional
            serta latihan Satlak Dukteksi PUSSIBERAD.
          </p>
        </RevealSection>

        {/* Banner Informatif */}
        <RevealSection className="bg-[#f8fafc] dark:bg-darkpanel border border-gray-100 dark:border-darkborder p-6 md:p-8 rounded-[2rem] shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-navy dark:text-gray-100 text-lg tracking-tight">
                  Eksplorasi Galeri
                </h3>
                <p className="text-inktext/70 dark:text-gray-400 text-xs md:text-sm mt-0.5">
                  Klik pada foto untuk membuka tampilan gambar penuh beserta
                  detail penjelasannya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#112236] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-navy dark:text-gray-300 shrink-0 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{photos.length} Total Foto</span>
            </div>
          </div>
        </RevealSection>

        {/* Section Main Content Galeri Bento 5 Item */}
        <RevealSection>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl w-full h-full ${
                    n === 2 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-[#f8fafc] dark:bg-[#112236] border border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center my-8">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                Belum Ada Foto
              </h3>
              <p className="text-inktext/60 dark:text-gray-400 text-sm max-w-md leading-relaxed">
                Dokumentasi foto kegiatan belum diunggah atau belum tersedia
                saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[220px]"
                >
                  {currentPhotos.map((item, index) => {
                    const bentoClass = getResponsiveGridClass(
                      index,
                      currentPhotos.length,
                    );
                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`photo-${item.id}`}
                        onClick={() => setSelectedPhoto(item)}
                        className={`group relative overflow-hidden rounded-3xl cursor-pointer bg-slate-100 dark:bg-slate-800 border border-gray-100 dark:border-darkborder shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/50 ${bentoClass}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={item.image}
                          alt={item.description}
                          width="400"
                          height="350"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                          <p className="text-xs md:text-sm font-semibold line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                          {item.gallery_date && (
                            <span className="text-[11px] text-slate-300 mt-1 font-light flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.gallery_date}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#112236] text-navy dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                    aria-label="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1.5 px-3">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? "bg-navy dark:bg-blue-600 text-white shadow-md scale-105"
                              : "bg-gray-100 dark:bg-gray-800 text-inktext/70 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#112236] text-navy dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                    aria-label="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </RevealSection>

        {/* Footer Info Cards */}
        <RevealSection className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-[#f8fafc] dark:bg-darkpanel p-6 rounded-2xl border border-gray-100 dark:border-darkborder shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-blue-900 text-navy dark:text-gray-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-navy dark:text-gray-200 text-sm">
                Dokumentasi Resmi
              </h4>
              <p className="text-inktext/70 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                Seluruh dokumentasi visual dikelola langsung oleh tim publikasi
                Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafc] dark:bg-darkpanel p-6 rounded-2xl border border-gray-100 dark:border-darkborder shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-blue-900 dark:text-gray-400 text-navy flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-navy dark:text-gray-200 text-sm">
                Kegiatan Pertahanan
              </h4>
              <p className="text-inktext/70 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                Menampilkan sekilas aktivitas riset, latihan siber, serta
                pemeliharaan infrastruktur data.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafc] dark:bg-darkpanel p-6 rounded-2xl border border-gray-100 dark:border-darkborder shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-blue-900 dark:text-gray-400 text-navy flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-navy dark:text-gray-200 text-sm">
                Arsip Berkala
              </h4>
              <p className="text-inktext/70 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                Galeri ini diperbarui secara berkala mengikuti agenda
                operasional satuan.
              </p>
            </div>
          </div>
        </RevealSection>
      </div>

      {/* Pop-Up Lightbox Modal Detail Foto */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSelectedPhoto(null)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-dialog-title"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-[10000] w-full max-w-4xl bg-white dark:bg-darkpanel rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-darkborder flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-red-600 text-white transition-colors shadow-md backdrop-blur-sm"
                onClick={() => setSelectedPhoto(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>

              <div className="relative aspect-[16/9] max-h-[70vh] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.description}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 bg-white dark:bg-darkpanel border-t border-gray-100 dark:border-darkborder flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      <Info className="w-3.5 h-3.5" />
                      <span>Detail Dokumentasi</span>
                    </span>
                    <h3 id="gallery-dialog-title" className="text-lg md:text-xl font-bold text-navy dark:text-white leading-snug pt-1">
                      {selectedPhoto.description}
                    </h3>
                  </div>

                  {selectedPhoto.gallery_date && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-inktext/60 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-navy dark:text-gray-400" />
                      <span>{selectedPhoto.gallery_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
