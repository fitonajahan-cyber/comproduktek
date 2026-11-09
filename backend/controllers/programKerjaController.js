const fs = require("fs");
const path = require("path");
const { ProgramKerja, OrgStructure, Soldier } = require("../models");
const { Op } = require("sequelize");
const computeProkerStatus = require("../utils/computeProkerStatus");
const { deleteDocumentFromDisk } = require("../utils/fileHelper");

const onlyActiveSoldierIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(Number))];
  if (uniqueIds.length === 0) return [];
  const soldiers = await Soldier.findAll({
    where: { id: { [Op.in]: uniqueIds }, status: "aktif" },
    attributes: ["id"],
  });
  return soldiers.map((soldier) => soldier.id);
};

exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = "", status = "", sortBy, sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    // Search filter
    if (q) {
      where[Op.or] = [
        { program: { [Op.iLike]: `%${q}%` } },
        { keterangan: { [Op.iLike]: `%${q}%` } },
      ];
    }
    
    let order = [["created_at", "DESC"]];
    const allowedSortFields = Object.keys(ProgramKerja.rawAttributes || {});
    const safeSortOrder = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';
    if (sortBy && allowedSortFields.includes(sortBy)) {
        order = [[sortBy, safeSortOrder]];
    }

    const { rows, count } = await ProgramKerja.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: order,
      include: [
        {
          model: OrgStructure,
          as: "pic",
          attributes: ["id", "name", "position", "rank"],
        },
        {
          model: Soldier,
          as: "picSoldier",
          attributes: ["id", "username", "full_name", "pangkat", "status"],
          where: { status: "aktif" },
          required: false,
        },
        {
          model: Soldier,
          as: "tim",
          attributes: ["id", "username", "full_name", "pangkat", "status"],
          where: { status: "aktif" },
          required: false,
          through: { attributes: [] },
        },
      ],
    });

    // Compute status
    let data = rows.map((row) => {
      const plain = row.get({ plain: true });
      plain.status = computeProkerStatus(plain.is_selesai, plain.deadline);
      return plain;
    });

    // Filter by computed status if requested
    if (status) {
      data = data.filter((item) => item.status === status);
      // Note: This makes count and pagination slightly inaccurate if filtered by status,
      // but for simplicity we filter after query. To fix it properly we'd need complex queries.
    }

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in ProgramKerja index:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.show = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };

    const item = await ProgramKerja.findOne({
      where,
      include: [
        {
          model: OrgStructure,
          as: "pic",
          attributes: ["id", "name", "position", "rank"],
        },
        {
          model: Soldier,
          as: "picSoldier",
          attributes: ["id", "username", "full_name", "pangkat", "status"],
          where: { status: "aktif" },
          required: false,
        },
        {
          model: Soldier,
          as: "tim",
          attributes: ["id", "username", "full_name", "pangkat", "status"],
          where: { status: "aktif" },
          required: false,
          through: { attributes: [] },
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    const plain = item.get({ plain: true });
    plain.status = computeProkerStatus(plain.is_selesai, plain.deadline);

    res.json({ data: plain });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Hanya nama file dari multer yang boleh menentukan dokumen; abaikan input body.
    delete payload.file_perencanaan;
    delete payload.file_hasil;
    delete payload.id;
    payload.admin_id = req.user.id;

    payload.is_selesai = payload.is_selesai === "true" || payload.is_selesai === true;

    if (!payload.pic_org_structure_id) {
      payload.pic_org_structure_id = null;
    }
    if (!payload.pic_soldier_id) {
      payload.pic_soldier_id = null;
    }

    // Pastikan jika kosong, mutlak jadi null, BUKAN string kosong
    if (!payload.tanggal_selesai) payload.tanggal_selesai = null;
    if (!payload.alasan_keterlambatan) payload.alasan_keterlambatan = null;

    // tim_ids dikirim sebagai JSON string dari frontend (multipart/form-data)
    let timIds = [];
    try {
      timIds = JSON.parse(req.body.tim_ids || "[]");
    } catch (e) {
      timIds = [];
    }
    delete payload.tim_ids;

    if (payload.pic_soldier_id) {
      const activePicIds = await onlyActiveSoldierIds([payload.pic_soldier_id]);
      if (activePicIds.length === 0) {
        return res.status(400).json({ message: "PIC harus anggota aktif." });
      }
    }
    timIds = await onlyActiveSoldierIds(timIds);

    // Dokumen perencanaan (disimpan sebagai NAMA FILE di folder private)
    if (req.files && req.files.file_perencanaan && req.files.file_perencanaan[0]) {
      payload.file_perencanaan = req.files.file_perencanaan[0].filename;
    }

    const newItem = await ProgramKerja.create(payload);

    // Assign anggota tim (method otomatis dari belongsToMany Sequelize)
    if (Array.isArray(timIds) && timIds.length > 0) {
      await newItem.setTim(timIds);
    }

    res.status(201).json({ message: "Data berhasil dibuat.", data: newItem });
  } catch (error) {
    console.error("Error saat create proker:", error);
    res.status(500).json({
      message: "Gagal membuat data.",
      error: 'Gagal membuat data.',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    const payload = { ...req.body };
    // Abaikan field dokumen dari body; hanya multer yang boleh mengisinya.
    delete payload.file_perencanaan;
    delete payload.file_hasil;
    delete payload.admin_id;
    delete payload.id;
    // Jika tidak dikirim, JANGAN ubah tim yang sudah ada.
    let timIds;
    if (req.body.tim_ids !== undefined) {
      try {
        timIds = JSON.parse(req.body.tim_ids || "[]");
      } catch (e) {
        timIds = [];
      }
    }
    delete payload.tim_ids;

    if (payload.pic_soldier_id) {
      const activePicIds = await onlyActiveSoldierIds([payload.pic_soldier_id]);
      if (activePicIds.length === 0) {
        return res.status(400).json({ message: "PIC harus anggota aktif." });
      }
    }
    if (timIds !== undefined) {
      timIds = await onlyActiveSoldierIds(timIds);
    }

    // Dokumen perencanaan baru: hapus file lama dari disk dulu, baru simpan nama baru
    if (req.files && req.files.file_perencanaan && req.files.file_perencanaan[0]) {
      if (item.file_perencanaan) {
        deleteDocumentFromDisk(item.file_perencanaan);
      }
      payload.file_perencanaan = req.files.file_perencanaan[0].filename;
    }

    // Convert is_selesai to boolean
    payload.is_selesai = payload.is_selesai === "true" || payload.is_selesai === true;

    if (!payload.pic_org_structure_id) {
      payload.pic_org_structure_id = null;
    }
    if (!payload.pic_soldier_id) {
      payload.pic_soldier_id = null;
    }

    // Trik Mencegah Error DB: Ubah string kosong menjadi NULL
    if (payload.tanggal_selesai !== undefined) {
      if (
        payload.tanggal_selesai === null ||
        payload.tanggal_selesai.trim() === ""
      ) {
        payload.tanggal_selesai = null;
      }
    }

    // Auto-fill tanggal selesai jika dichecklist "is_selesai" tapi lupa isi tanggal
    if (payload.is_selesai && !payload.tanggal_selesai) {
      const today = new Date();
      payload.tanggal_selesai = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    // Validate alasan_keterlambatan
    const isSelesaiVal =
      payload.is_selesai !== undefined ? payload.is_selesai : item.is_selesai;
    const deadlineVal =
      payload.deadline !== undefined ? payload.deadline : item.deadline;

    const computedStatus = computeProkerStatus(isSelesaiVal, deadlineVal);

    if (
      computedStatus === "merah" &&
      (!payload.alasan_keterlambatan ||
        payload.alasan_keterlambatan.trim() === "")
    ) {
      return res.status(400).json({
        message:
          "Alasan keterlambatan wajib diisi karena status proker Terlambat (MERAH).",
      });
    }

    await item.update(payload);

    if (timIds !== undefined && Array.isArray(timIds)) {
      await item.setTim(timIds);
    }

    res.json({ message: "Data berhasil diperbarui.", data: item });
  } catch (error) {
    console.error("Error updating program kerja:", error);
    res.status(500).json({ message: "Gagal memperbarui data." });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    // Hapus dokumen terkait dari disk sebelum data dihapus
    if (item.file_perencanaan) deleteDocumentFromDisk(item.file_perencanaan);
    if (item.file_hasil) deleteDocumentFromDisk(item.file_hasil);

    await item.destroy();
    res.json({ message: "Data berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus data." });
  }
};

exports.soldierUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const soldier = await Soldier.findByPk(req.user.id);

    // Fetch by id dulu, LALU cek otorisasi manual:
    // PIC (org structure match) ATAU anggota tim proker
    const item = await ProgramKerja.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({
          message: "Program kerja tidak ditemukan.",
        });
    }

    const isPic = item.pic_org_structure_id === soldier.org_structure_id;
    const isTimMember = await item.hasTim(req.user.id);

    if (!isPic && !isTimMember) {
      return res
        .status(403)
        .json({
          message:
            "Anda bukan penanggung jawab atau anggota tim proker ini.",
        });
    }

    const { is_selesai, tanggal_selesai } = req.body;

    item.is_selesai = is_selesai !== undefined ? is_selesai : item.is_selesai;

    if (item.is_selesai && !tanggal_selesai) {
      item.tanggal_selesai = new Date().toISOString().split("T")[0];
    } else {
      item.tanggal_selesai = tanggal_selesai || null;
    }

    await item.save();
    res.json({
      message: "Status program kerja berhasil diperbarui.",
      data: item,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui status." });
  }
};

// DELETE /:id/file-perencanaan (admin only) — hapus dokumen perencanaan
exports.removeFilePerencanaan = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    if (!item.file_perencanaan) {
      return res
        .status(404)
        .json({ message: "Dokumen perencanaan belum diunggah." });
    }

    deleteDocumentFromDisk(item.file_perencanaan);
    item.file_perencanaan = null;
    await item.save();

    res.json({
      message: "Dokumen perencanaan berhasil dihapus.",
      data: item,
    });
  } catch (error) {
    console.error("Error removeFilePerencanaan:", error);
    res.status(500).json({ message: "Gagal menghapus dokumen perencanaan." });
  }
};

// DELETE /:id/file-hasil — admin atau soldier (PJ/tim) bisa menghapus dokumen hasil
exports.removeFileHasil = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Program kerja tidak ditemukan." });

    if (!(await canAccessDocuments(item, req))) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses untuk menghapus dokumen ini." });
    }

    if (!item.file_hasil) {
      return res.status(404).json({ message: "Dokumen hasil belum diunggah." });
    }

    deleteDocumentFromDisk(item.file_hasil);
    item.file_hasil = null;
    await item.save();

    res.json({
      message: "Dokumen hasil berhasil dihapus.",
      data: item,
    });
  } catch (error) {
    console.error("Error removeFileHasil:", error);
    res.status(500).json({ message: "Gagal menghapus dokumen hasil." });
  }
};

