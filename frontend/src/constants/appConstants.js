/**
 * appConstants.js
 * Satu sumber kebenaran untuk semua konstanta yang dipakai di banyak tempat.
 * Hindari mendefinisikan ulang nilai-nilai ini di file lain.
 */

/**
 * Node-node yang bersifat "placeholder" dalam struktur organisasi.
 * Dipakai untuk memfilter tampilan di berbagai halaman admin.
 * @type {string[]}
 */
export const HIDDEN_NODES = ['_TRUNK_', '_EMPTY_', 'JABATAN KOSONG', ''];

/**
 * Mengecek apakah sebuah jabatan termasuk dalam node sistem (spacer/trunk)
 * yang harus disembunyikan dari daftar anggota dan pilihan PIC.
 * @param {string} position
 * @returns {boolean}
 */
export function isHiddenNode(position) {
  if (!position) return true;
  const p = position.toUpperCase().trim();
  if (HIDDEN_NODES.includes(p)) return true;
  if (p.includes('SPACER') || p.includes('TRUNK') || p.includes('EMPTY') || p === 'JABATAN KOSONG') {
    return true;
  }
  return false;
}

/**
 * Jumlah item per halaman default untuk fitur pagination.
 * @type {number}
 */
export const DEFAULT_PAGE_SIZE = 10;
