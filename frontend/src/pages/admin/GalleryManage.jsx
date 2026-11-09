import { useState, useEffect, useMemo } from 'react';
import CrudManager from '../../components/admin/CrudManager';
import { formatDate } from '../../lib/dateUtils';
import api from '../../services/api';

const columns = [
  {
    key: 'image',
    label: 'Foto',
    render: (item) => (
      item.image ? (
        <img src={item.image} alt="Foto Galeri" className="h-10 w-16 object-cover rounded" />
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      )
    ),
  },
  { key: 'description', label: 'Deskripsi' },
  { key: 'gallery_date', label: 'Tanggal', render: (item) => formatDate(item.gallery_date) },
];

const fields = [
  { name: 'description', label: 'Deskripsi', type: 'text', required: true },
  { name: 'gallery_date', label: 'Tanggal Kegiatan', type: 'date', required: true },
  { name: 'image', label: 'Upload Foto', type: 'file' },
];

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'deskripsi_asc', label: 'Deskripsi (A - Z)', sortKey: 'description' },
  { value: 'deskripsi_desc', label: 'Deskripsi (Z - A)', sortKey: 'description' },
  { value: 'tanggal_asc', label: 'Tanggal Terlama', sortKey: 'gallery_date' },
  { value: 'tanggal_desc', label: 'Tanggal Terbaru', sortKey: 'gallery_date' },
];

export default function GalleryManage() {
  const [allGalleries, setAllGalleries] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAllGalleries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/galleries', { params: { limit: 1000 } });
      setAllGalleries(res.data.data || []);
    } catch (error) {
      console.error('Error loading galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGalleries();
  }, []);

  const metrics = useMemo(() => {
    if (!allGalleries || allGalleries.length === 0) return null;
    
    const thisMonth = allGalleries.filter(item => {
      const galDate = new Date(item.gallery_date);
      const current = new Date();
      return galDate.getMonth() === current.getMonth() && 
             galDate.getFullYear() === current.getFullYear();
    }).length;

    const latestGal = allGalleries.sort((a, b) => 
      new Date(b.gallery_date) - new Date(a.gallery_date)
    )[0];

    return {
      total: allGalleries.length,
      thisMonth,
      latestDate: latestGal ? formatDate(latestGal.gallery_date) : '-'
    };
  }, [allGalleries]);

  const infoCards = [
    { label: 'Total Foto', value: metrics?.total || 0, loading },
    { label: 'Foto Bulan Ini', value: metrics?.thisMonth || 0, loading },
    { label: 'Upload Terakhir', value: metrics?.latestDate || '-', loading, subtitle: 'Tanggal' },
    { label: 'Rata-rata/Bulan', value: metrics?.total ? Math.round(metrics.total / 12) : 0, loading, subtitle: 'Estimasi' },
  ];

  const handleCrudComplete = () => {
    loadAllGalleries();
  };

  return (
    <CrudManager
      title="Galeri"
      subtitle="Kelola foto kegiatan untuk galeri website."
      endpoint="/galleries"
      columns={columns}
      fields={fields}
      sortOptions={sortOptions}
      infoCards={infoCards}
      onDataChange={handleCrudComplete}
    />
  );
}