// PUT /:id/hasil (soldier: PJ atau anggota tim) — upload dokumen hasil
exports.uploadHasil = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Program kerja tidak ditemukan." });

    const soldier = await Soldier.findByPk(req.user.id);
    const isPic = soldier && item.pic_org_structure_id === soldier.org_structure_id;
    const isTimMember = await item.hasTim(req.user.id);

    if (!isPic && !isTimMember) {
      // Multer sudah menyimpan file ke disk sebelum cek otorisasi —
      // hapus supaya tidak menumpuk file yatim dari user tanpa hak akses
      if (req.file) fs.unlink(req.file.path, () => {});
      return res
        .status(403)
        .json({
          message: "Anda bukan penanggung jawab atau anggota tim proker ini.",
        });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File dokumen hasil wajib diunggah." });
    }

    // Timpa file lama jika ada
    if (item.file_hasil) {
      deleteDocumentFromDisk(item.file_hasil);
    }

    item.file_hasil = file.filename;
    await item.save();

    res.json({
      message: "Dokumen hasil berhasil diunggah.",
      data: item,
    });
  } catch (error) {
    console.error("Error uploadHasil:", error);
    res.status(500).json({ message: "Gagal mengunggah dokumen hasil." });
  }
};

// Helper: cek apakah user (admin/soldier) berhak mengakses dokumen proker
async function canAccessDocuments(item, req) {
  if (req.user.role === "admin") return true;
  const soldier = await Soldier.findByPk(req.user.id);
  if (!soldier) return false;
  const isPic = item.pic_org_structure_id === soldier.org_structure_id;
  const isTimMember = await item.hasTim(req.user.id);
  return isPic || isTimMember;
}

