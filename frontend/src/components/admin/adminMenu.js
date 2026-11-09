import {
  LayoutDashboard,
  Newspaper,
  Package,
  Images,
  Network,
  Mail,
  Users,
  ClipboardList,
  CalendarCheck,
  FileText,
  CalendarDays,
} from 'lucide-react';


// Dipakai bersama oleh Sidebar (desktop, >=lg) dan BottomNav (mobile/tablet, <lg)
// supaya daftar menu tidak perlu didefinisikan dua kali.
// shortLabel dipakai khusus di BottomNav karena ruang horizontalnya sempit.
export const adminMenuGroups = [
  {
    label: 'Manajemen Konten Website',
    items: [
      { label: 'Dashboard', to: '/admin-portal/dashboard', icon: LayoutDashboard },
      { label: 'Berita', to: '/admin-portal/berita', icon: Newspaper },
      { label: 'Produk', to: '/admin-portal/produk', icon: Package },
      { label: 'Galeri', to: '/admin-portal/galeri', icon: Images },
      { label: 'Struktur Organisasi', shortLabel: 'Struktur', to: '/admin-portal/struktur-organisasi', icon: Network },
      { label: 'Kotak Masuk', shortLabel: 'Pesan', to: '/admin-portal/kotak-masuk', icon: Mail },
    ],
  },
  {
    label: 'Personel & Operasional',
    items: [
      { label: 'Anggota', to: '/admin-portal/anggota', icon: Users },
      { label: 'Jadwal Piket', shortLabel: 'Piket', to: '/admin-portal/jadwal-piket', icon: CalendarDays },
      { label: 'Program Kerja', shortLabel: 'Proker', to: '/admin-portal/program-kerja', icon: ClipboardList },
      { label: 'Rekap Presensi', shortLabel: 'Presensi', to: '/admin-portal/rekap-presensi', icon: CalendarCheck },
      { label: 'Laporan Harian', shortLabel: 'Laporan', to: '/admin-portal/laporan-harian', icon: FileText },
    ],
  },
];

export const adminMenu = adminMenuGroups.flatMap((group) => group.items);