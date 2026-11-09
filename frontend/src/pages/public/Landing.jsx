import { useEffect, useState, useRef } from "react";
import { formatDate } from "../../lib/dateUtils";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Marquee } from "../../components/ui/marquee";
import RevealSection from "../../components/common/RevealSection";
import HeroSlider from "../../components/public/HeroSlider";
import {
  Terminal,
  Wrench,
  Server,
  ArrowUpRight,
  PackageSearch,
  Cpu,
  Newspaper,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";

const highlights = [
  {
    title: "Pengembangan Teknologi",
    desc: "Riset dan pembuatan solusi teknologi siber terapan untuk mendukung keandalan sistem informasi serta pertahanan digital TNI AD.",
    icon: Terminal,
    link: "/produk",
  },
  {
    title: "Rekayasa Terbalik",
    desc: "Analisis mendalam terhadap perangkat lunak dan sistem (Reverse Engineering) untuk mendeteksi celah keamanan serta ancaman siber.",
    icon: Wrench,
    link: "/produk",
  },
  {
    title: "Pemeliharaan & Instalasi",
    desc: "Layanan terpadu mencakup instalasi jaringan, perawatan infrastruktur siber, dan pengamanan sistem data secara berkelanjutan.",
    icon: Server,
    link: "/produk",
  },
];

export default function Landing() {
  const [news, setNews] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/news", { params: { limit: 3 } })
      .then((r) => setNews(r.data.data))
      .catch(() => {});
    api
      .get("/products", { params: { limit: 4 } })
      .then((r) => setProducts(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen space-y-16 py-4 transition-colors duration-300">
      {/* Hero Section */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="relative rounded-[2.5rem] overflow-hidden flex items-center min-h-[50vh] sm:min-h-[65vh] lg:min-h-[75vh] shadow-xl shadow-navy/10 dark:shadow-black/40 border border-gray-100 dark:border-darkborder">
          <HeroSlider />
          <div className="absolute inset-0 bg-[#0c1839]/20 bg-gradient-to-r from-[#0c1839]/20 via-[#0c1839]/60 to-transparent" />

          <div className="relative z-10 px-8 md:px-16 lg:px-24 py-10 md:py-16 lg:py-20 max-w-5xl animate-fade-in-up text-left">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">
              Satuan Pelaksana Dukungan Teknologi Siber TNI AD
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-10 leading-relaxed max-w-2xl">
              Dengan semangat Krtrima Raksa Mandalam (mengamankan ruang
              digital), Satlak Dukungan Teknologi Siber bekerja di balik layar
              untuk menjaga aset informasi dan infrastruktur sistem agar tetap
              aman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/kontak"
                className="bg-[#4361EE]/90 hover:bg-blue-600 text-white px-7 py-3 rounded-xl font-medium transition-all duration-300 text-center shadow-lg hover:shadow-blue-500/25 inline-flex items-center justify-center gap-2 group shrink-0"
              >
                Hubungi Kami{" "}
                <span className="text-sm transition-transform group-hover:translate-x-1">
                  ›
                </span>
              </Link>
              <Link
                to="/produk"
                className="bg-white/85 hover:bg-white text-navy px-7 py-3 rounded-xl font-medium transition-all duration-300 text-center inline-flex items-center justify-center border border-white/15"
              >
                Layanan & Produk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="w-full overflow-hidden rounded-2xl py-4">
          <Marquee
            pauseOnHover
            className="bg-transparent text-navy flex items-center"
          >
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-6 mx-6 whitespace-nowrap"
              >
                <img
                  src="/logo.webp"
                  alt="Logo Satlak"
                  width="40"
                  height="40"
                  className="h-8 md:h-10 w-auto object-contain"
                />
                <span className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] uppercase text-navy dark:text-gray-300">
                  KRTRIMA RAKSA MANDALAM
                </span>
                <img
                  src="/pussiberad_logo.webp"
                  alt="Logo Pussiberad"
                  width="40"
                  height="40"
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </RevealSection>

      {/* Pilar Kemampuan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-[#f8fafc] dark:bg-darkpanel py-8 md:py-12 lg:py-16 px-8 md:px-12 rounded-[2.5rem] relative overflow-hidden border border-gray-100 dark:border-darkborder shadow-sm">
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-navy/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start relative z-10">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold tracking-widest text-navy dark:text-gray-200 uppercase bg-white dark:bg-[#16273D] px-3 py-1.5 rounded-md border border-navy/20 dark:border-gray-700 inline-block mb-4 shadow-sm">
                PILAR KEMAMPUAN
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white leading-tight tracking-tight">
                Dukungan Teknologi & Pengamanan Ruang Siber
              </h2>
            </div>

            <div className="lg:col-span-6 text-inktext/70 dark:text-gray-400 text-base md:text-lg leading-relaxed space-y-4 pt-2">
              <p>
                Ancaman siber yang kian kompleks membutuhkan sistem pertahanan
                yang tangguh. Satlak Dukungan Teknologi Siber mengintegrasikan
                riset terapan, analisis mendalam, dan pemeliharaan sistem dalam
                satu kesatuan tim.
              </p>
              <p>
                Setiap elemen teknologi dikembangkan dan dijaga dengan tingkat
                ketelitian tinggi demi memastikan kedaulatan informasi serta
                ruang digital tetap terlindungi.
              </p>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {highlights.map((h) => {
              const IconComponent = h.icon;
              return (
                <div
                  key={h.title}
                  className="group/card bg-white dark:bg-[#112236] border border-gray-100 dark:border-darkborder p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-navy group-hover/card:bg-blue-600 flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/20 transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-navy dark:text-gray-100 group-hover/card:text-blue-600 transition-colors duration-300 text-xl mb-3 leading-snug">
                      {h.title}
                    </h3>
                    <p className="text-inktext/70 dark:text-gray-400 text-sm leading-relaxed mb-8">
                      {h.desc}
                    </p>
                  </div>

                  <Link
                    to={h.link}
                    aria-label={`Selengkapnya tentang ${h.title}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-gray-50 dark:bg-[#1A2C42] hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2.5 rounded-lg w-fit transition-colors"
                  >
                    Selengkapnya <span className="text-xs">›</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      {/* Produk & Layanan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-navy dark:text-gray-200 uppercase bg-gray-50 dark:bg-[#16273D] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 inline-block mb-3">
                INOVASI & RISET
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight tracking-tight">
                Produk & Solusi Unggulan
              </h2>
              <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base mt-2 max-w-xl">
                Hasil pengembangan teknologi siber terapan dan sistem perangkat
                keras/lunak mandiri Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>

            <Link
              to="/produk"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-gray-50 dark:bg-[#1A2C42] hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-700 px-5 py-3 rounded-xl transition-all shrink-0 w-fit"
            >
              Lihat Semua Produk <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Body Content */}
          {products.length === 0 ? (
            <div className="bg-white dark:bg-darkpanel border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <PackageSearch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">
                Belum Ada Produk Dipublikasikan
              </h3>
              <p className="text-inktext/60 dark:text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
                Katalog produk siber terapan dan sistem inovasi saat ini sedang
                dalam tahap dokumentasi atau riset internal.
              </p>
              <Link
                to="/kontak"
                className="text-xs font-semibold text-navy dark:text-white hover:text-white bg-white dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Ajukan Informasi / Konsultasi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
              {products.map((p) => (
                <Link
                  to={`/produk/${p.id || "#"}`}
                  key={p.id}
                  className="group bg-[#f8fafc] dark:bg-[#112236] border border-gray-100 dark:border-darkborder rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-xl mb-5 h-52 bg-slate-900">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          width="277"
                          height="208"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex flex-col items-center justify-center text-white/40 p-4">
                          <Cpu className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium tracking-wider uppercase">
                            Sistem Siber
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="text-[11px] font-bold bg-white/90 backdrop-blur-md text-navy px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                          {p.status || "Aktif"}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xl text-navy dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-inktext/70 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
                      {p.description ||
                        "Solusi teknologi siber terapan yang dikembangkan khusus untuk mendukung keandalan sistem pertahanan."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-xs font-semibold text-navy dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <span>Detail Produk</span>
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </RevealSection>

      {/* Berita & Kegiatan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-navy dark:text-gray-200 uppercase bg-white dark:bg-[#16273D] px-3 py-1.5 rounded-md border border-navy/20 dark:border-gray-700 inline-block mb-3 shadow-sm">
                PUSAT INFORMASI
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight tracking-tight">
                Berita & Kegiatan Terkini
              </h2>
              <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base mt-2 max-w-xl">
                Publikasi resmi mengenai operasional, edukasi siber, dan kabar
                terbaru dari Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>

            <Link
              to="/berita"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white dark:bg-[#1A2C42] hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-700 px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 w-fit"
            >
              Lihat Semua Berita <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Content */}
          {news.length === 0 ? (
            <div className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-2xl p-12 text-center flex flex-col items-center justify-center relative z-10 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy dark:text-white mb-1">
                Belum Ada Berita Terbaru
              </h3>
              <p className="text-inktext/60 dark:text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
                Kabar kegiatan dan pembaruan informasi siber saat ini belum
                dipublikasikan.
              </p>
              <Link
                to="/kontak"
                className="text-xs font-semibold text-navy dark:text-white hover:text-white bg-white dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Hubungi Pusat Informasi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Card Kiri (Big Featured Card) */}
              {news[0] && (
                <div className="lg:col-span-6 flex">
                  <Link
                    to={`/berita/${news[0].id}`}
                    aria-label={`Baca berita selengkapnya: ${news[0].title}`}
                    className="group relative w-full min-h-[420px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/80 dark:border-navy flex flex-col justify-end p-6 md:p-8"
                  >
                    {news[0].thumbnail ? (
                      <img
                        src={news[0].thumbnail}
                        alt={news[0].title}
                        width="613"
                        height="460"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-navy to-slate-800" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                    <div className="relative z-10 text-white">
                      <div className="flex items-center gap-3 mb-3 text-xs font-semibold">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
                          Kegiatan Siber
                        </span>
                        <span className="text-white/70 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(news[0].news_date, "Terbaru")}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-snug text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                        {news[0].title}
                      </h3>

                      <p className="text-white/80 text-sm line-clamp-2 leading-relaxed mb-4">
                        {news[0].content ||
                          news[0].excerpt ||
                          "Informasi dan dokumentasi kegiatan resmi Satlak Dukungan Teknologi Siber PUSSIBERAD."}
                      </p>

                      <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:text-blue-300">
                        Selengkapnya{" "}
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Card Kanan (2 Horizontal Stacked) */}
              <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
                {news.slice(1, 3).map((n) => (
                  <Link
                    to={`/berita/${n.id}`}
                    key={n.id}
                    aria-label={`Baca berita selengkapnya: ${n.title}`}
                    className="group bg-white dark:bg-[#112236] border border-gray-100 dark:border-darkborder rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-center h-full"
                  >
                    <div className="w-full sm:w-48 h-40 sm:h-full shrink-0 overflow-hidden rounded-xl bg-slate-900 relative">
                      {n.thumbnail ? (
                        <img
                          src={n.thumbnail}
                          alt={n.title}
                          width="192"
                          height="160"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between h-full py-1 w-full">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                          <span className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">
                            Berita
                          </span>
                          <span className="text-inktext/50 text-[11px]">
                            {formatDate(n.news_date, "Terbaru")}
                          </span>
                        </div>

                        <h4 className="font-bold text-lg text-navy dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2 leading-snug">
                          {n.title}
                        </h4>

                        <p className="text-inktext/70 text-xs line-clamp-2 leading-relaxed">
                          {n.content ||
                            n.excerpt ||
                            "Ulasan singkat berita dan publikasi kegiatan operasional siber."}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-semibold text-navy dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <span>Selengkapnya</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}

                {news.length === 1 && (
                  <div className="bg-white dark:bg-[#112236] border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-inktext/60 dark:text-gray-400 text-sm">
                      Belum ada berita tambahan lainnya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </RevealSection>
    </div>
  );
}
