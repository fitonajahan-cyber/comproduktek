import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, UserCircle } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/messages', { params: { limit: 1 } }).then((r) => setUnread(r.data.unreadCount)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-panel font-dash">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} unread={unread} />
      <Sidebar unread={unread} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu admin"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <div className={`transition-all duration-200 min-h-screen flex flex-col ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between lg:justify-end px-4 sm:px-6 gap-2 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-dashNavy hover:bg-gray-50 transition-colors"
            aria-label="Buka menu admin"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <UserCircle className="w-5 h-5 text-dashNavy/60 shrink-0" />
            <span className="text-sm text-dashNavy/70 truncate">
              <strong className="text-dashNavy font-semibold">{user?.full_name}</strong>
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
