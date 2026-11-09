const fs = require('fs');
const path = require('path');

/**
 * Hapus dokumen proker dari folder private-uploads/proker-documents/
 * berdasarkan NAMA FILE saja (bukan URL publik).
 * Beda dengan deleteFileFromDisk di crudFactory.js yang untuk folder /uploads publik.
 */
function deleteDocumentFromDisk(filename) {
  if (!filename) return;
  // Ambil nama file murni bila ternyata diberikan sebagai path/URL
  const cleanName = filename.split(/[\\/]/).pop();
  const filePath = path.join(__dirname, '..', 'private-uploads', 'proker-documents', cleanName);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Gagal menghapus dokumen lama:', err);
    });
  }
}

module.exports = { deleteDocumentFromDisk };
