import { ShieldCheck, Cpu, Lock, Cog } from 'lucide-react';
import RevealSection from '../../components/common/RevealSection';

const logo_elements = [
  {
    icon: ShieldCheck,
    title: 'Perisai, Pedang & Sayap',
    desc: 'Melambangkan ksatria di medan perang siber. Pedang yang disarungkan menandakan serangan adalah upaya terakhir; perlindungan adalah prioritas utama (Sapta Marga, Sumpah Prajurit, 8 Wajib TNI).'
  },
  {
    icon: Cpu,
    title: 'Otak Bercahaya',
    desc: 'Melambangkan logika, kreativitas, dan kecerdasan dalam "Perang Asimetris". Menunjukkan kesadaran situasional tinggi untuk pengambilan keputusan cepat.'
  },
  {
    icon: Lock,
    title: 'Gembok & Lingkaran Cahaya',
    desc: 'Melambangkan prinsip kehati-hatian dan ketelitian. Menutup setiap titik lemah untuk menjaga aset data dan informasi.'
  },
  {
    icon: Cog,
    title: 'Roda Gigi',
    desc: 'Melambangkan harmonisasi sistem dan efisiensi operasional melalui kolaborasi tim yang solid.'
  }
];

export default function About() {
  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12 space-y-12 md:space-y-16 lg:space-y-24">

        {/* Section 1: Hero Profile */}
        <RevealSection threshold={0.15} className="rounded-[2.5rem] p-8 md:p-12 -mt-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-navy dark:text-white leading-tight tracking-tight">
                Krtrima Raksa Mandalam
              </h1>

              <p className="text-inktext/80 dark:text-gray-400 text-base md:text-lg leading-relaxed font-light">
                Satuan Pelaksana Dukungan Teknologi Siber (Satlak Dukteksi) bertugas menyelenggarakan riset terapan, rekayasa terbalik, serta pemeliharaan infrastruktur siber pertahanan untuk menjaga aset informasi kedaulatan TNI AD.
              </p>

              {/* Bullet Points Arti Semboyan */}
              <div className="pt-2 space-y-3">
                <h4 className="text-sm font-bold text-navy dark:text-gray-200 uppercase tracking-wider">
                  Arti Semboyan & Motto Satuan:
                </h4>
                <ul className="space-y-2.5 text-sm md:text-base text-inktext/80 dark:text-gray-400">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>
                      <strong className="text-navy dark:text-gray-200 font-bold">KRTRIMA (Tidak Tampak):</strong> Merujuk pada dunia digital / ruang siber yang tak kasat mata.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>
                      <strong className="text-navy dark:text-gray-200 font-bold">RAKSA (Mengamankan):</strong> Tindakan mempertahankan dan melindungi kedaulatan.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>
                      <strong className="text-navy dark:text-gray-200 font-bold">MANDALAM (Ruang Sistem):</strong> Suatu ruang sistem yang menyeluruh dan menyelimuti.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[280px] sm:min-h-[380px]">
              <div className="absolute left-0 bottom-4 w-36 sm:w-44 md:w-56 h-52 sm:h-60 md:h-72 rounded-b-full overflow-hidden border-4 border-white dark:border-darkpanel shadow-xl bg-slate-900 group hover:scale-105 transition-transform duration-500 z-10">
                 <img
                   src="/logo.webp"
                   alt="Logo Satlak Dukteksi"
                   width="176"
                   height="288"
                   loading="lazy"
                   className="w-full h-full object-contain p-6 bg-gradient-to-br from-slate-900 via-navy to-slate-900 group-hover:scale-110 transition-transform duration-500"
                 />
              </div>

              <div className="absolute right-2 top-0 w-44 sm:w-52 md:w-60 h-60 sm:h-72 md:h-84 rounded-t-full overflow-hidden border-4 border-white dark:border-darkpanel shadow-2xl bg-navy group hover:scale-105 transition-transform duration-500 z-20">
                 <img
                   src="/pussiberad_logo.webp"
                   alt="Logo PUSSIBERAD"
                   width="208"
                   height="336"
                   loading="lazy"
                   className="w-full h-full object-contain p-8 bg-gradient-to-tr from-navy via-slate-900 to-navy group-hover:scale-110 transition-transform duration-500"
                 />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 -mt-2">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-navy dark:text-white">Tugas Pokok Institusi</h3>
              <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                Menyelenggarakan pembinaan kemampuan, kekuatan, serta kesiapan operasional dukungan teknologi siber melalui pengembangan teknologi, rekayasa terbalik, serta pemeliharaan dan instalasi guna mendukung tugas pokok Pusat Siber Angkatan Darat.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-navy dark:text-white">Fungsi Utama Satuan</h3>
              <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                Melaksanakan riset dan pembuatan solusi teknologi siber terapan mandiri, analisis mendalam perangkat lunak dan sistem (reverse engineering), serta instalasi, perawatan infrastruktur siber, dan pengamanan data berkelanjutan untuk menjaga aset kedaulatan informasi instansi.
              </p>
            </div>
          </div>
        </RevealSection>

        {/* Section 2: Makna Logo */}
        <RevealSection className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-navy dark:text-gray-200 uppercase bg-gray-50 dark:bg-[#16273D] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 inline-block">
              FILOSOFI LOGO SATLAK DUKTEKSI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
              Elemen Logo & Makna
            </h2>
            <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base">
              Setiap simbol pada identitas Satlak Dukteksi mengandung nilai ksatria, ketelitian, dan efisiensi dalam perang siber.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Grid Kiri: Emblem Logo */}
            <div className="lg:col-span-5 bg-white dark:bg-[#112236] border border-gray-100 dark:border-darkborder rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm group">
              <div className="absolute inset-0 bg-gradient-to-br from-navy/30 via-transparent to-navy/5 pointer-events-none dark:from-white/20 dark:via-transparent dark:to-white/5" />

              <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-full p-6 bg-white dark:bg-gray-100 border border-gray-100 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <img
                   src="/logo.webp"
                   alt="Logo Satlak Dukteksi"
                   width="240"
                   height="240"
                   loading="lazy"
                   className="h-60 object-contain filter drop-shadow-md"
                 />
              </div>

              <div className="mt-8 text-center relative z-10 space-y-1">
                <h3 className="font-extrabold text-navy dark:text-white text-lg tracking-wide uppercase">
                  SATLAK DUKTEKSI
                </h3>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
                  PUSSIBERAD TNI AD
                </p>
              </div>
            </div>

            {/* Grid Kanan: 4 Container Informasi Logo */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {logo_elements.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-white dark:bg-[#112236] border border-gray-100 dark:border-darkborder p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-navy dark:bg-blue-900 group-hover:bg-blue-600 flex items-center justify-center text-white mb-4 transition-colors duration-300 shadow-md shadow-blue-500/10">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-navy dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-base mb-2">
                        {item.title}
                      </h4>
                      <p className="text-inktext/70 dark:text-gray-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </RevealSection>

      </div>
    </div>
  );
}