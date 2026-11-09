/**
 * useReadTime.js
 * Utility untuk mengestimasi waktu baca sebuah artikel.
 * Dipindah ke sini karena fungsi ini terduplikasi di News.jsx dan NewsDetail.jsx.
 *
 * @param {string|null|undefined} content - Konten teks artikel.
 * @param {string} [fallback='2 min read'] - Nilai default jika content kosong.
 * @returns {string} Estimasi waktu baca, misal "3 min read".
 *
 * @example
 * import { getReadTime } from '../../hooks/useReadTime';
 * const readTime = getReadTime(article.content);
 */
export function getReadTime(content, fallback = '2 min read') {
  if (!content) return fallback;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 150);
  return `${minutes || 2} min read`;
}