// Helper: get MIME type based on extension
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// GET /:id/download/perencanaan — admin selalu boleh; soldier hanya PIC/tim
exports.downloadPerencanaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.query; // 'preview' | undefined
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Program kerja tidak ditemukan." });

    if (!(await canAccessDocuments(item, req))) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses ke dokumen ini." });
    }

    if (!item.file_perencanaan) {
      return res.status(404).json({ message: "Dokumen belum diunggah." });
    }

    const baseDir = path.resolve(__dirname, '..', 'private-uploads', 'proker-documents');
    const safeName = path.basename(item.file_perencanaan);
    const filePath = path.resolve(baseDir, safeName);
    if (!filePath.startsWith(baseDir + path.sep)) {
      return res.status(400).json({ message: 'Nama file tidak valid.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File fisik tidak ditemukan pada server." });
    }

    if (mode === "preview") {
      res.setHeader("Content-Type", getMimeType(item.file_perencanaan));
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(item.file_perencanaan)}"`
      );
      return res.sendFile(filePath);
    }

    res.download(filePath, item.file_perencanaan);
  } catch (error) {
    console.error("Error downloadPerencanaan:", error);
    res.status(500).json({ message: "Gagal mengunduh dokumen." });
  }
};

// GET /:id/download/hasil — admin selalu boleh; soldier hanya PIC/tim
exports.downloadHasil = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.query; // 'preview' | undefined
    const item = await ProgramKerja.findByPk(id);
    if (!item)
      return res.status(404).json({ message: "Program kerja tidak ditemukan." });

    if (!(await canAccessDocuments(item, req))) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses ke dokumen ini." });
    }

    if (!item.file_hasil) {
      return res.status(404).json({ message: "Dokumen belum diunggah." });
    }

    const baseDir = path.resolve(__dirname, '..', 'private-uploads', 'proker-documents');
    const safeName = path.basename(item.file_hasil);
    const filePath = path.resolve(baseDir, safeName);
    if (!filePath.startsWith(baseDir + path.sep)) {
      return res.status(400).json({ message: 'Nama file tidak valid.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File fisik tidak ditemukan pada server." });
    }

    if (mode === "preview") {
      res.setHeader("Content-Type", getMimeType(item.file_hasil));
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(item.file_hasil)}"`
      );
      return res.sendFile(filePath);
    }

    res.download(filePath, item.file_hasil);
  } catch (error) {
    console.error("Error downloadHasil:", error);
    res.status(500).json({ message: "Gagal mengunduh dokumen." });
  }
};
