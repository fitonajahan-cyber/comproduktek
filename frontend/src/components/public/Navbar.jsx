import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from "../ui/ThemeToggle";

const MENU_ITEMS = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang Kami', to: '/tentang-kami' },
  { label: 'Struktur Organisasi', to: '/struktur-organisasi' },
  { label: 'Produk', to: '/produk' },
  { label: 'Galeri', to: '/galeri' },
  { label: 'Berita', to: '/berita' },
  { label: 'Kontak', to: '/kontak' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      if (open) setOpen(false); // Otomatis tutup menu mobile jika user melakukan scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white dark:bg-darkbg transition-all duration-300 border-b border-transparent dark:border-darkborder ${scrolled ? 'shadow-md py-2.5' : 'py-4'
        }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* Logo Satlak */}
        <NavLink to="/" className="flex items-center gap-3 group">
           <img
             src="/logo.webp"
             alt="Logo Dukteksi"
             width="40"
             height="40"
             className="h-10 w-auto object-contain"
             onError={(e) => {
               e.currentTarget.style.display = 'none';
             }}
           />
          <div className="flex flex-col">
            <span className="text-navy dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-extrabold text-lg md:text-xl tracking-tight uppercase leading-none">
              SATLAK DUKTEKSI
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <nav aria-label="Desktop Navigation" className="flex items-center gap-6">
            {MENU_ITEMS.slice(0, 6).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 py-1 ${isActive
                    ? 'text-navy dark:text-white font-bold border-b-2 border-navy dark:border-white'
                    : 'text-inktext/70 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Button */}
          <ThemeToggle />
          <NavLink
            to="/kontak"
            className="bg-navy dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md shrink-0"
          >
            Hubungi Kami
          </NavLink>
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            className="text-navy dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg transition-colors focus:outline-none flex items-center gap-1.5 text-sm font-semibold"
            onClick={() => setOpen(!open)}
            aria-label="Buka menu navigasi"
          >
          {open ? (
            <><X className="w-6 h-6" /><span>Tutup</span></>
          ) : (
            <><Menu className="w-6 h-6" /><span>Menu</span></>
          )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {open && (
        <nav aria-label="Mobile Navigation" className="lg:hidden bg-white dark:bg-darkbg border-t border-gray-100 dark:border-darkborder px-6 py-5 flex flex-col gap-2 shadow-xl absolute w-full left-0 animate-fade-in">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-inktext/80 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/kontak"
            onClick={() => setOpen(false)}
            className="bg-navy dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-3 mt-2 rounded-xl text-sm font-semibold text-center transition-colors shadow-sm"
          >
            Hubungi Kami
          </NavLink>
        </nav>
      )}
    </header>
  );
}