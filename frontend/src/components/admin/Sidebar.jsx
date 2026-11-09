import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Power, X } from 'lucide-react';
import { adminMenuGroups } from './adminMenu';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ collapsed = false, setCollapsed, unread, mobileOpen = false, onMobileClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = Boolean(onMobileClose);
  const showLabels = isMobile || !collapsed;

  const handleLogout = async () => {
    await logout();
    navigate('/portal-dukteksi/login');
  };

  return (
    <aside
      className={`${
        isMobile
          ? `lg:hidden fixed inset-y-0 left-0 z-40 w-72 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `hidden lg:flex fixed inset-y-0 left-0 z-40 ${collapsed ? 'w-16' : 'w-64'}`
      } bg-dashNavy text-white flex-col transition-all duration-200 font-dash`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
        {showLabels && <span className="font-semibold tracking-wide text-sm">DUKTEKSI ADMIN</span>}
        {isMobile ? (
          <button onClick={onMobileClose} className="text-white hover:bg-white/10 p-1.5 rounded transition-colors" aria-label="Tutup menu admin">
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:bg-white/10 p-1.5 rounded transition-colors" aria-label="Ubah ukuran sidebar">
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-5 overflow-y-auto no-scrollbar">
        {adminMenuGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {showLabels && (
              <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-white/45">
                {group.label}
              </p>
            )}
            {group.items.map((m) => {
              const Icon = m.icon;
              return (
                <NavLink
                  key={m.to}
                  to={m.to}
                  title={showLabels ? undefined : m.label}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm border-r-4 transition-colors ${
                      isActive ? 'bg-white/10 text-white font-semibold border-dashAccent' : 'text-white/90 border-transparent hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {showLabels && (
                    <span className="flex-1">
                      {m.label}
                      {m.to.includes('kotak-masuk') && unread > 0 && (
                        <span className="ml-2 bg-dashMint text-dashNavy text-xs px-1.5 py-0.5 rounded-full font-semibold">{unread}</span>
                      )}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className={`flex items-center justify-center gap-2 text-sm rounded-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-dashAccent transition-colors font-medium ${
          showLabels ? 'm-4 px-4 py-2.5' : 'mx-auto my-4 p-2.5'
        }`}
      >
        {showLabels ? <><LogOut className="w-4 h-4 shrink-0" /> Logout</> : <Power className="w-4 h-4 shrink-0" />}
      </button>
    </aside>
  );
}
