/**
 * Menghitung status Program Kerja (hijau, merah, biru)
 * berdasarkan nilai is_selesai, deadline, dan waktu saat ini (real-time).
 *
 * Aturan:
 * - HIJAU ("Beres") : jika is_selesai === true.
 * - MERAH ("Terlambat") : jika is_selesai === false DAN sekarang > deadline.
 * - BIRU ("Dalam Pengerjaan") : jika is_selesai === false DAN sekarang <= deadline.
 *
 * @param {boolean} is_selesai
 * @param {string|Date} deadline (format YYYY-MM-DD atau Date object)
 * @returns {'hijau' | 'merah' | 'biru'}
 */
function computeProkerStatus(is_selesai, deadline) {
  if (is_selesai) {
    return 'hijau';
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // normalize today to midnight
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0); // normalize deadline to midnight

  if (now > deadlineDate) {
    return 'merah';
  }

  return 'biru';
}

module.exports = computeProkerStatus;
