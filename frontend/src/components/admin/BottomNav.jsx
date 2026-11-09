import { NavLink, useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import { adminMenu } from './adminMenu';
import { useAuth } from '../../context/AuthContext';

// Pengganti Sidebar khusus layar <lg (HP & tablet). Sidebar desktop
// (fixed, di kiri) disembunyikan total pada breakpoint ini, digantikan
// bar navigasi ini yang menempel di bawah layar — jadi tidak ada mode
// "collapsed/expanded" di mobile, semua item langsung terlihat.
export default function BottomNav({ unread }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/portal-dukteksi/login');
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-dashNavy border-t border-white/20 font-dash">
      <div className="flex justify-start sm:justify-center overflow-x-auto no-scrollbar px-2">
        {adminMenu.map((m) => {
          const Icon = m.icon;
          return (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-16 sm:min-w-20 shrink-0 text-xs whitespace-nowrap border-t-2 transition-colors ${
                  isActive ? 'text-white font-semibold border-dashAccent' : 'text-white/70 border-transparent hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {m.shortLabel || m.label}
              {m.to.includes('kotak-masuk') && unread > 0 && (
                <span className="absolute top-1 right-2 bg-dashMint text-dashNavy text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {unread}
                </span>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-16 sm:min-w-20 shrink-0 text-xs whitespace-nowrap text-white/70 border-t-2 border-transparent hover:text-white transition-colors"
        >
          <Power className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </nav>
  );
}