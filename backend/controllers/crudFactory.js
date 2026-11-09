/**
 * Factory untuk membuat controller CRUD standar (index, show, create, update, remove)
 * dipakai oleh News, Product, Gallery. Mengurangi duplikasi kode antar modul.
 */
const fs = require("fs");
const path = require("path"); // TAMBAHAN: Untuk ngatur path direktori dengan aman
const { Op } = require("sequelize");

// Field yang tidak boleh diisi langsung dari body request (dikelola oleh sistem/server).
const PROTECTED_FIELDS = [
  "id",
  "admin_id",
  "created_at",
  "updated_at",
  "createdAt",
  "updatedAt",
];

function sanitizePayload(body) {
  const payload = { ...body };
  PROTECTED_FIELDS.forEach((f) => delete payload[f]);
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "") delete payload[k];
  });
  return payload;
}

function findUploadedFile(req, fieldName) {
  if (req.file && req.file.fieldname === fieldName) return req.file;
  if (Array.isArray(req.files))
    return req.files.find((f) => f.fieldname === fieldName);
  return null;
}

function validateUploadedFields(req, allowedFieldName) {
  if (!Array.isArray(req.files) || req.files.length === 0) return null;

  const unexpected = req.files.filter((f) => f.fieldname !== allowedFieldName);
  if (unexpected.length === 0) return null;

  const names = [...new Set(unexpected.map((f) => f.fieldname))].join(", ");
  return allowedFieldName
    ? `Field file "${names}" tidak dikenali. Field file yang diterima untuk data ini hanya "${allowedFieldName}".`
    : `Data ini tidak menerima upload file, tetapi menerima field file "${names}".`;
}

function cleanupUploadedFiles(req) {
  if (!Array.isArray(req.files)) return;
  req.files.forEach((f) => {
    fs.unlink(f.path, () => {});
  });
}

// TAMBAHAN: Helper pintar buat ngehapus file lama dari Hardisk / Folder uploads
function deleteFileFromDisk(fileUrl) {
  if (!fileUrl) return;
  // Ambil nama file dari URL (contoh: /uploads/1785...jpg -> 1785...jpg)
  const filename = fileUrl.split("/").pop();

  // Asumsi file factory lu ada di folder /controllers, jadi kita naik 1 tingkat (..) ke root lalu masuk ke /uploads
  const filePath = path.join(__dirname, "../uploads", filename);

  // Cek apakah file fisik beneran ada, kalau ada baru dihapus
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Gagal menghapus file lama:", err);
    });
  }
}

function crudFactory(Model, options = {}) {
  const {
    searchFields = [],
    defaultOrder = [["created_at", "DESC"]],
    attachAdmin = false,
  } = options;

  return {
    async index(req, res) {
      try {

        const { q, page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = req.query;
        const where = {};

        if (q && searchFields.length) {
          where[Op.or] = searchFields.map((f) => ({
            [f]: { [Op.like]: `%${q}%` },
          }));
        }

        let order = defaultOrder;
        const modelAttributes = Object.keys(Model.rawAttributes || {});
        const safeOrderDirection = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        if (sortBy && modelAttributes.includes(sortBy)) {
          order = [[sortBy, safeOrderDirection]];
        }

        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = await Model.findAndCountAll({
          where,
          order: order,
          limit: Number(limit),
          offset,
        });

        res.json({
          data: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit),
          },
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Gagal mengambil data." });
      }
    },

    async show(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item)
          return res.status(404).json({ message: "Data tidak ditemukan." });
        res.json({ data: item });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Gagal mengambil data." });
      }
    },

    async create(req, res) {
      try {
        const fileFieldName = options.fileField || null;
        const validationError = validateUploadedFields(req, fileFieldName);
        if (validationError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ message: validationError });
        }

        const payload = sanitizePayload(req.body);
        if (attachAdmin && req.admin) payload.admin_id = req.admin.id;
        const file = findUploadedFile(req, fileFieldName || "image");
        if (file)
          payload[fileFieldName || "image"] = `/uploads/${file.filename}`;

        const item = await Model.create(payload);
        res
          .status(201)
          .json({ message: "Data berhasil ditambahkan.", data: item });
      } catch (err) {
        res
          .status(400)
          .json({ message: "Gagal menambahkan data." });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item)
          return res.status(404).json({ message: "Data tidak ditemukan." });

        const fileFieldName = options.fileField || null;
        const validationError = validateUploadedFields(req, fileFieldName);
        if (validationError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ message: validationError });
        }

        const payload = sanitizePayload(req.body);
        const file = findUploadedFile(req, fileFieldName || "image");

        // TAMBAHAN: Kalau user upload foto baru, hapus foto yang lama!
        if (file) {
          payload[fileFieldName || "image"] = `/uploads/${file.filename}`;

          // Ambil path foto lama dari database dan hapus
          const oldFileUrl = item[fileFieldName || "image"];
          deleteFileFromDisk(oldFileUrl);
        }

        await item.update(payload);
        res.json({ message: "Data berhasil diperbarui.", data: item });
      } catch (err) {
        res
          .status(400)
          .json({ message: "Gagal memperbarui data." });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item)
          return res.status(404).json({ message: "Data tidak ditemukan." });

        // TAMBAHAN: Ambil path file sebelum datanya dihapus dari database
        const fileFieldName = options.fileField || "image";
        const oldFileUrl = item[fileFieldName];

        await item.destroy();

        // TAMBAHAN: Eksekusi hapus file fisik setelah data di database sukses dihapus
        deleteFileFromDisk(oldFileUrl);

        res.json({ message: "Data berhasil dihapus." });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Gagal menghapus data." });
      }
    },

    // (Fungsi update & remove yang duplikat di bawah sudah gua buang biar bersih)
  };
}

module.exports = crudFactory;
