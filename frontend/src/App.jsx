import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Eager load Landing page untuk memastikan First Contentful Paint secepat mungkin
import Landing from "./pages/public/Landing";

// Public pages (Lazy loaded)
const About = lazy(() => import("./pages/public/About"));
const OrgStructure = lazy(() => import("./pages/public/OrgStructure"));
const Products = lazy(() => import("./pages/public/Products"));
const ProductDetail = lazy(() => import("./pages/public/ProductDetail"));
const Gallery = lazy(() => import("./pages/public/Gallery"));
const News = lazy(() => import("./pages/public/News"));
const NewsDetail = lazy(() => import("./pages/public/NewsDetail"));
const Contact = lazy(() => import("./pages/public/Contact"));

// Admin pages (Lazy loaded)
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const NewsManage = lazy(() => import("./pages/admin/NewsManage"));
const ProductManage = lazy(() => import("./pages/admin/ProductManage"));
const GalleryManage = lazy(() => import("./pages/admin/GalleryManage"));
const OrgStructureManage = lazy(() => import("./pages/admin/OrgStructureManage"));
const SoldierManage = lazy(() => import("./pages/admin/SoldierManage"));
const JadwalPiketManage = lazy(() => import("./pages/admin/JadwalPiketManage"));
const ProgramKerjaManage = lazy(() => import("./pages/admin/ProgramKerjaManage"));
const AbsensiManage = lazy(() => import("./pages/admin/AbsensiManage"));
const LaporanManage = lazy(() => import("./pages/admin/LaporanManage"));
const Inbox = lazy(() => import("./pages/admin/Inbox"));

// Soldier pages (Lazy loaded)
const SoldierDashboard = lazy(() => import("./pages/soldier/Dashboard"));
const SoldierChangePassword = lazy(() => import("./pages/soldier/ChangePassword"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/tentang-kami" element={<About />} />
          <Route path="/struktur-organisasi" element={<OrgStructure />} />
          <Route path="/produk" element={<Products />} />
          <Route path="/produk/:id" element={<ProductDetail />} />
          <Route path="/galeri" element={<Gallery />} />
          <Route path="/berita" element={<News />} />
          <Route path="/berita/:id" element={<NewsDetail />} />
          <Route path="/kontak" element={<Contact />} />
        </Route>

        {/* Auth / Login */}
        <Route path="/portal-dukteksi/login" element={<Login />} />
        <Route
          path="/admin-portal/login"
          element={<Navigate to="/portal-dukteksi/login" replace />}
        />
        <Route
          path="/admin-portal"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="berita" element={<NewsManage />} />
          <Route path="produk" element={<ProductManage />} />
          <Route path="galeri" element={<GalleryManage />} />
          <Route path="struktur-organisasi" element={<OrgStructureManage />} />
          <Route path="anggota" element={<SoldierManage />} />
          <Route path="jadwal-piket" element={<JadwalPiketManage />} />
          <Route path="program-kerja" element={<ProgramKerjaManage />} />
          <Route path="rekap-presensi" element={<AbsensiManage />} />
          <Route path="laporan-harian" element={<LaporanManage />} />
          <Route path="kotak-masuk" element={<Inbox />} />
        </Route>

        {/* Soldier / Prajurit */}
        <Route
          path="/soldier"
          element={
            <ProtectedRoute allowedRoles={["soldier"]}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SoldierDashboard />} />
          <Route path="ganti-password" element={<SoldierChangePassword />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="p-20 text-center text-inktext/50">
              404 - Halaman tidak ditemukan
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
