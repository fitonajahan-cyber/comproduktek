/**
 * Utilitas pemformatan tanggal terpusat untuk seluruh aplikasi.
 * Memastikan semua tampilan tanggal konsisten dalam format dd-mm-yyyy.
 */

/**
 * Mengubah string tanggal dari database (YYYY-MM-DD atau ISO string)
 * menjadi format dd-mm-yyyy yang mudah dibaca.
 *
 * @param {string|null|undefined} dateStr - Tanggal dari database
 * @param {string} fallback - Teks fallback jika tanggal null/kosong
 * @returns {string} Tanggal terformat (contoh: "20-08-2026") atau fallback
 */
export function formatDate(dateStr, fallback = '-') {
  if (!dateStr) return fallback;
  try {
    // Untuk DATEONLY dari Sequelize (format "YYYY-MM-DD"), parse secara lokal
    // agar tidak ada pergeseran timezone (UTC vs lokal).
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }

    // Untuk timestamp lengkap (ISO 8601), konversi via Date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return fallback;
  }
}

/**
 * Mengubah timestamp menjadi format tanggal dan waktu lokal Indonesia.
 * Contoh: "20-08-2026, 14:30"
 *
 * @param {string|null|undefined} dateStr - Timestamp dari database
 * @param {string} fallback - Teks fallback jika tanggal null/kosong
 * @returns {string} Tanggal dan waktu terformat
 */
export function formatDateTime(dateStr, fallback = '-') {
  if (!dateStr) return fallback;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  } catch {
    return fallback;
  }
}
