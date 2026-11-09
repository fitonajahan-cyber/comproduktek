import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import RevealSection from '../../components/common/RevealSection';
import {
  PackageSearch,
  Cpu,
  Search,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';

const STATUSES = ['Semua', 'Aktif', 'Dalam Pengembangan', 'Nonaktif'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [status, setStatus] = useState('Semua');

  useEffect(() => {
    api
      .get('/products', { params: { limit: 100 } })
      .then((r) => setProducts(r.data.data))
      .catch(() => { });
  }, []);

  const categories = useMemo(
    () => ['Semua', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Semua' || p.category === category;
    const matchesStatus = status === 'Semua' || p.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  }), [products, search, category, status]);

  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen pb-20 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 space-y-10">

        {/* Searchbar */}
        <RevealSection className="bg-[#f8fafc] dark:bg-darkpanel border border-gray-100 dark:border-darkborder p-6 md:p-8 rounded-[2rem] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-inktext/40" />
              <input
                type="text"
                placeholder="Cari produk atau solusi siber..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-darkbg border border-gray-200 dark:border-gray-700 pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-navy dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-navy dark:focus:border-blue-500 focus:ring-1 focus:ring-navy dark:focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-darkbg border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-navy dark:text-gray-300 shadow-sm shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-navy dark:text-gray-400" />
                <span>Filter:</span>
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white dark:bg-darkbg border border-gray-200 dark:border-gray-700 hover:border-navy dark:hover:border-blue-500 rounded-xl px-4 py-3 text-xs font-semibold text-navy dark:text-gray-300 focus:outline-none transition-all cursor-pointer shadow-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Kategori: {c}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-white dark:bg-darkbg border border-gray-200 dark:border-gray-700 hover:border-navy dark:hover:border-blue-500 rounded-xl px-4 py-3 text-xs font-semibold text-navy dark:text-gray-300 focus:outline-none transition-all cursor-pointer shadow-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </RevealSection>

        {/* Produk Section*/}
        <RevealSection>
          {filtered.length === 0 ? (
            <div className="bg-[#f8fafc] dark:bg-[#112236] border border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center my-8">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <PackageSearch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                Tidak Ada Produk Ditemukan
              </h3>
              <p className="text-inktext/60 dark:text-gray-400 text-sm max-w-md leading-relaxed">
                Tidak ada produk yang cocok dengan kriteria pencarian atau filter yang Anda pilih. Coba sesuaikan kata kunci atau reset filter.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('Semua');
                  setStatus('Semua');
                }}
                className="mt-6 text-xs font-semibold text-navy dark:text-gray-300 hover:text-white bg-white dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-500 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <Link
                  to={`/produk/${p.id}`}
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
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-navy to-slate-900 flex flex-col items-center justify-center text-white/40 p-4">
                          <Cpu className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium tracking-wider uppercase">
                            Sistem Siber
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        {p.status && (
                          <span className="text-[11px] font-bold bg-white/95 backdrop-blur-md text-navy px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                            {p.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      {p.category && <span>{p.category}</span>}
                      {p.unit_pengampu && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-inktext/60 dark:text-gray-400 font-semibold">{p.unit_pengampu}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-navy dark:text-gray-100 mb-2 transition-colors line-clamp-1">
                      {p.name}
                    </h3>

                    <p className="text-inktext/70 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-xs font-semibold text-navy dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <span>Lihat Detail Produk</span>
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </RevealSection>

      </div>
    </div>
  );
}