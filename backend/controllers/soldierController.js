const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Soldier, OrgStructure } = require("../models");
const { isEligibleRank } = require("../utils/getEligibleSoldiers");

// === UNTUK SOLDIER (USER BIASA) ===

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, password, oldPassword } = req.body;

    const soldier = await Soldier.findByPk(userId);
    if (!soldier) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (username && username !== soldier.username) {
      const existing = await Soldier.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      soldier.username = username;
    }

    if (full_name) {
      soldier.full_name = full_name;
    }

    // Tangani upload foto jika ada file yang dikirim
    if (req.files && req.files.length > 0) {
      const photoFile = req.files.find((f) => f.fieldname === "photo");
      if (photoFile) {
        // SIMPAN NAMA FILENYA SAJA
        soldier.photo = photoFile.filename;
      }
    } else if (req.file) {
      // SIMPAN NAMA FILENYA SAJA
      soldier.photo = req.file.filename;
    }

    if (password) {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ message: "Password baru minimal 8 karakter." });
      }
      // Jika wajib ganti password (akun baru/reset), oldPassword tidak diperlukan.
      if (!soldier.must_change_password) {
        if (!oldPassword) {
          return res.status(400).json({ message: "Password lama wajib diisi." });
        }
        const valid = await bcrypt.compare(oldPassword, soldier.password);
        if (!valid) {
          return res.status(401).json({ message: "Password lama salah." });
        }
      }
      soldier.password = await bcrypt.hash(password, 10);
      soldier.must_change_password = false;
    }

    await soldier.save();
    res.json({ message: "Profil berhasil diperbarui", data: soldier });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server" });
  }
};

// === UNTUK ADMIN ===

// Mendapatkan semua anggota (Soldier) beserta jabatannya
exports.getAllSoldiers = async (req, res) => {
  try {
    const { eligible, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const soldiers = await Soldier.findAll({
      where,
      include: [
        {
          model: OrgStructure,
          attributes: ["position", "rank", "display_order"],
        },
      ],
      attributes: { exclude: ["password"] },
    });
    const data =
      eligible === "piket"
        ? soldiers.filter(
            (soldier) =>
              soldier.status === "aktif" &&
              isEligibleRank(soldier.pangkat),
          )
        : soldiers;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server" });
  }
};

// Mendapatkan detail satu anggota
exports.getSoldierById = async (req, res) => {
  try {
    const soldier = await Soldier.findByPk(req.params.id, {
      include: [{ model: OrgStructure, attributes: ["position", "rank"] }],
      attributes: { exclude: ["password"] },
    });
    if (!soldier)
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    res.json(soldier);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server" });
  }
};

// Update data anggota oleh admin (reset password atau ganti username)
exports.updateSoldier = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, pangkat, password, status } = req.body;

    const soldier = await Soldier.findByPk(id);
    if (!soldier) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }

    if (username) {
      // Cek apakah username sudah dipakai orang lain
      const existing = await Soldier.findOne({ where: { username } });
      if (existing && existing.id !== soldier.id) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      soldier.username = username;
    }
    if (full_name) {
      soldier.full_name = full_name;
    }
    if (pangkat !== undefined) {
      soldier.pangkat = pangkat || null;
    }
    if (password) {
      soldier.password = await bcrypt.hash(password, 10);
    }
    if (status) {
      if (!["aktif", "nonaktif"].includes(status)) {
        return res.status(400).json({ message: "Status anggota tidak valid" });
      }
      soldier.status = status;
    }

    await soldier.save();
    res.json({ message: "Data anggota berhasil diperbarui" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server" });
  }
};


// Reset password anggota oleh admin -> generate password acak sementara
exports.resetSoldierPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const soldier = await Soldier.findByPk(id);
    if (!soldier) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    soldier.password = await bcrypt.hash(temporaryPassword, 10);
    soldier.must_change_password = true;
    await soldier.save();
    res.json({
      message: "Password anggota berhasil direset. Serahkan password sementara ke anggota; ia wajib menggantinya saat login.",
      temporary_password: temporaryPassword,
    });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
