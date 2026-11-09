import { useEffect } from "react";

/**
 * Custom hook untuk memperbarui meta title, description, dan Open Graph secara dinamis (On-Page SEO).
 * @param {string} title - Judul halaman yang ditampilkan di tab browser & search snippet
 * @param {string} description - Ringkasan konten halaman (maksimal ~160 karakter)
 * @param {string} image - URL gambar thumbnail untuk Open Graph / Twitter Card (opsional)
 */
export function useSEO({ title, description, image } = {}) {
  useEffect(() => {
    const defaultTitle = "Satlak Dukteksi Pussiberad TNI AD | Website Resmi";
    const defaultDesc =
      "Website resmi Satuan Pelaksana Dukungan Teknologi Siber (Satlak Dukteksi Pussiberad) TNI Angkatan Darat. Informasi profil, berita, dan layanan terkini.";

    // 1. Update Title
    if (title) {
      document.title = `${title} | Satlak Dukteksi Pussiberad`;
    } else {
      document.title = defaultTitle;
    }

    // 2. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description || defaultDesc);
    }

    // 3. Update Open Graph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title ? `${title} | Satlak Dukteksi Pussiberad` : defaultTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description || defaultDesc);
    }

    // 4. Update Open Graph Image jika tersedia
    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute("content", image);
      }
    }

    // Cleanup saat komponen unmount
    return () => {
      document.title = defaultTitle;
      if (metaDesc) metaDesc.setAttribute("content", defaultDesc);
      if (ogTitle) ogTitle.setAttribute("content", defaultTitle);
      if (ogDesc) ogDesc.setAttribute("content", defaultDesc);
    };
  }, [title, description, image]);
}
