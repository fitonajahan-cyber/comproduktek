import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink, Map } from "lucide-react";

export default function Footer() {
  const [loadMap, setLoadMap] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" }
    );
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const gmapsUrl =
    "https://maps.google.com/maps?q=Jl.%20Veteran%20No.5,%20Gambir,%20Jakarta%20Pusat&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <footer className="bg-white/10 dark:bg-darkbg text-inktext dark:text-gray-200 pt-16 pb-10 border-t border-gray-100 dark:border-darkborder">
      {/* Container Utama */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Top Grid Area: 5 Kolom Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-gray-100 dark:border-darkborder">
          {/* Kolom 1 (lg:col-span-4): Logo & Deskripsi Satuan */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Logo & Branding Title */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.webp"
                  alt="Logo Satlak Dukteksi"
                  width="48"
                  height="48"
                  className="h-12 w-auto object-contain shrink-0"
                />
                <img
                  src="/pussiberad_logo.webp"
                  alt="Logo PUSSIBERAD"
                  width="48"
                  height="48"
                  className="h-12 w-auto object-contain shrink-0 border-l border-gray-200 dark:border-gray-700 pl-3"
                />
              </div>

              <h3 className="text-navy dark:text-gray-100 font-extrabold text-lg tracking-tight uppercase leading-snug">
                SATLAK DUKTEKSI PUSSIBERAD
              </h3>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-3">
                Krtrima Raksa Mandalam
              </p>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-sm">
                Satuan Pelaksana Dukungan Teknologi Siber Pusat Siber Angkatan
                Darat (TNI AD). Bertugas menyelenggarakan riset terapan,
                rekayasa terbalik, serta pemeliharaan infrastruktur siber
                pertahanan.
              </p>
            </div>
          </div>

          {/* Kolom 2 (lg:col-span-2): Navigasi Cepat (Grid 2 Kolom @ 4 Navigasi) */}
          <div className="lg:col-span-2">
            <h4 className="text-navy dark:text-gray-100 font-bold mb-4 tracking-tight uppercase text-xs">
              Navigasi Halaman
            </h4>

            {/* Inner Grid 2 Kolom */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
              {/* Kolom Kiri (4 Navigasi) */}
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tentang-kami"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/struktur-organisasi"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Struktur
                  </Link>
                </li>
                <li>
                  <Link
                    to="/produk"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Produk
                  </Link>
                </li>
              </ul>

              {/* Kolom Kanan (3 Navigasi) */}
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/galeri"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Galeri
                  </Link>
                </li>
                <li>
                  <Link
                    to="/berita"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Berita
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kontak"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5"
                  >
                    Kontak Kami
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3 (lg:col-span-3): Detail Kontak */}
          <div className="lg:col-span-3">
            <h4 className="text-navy dark:text-gray-100 font-bold mb-4 tracking-tight uppercase text-xs">
              Hubungi Kami
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <a
                  href="mailto:info@pussiberad.mil.id"
                  className="flex items-center gap-2.5 text-navy dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold w-fit"
                >
                  <Mail className="w-4 h-4 shrink-0 text-navy dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" />
                  <span>info@pussiberad.mil.id</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+62211234567"
                  className="flex items-center gap-2.5 text-navy dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold w-fit"
                >
                  <Phone className="w-4 h-4 shrink-0 text-navy dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" />
                  <span>(021) 1234567</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <MapPin className="w-4 h-4 shrink-0 text-navy dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mt-1" />
                  <span>
                    Jl. Veteran No.5, RT.3/RW.2, Gambir, Kec. Gambir, Kota
                    Jakarta Pusat, DKI Jakarta 10110
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Kolom 4 (lg:col-span-3): Interactive Google Maps Preview */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-navy dark:text-gray-100 font-bold tracking-tight uppercase text-xs">
                Lokasi Satuan
              </h4>
              <a
                href="https://maps.google.com/?q=Jl.+Veteran+No.5,+Gambir,+Jakarta+Pusat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-navy dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                Buka Peta <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Google Maps Container Card */}
            <div
              ref={mapContainerRef}
              className="w-full h-48 rounded-xl overflow-hidden border border-gray-200/80 dark:border-darkborder shadow-sm relative group bg-gray-100 dark:bg-darkpanel flex items-center justify-center"
            >
              {loadMap ? (
                <iframe
                  title="Google Maps PUSSIBERAD"
                  src={gmapsUrl}
                  className="w-full h-full border-0 transition-all duration-500"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setLoadMap(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full h-full"
                >
                  <Map className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span className="text-xs font-semibold">Tampilkan Peta Interaktif</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright Center */}
        <div className="pt-8 flex justify-center items-center text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
          <p className="text-center">
            Copyright © {new Date().getFullYear()}{" "}
            <Link
              to="/"
              className="font-bold text-navy dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Satlak Dukteksi PUSSIBERAD TNI AD
            </Link>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
