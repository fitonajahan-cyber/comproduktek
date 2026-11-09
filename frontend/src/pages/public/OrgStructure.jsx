import { useEffect, useState } from 'react';
import RevealSection from '../../components/common/RevealSection';
import OrgTreeDesktop from '../../components/public/OrgTreeDesktop';
import OrgListMobile from '../../components/public/OrgListMobile';
import MemberDetailModal from '../../components/public/MemberDetailModal';
import { buildTree } from '../../components/public/orgTreeUtils';
import api from '../../services/api';

export default function OrgStructure() {
  const [roots, setRoots] = useState(null); // null = masih memuat
  const [error, setError] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    api
      .get('/org-structures', { params: { limit: 200 } })
      .then((r) => setRoots(buildTree(r.data.data)))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
        <RevealSection className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-navy dark:text-gray-200 uppercase bg-gray-50 dark:bg-[#16273D] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 inline-block mb-3">
            KEPEMIMPINAN & UNIT
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">Struktur Organisasi</h1>
          <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base mt-3">
            Bagan hierarki kepemimpinan dan unit di lingkungan Satlak Dukteksi.
          </p>
        </RevealSection>

        {roots === null && !error && (
          <p role="status" className="text-center text-inktext/50">Memuat struktur organisasi...</p>
        )}

        {error && (
          <p role="alert" className="text-center text-inktext/50">Gagal memuat data struktur organisasi.</p>
        )}

        {roots?.length === 0 && (
          <p role="status" className="text-center text-inktext/50">Struktur organisasi belum tersedia.</p>
        )}

        {roots?.length > 0 && (
          <RevealSection>
            {/* Desktop: bagan pohon dengan garis penghubung otomatis (geser jika lebar) */}
            <div className="hidden md:block bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-3xl shadow-sm p-8">
              <OrgTreeDesktop roots={roots} onSelect={setSelectedMember} />
            </div>

            {/* Mobile: list bertingkat, bisa dilipat/dibuka per cabang */}
            <div className="md:hidden max-w-lg mx-auto bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-3xl shadow-sm p-4">
              <OrgListMobile roots={roots} onSelect={setSelectedMember} />
            </div>
          </RevealSection>
        )}
      </div>

      <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}