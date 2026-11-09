const {
  Absensi,
  Soldier,
  Admin,
  OrgStructure,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const moment = require("moment-timezone"); // Using moment-timezone to safely handle dates in local timezone

// Helper to get today's date in local timezone YYYY-MM-DD
const getLocalDateString = (dateStr) => {
  if (dateStr) {
    return moment.tz(dateStr, "Asia/Jakarta").format("YYYY-MM-DD");
  }
  return moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
};

const absensiController = {
  // Get list with Lazy-Generation
  getAbsensiList: async (req, res) => {
    try {
      const { tanggal, soldier_id, sanggahan_status } = req.query;
      const targetDate = getLocalDateString(tanggal);

      // Lazy Generation: If this endpoint is hit, ensure records exist for the given date for all soldiers
      const soldiers = await Soldier.findAll({
        where: { status: "aktif" },
        attributes: ["id"],
      });
      const absensiData = soldiers.map((s) => ({
        soldier_id: s.id,
        tanggal: targetDate,
        status: "belum_diisi",
      }));

      // bulkCreate with ignoreDuplicates (for MySQL/Postgres it will safely skip existing)
      if (absensiData.length > 0) {
        await Absensi.bulkCreate(absensiData, { ignoreDuplicates: true });
      }

      // Prepare filter
      const whereClause = { tanggal: targetDate };

      // If user is a soldier, they can only see their own
      if (req.user && req.user.role === "soldier") {
        whereClause.soldier_id = req.user.id;
      } else if (soldier_id) {
        whereClause.soldier_id = soldier_id;
      }

      if (sanggahan_status) {
        whereClause.sanggahan_status = sanggahan_status;
      }

      const absensiList = await Absensi.findAll({
        where: whereClause,
        include: [
          {
            model: Soldier,
            where: { status: "aktif" },
            attributes: [
              "id",
              "username",
              "full_name",
              "photo",
              "pangkat",
              "status",
              "org_structure_id",
            ],
            include: [
              {
                model: OrgStructure,
                attributes: ["position", "display_order"],
              },
            ],
          },
          {
            model: Admin,
            attributes: ["full_name"],
          },
        ],
        order: [[Soldier, "full_name", "ASC"]],
      });

      res.status(200).json(absensiList);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },

  // Get soldier's own attendance for a full month (lazy-generates 'belum_diisi' for self only)
  getAbsensiMonthly: async (req, res) => {
    try {
      // Endpoint ini khusus soldier (view personal)
      if (!req.user || req.user.role !== "soldier") {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Endpoint ini khusus untuk prajurit." });
      }

      const now = moment.tz("Asia/Jakarta");
      const bulan = parseInt(req.query.bulan, 10) || now.month() + 1;
      const tahun = parseInt(req.query.tahun, 10) || now.year();

      // Validasi masa depan: tidak ada gunanya menampilkan absensi masa depan
      if (
        tahun > now.year() ||
        (tahun === now.year() && bulan > now.month() + 1)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Tidak dapat menampilkan absensi untuk bulan di masa depan.",
          });
      }

      // Awal bulan yang diminta (Asia/Jakarta)
      const startOfMonth = moment.tz(
        `${tahun}-${String(bulan).padStart(2, "0")}-01`,
        "Asia/Jakarta",
      );
      const todayStr = getLocalDateString();

      // Akhir rentang: hari terakhir bulan jika bulan lampau, hari ini jika bulan berjalan
      const isCurrentMonth =
        tahun === now.year() && bulan === now.month() + 1;
      const endStr = isCurrentMonth
        ? todayStr
        : startOfMonth.clone().endOf("month").format("YYYY-MM-DD");
      const startStr = startOfMonth.format("YYYY-MM-DD");

      // Lazy-generation: hanya untuk soldier yang request ini sendiri,
      // dan jangan pernah generate tanggal masa depan
      const absensiData = [];
      let cursor = startOfMonth.clone();
      while (cursor.format("YYYY-MM-DD") <= endStr) {
        absensiData.push({
          soldier_id: req.user.id,
          tanggal: cursor.format("YYYY-MM-DD"),
          status: "belum_diisi",
        });
        cursor.add(1, "days");
      }

      if (absensiData.length > 0) {
        await Absensi.bulkCreate(absensiData, { ignoreDuplicates: true });
      }

      const absensiList = await Absensi.findAll({
        where: {
          soldier_id: req.user.id,
          tanggal: { [Op.between]: [startStr, endStr] },
        },
        attributes: [
          "id",
          "tanggal",
          "status",
          "keterangan",
          "sanggahan_status",
          "status_usulan",
          "keterangan_sanggahan",
        ],
        order: [["tanggal", "ASC"]],
      });

      res.status(200).json(absensiList);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },

  // Admin directly updates an attendance record
  updateAbsensi: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, keterangan } = req.body;

      const absensi = await Absensi.findByPk(id);
      if (!absensi)
        return res
          .status(404)
          .json({ message: "Data absensi tidak ditemukan" });

      absensi.status = status;
      absensi.keterangan = keterangan;
      await absensi.save();

      res
        .status(200)
        .json({ message: "Data absensi berhasil diperbarui", absensi });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },

  // Soldier submits an appeal
  ajukanSanggahan: async (req, res) => {
    try {
      const { id } = req.params;
      const { status_usulan, keterangan_sanggahan } = req.body;

      const absensi = await Absensi.findByPk(id);
      if (!absensi)
        return res
          .status(404)
          .json({ message: "Data absensi tidak ditemukan" });

      const validStatuses = [
        "hadir",
        "sakit",
        "izin",
        "tk",
        "dd",
        "bp",
        "dl",
        "dik",
        "satgas",
      ];

      if (!status_usulan || !validStatuses.includes(status_usulan)) {
        return res.status(400).json({ message: "Status usulan tidak valid." });
      }

      if (!keterangan_sanggahan || typeof keterangan_sanggahan !== "string" || keterangan_sanggahan.trim() === "") {
        return res.status(400).json({ message: "Keterangan sanggahan wajib diisi." });
      }

      // Security check: soldier can only appeal their own record
      if (absensi.soldier_id !== req.user.id) {
        return res
          .status(403)
          .json({
            message:
              "Akses ditolak, Anda hanya dapat menyanggah data Anda sendiri.",
          });
      }

      // Check date: cannot appeal future dates (handled by lazy generation normally, but just in case)
      const today = getLocalDateString();
      if (absensi.tanggal > today) {
        return res
          .status(400)
          .json({
            message:
              "Tidak dapat menyanggah absen untuk tanggal di masa depan.",
          });
      }

      if (absensi.sanggahan_status === "pending") {
        return res
          .status(400)
          .json({
            message:
              "Sanggahan Anda sebelumnya masih menunggu persetujuan Admin.",
          });
      }

      absensi.status_usulan = status_usulan;
      absensi.keterangan_sanggahan = keterangan_sanggahan;
      absensi.sanggahan_status = "pending";
      await absensi.save();

      res.status(200).json({ message: "Sanggahan berhasil diajukan", absensi });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },

  // Admin reviews an appeal
  reviewSanggahan: async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      const absensi = await Absensi.findByPk(id);
      if (!absensi)
        return res
          .status(404)
          .json({ message: "Data absensi tidak ditemukan" });

      if (absensi.sanggahan_status !== "pending") {
        return res
          .status(400)
          .json({ message: "Sanggahan tidak dalam status pending." });
      }

      if (action === "approve") {
        absensi.status = absensi.status_usulan;
        absensi.keterangan = absensi.keterangan_sanggahan;
        absensi.sanggahan_status = "approved";
      } else if (action === "reject") {
        absensi.sanggahan_status = "rejected";
      } else {
        return res.status(400).json({ message: "Action tidak valid" });
      }

      absensi.reviewed_by_admin_id = req.user.id;
      await absensi.save();

      res
        .status(200)
        .json({ message: `Sanggahan berhasil di-${action}`, absensi });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },

  // Get recap stats for a specific soldier
  getAbsensiStats: async (req, res) => {
    try {
      let soldierId;
      if (req.user && req.user.role === "soldier") {
        soldierId = req.user.id;
      } else {
        soldierId = req.params.soldierId;
      }

      if (!soldierId)
        return res.status(400).json({ message: "soldier_id diperlukan" });

      const stats = await Absensi.findAll({
        where: { soldier_id: soldierId },
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("status")), "count"],
        ],
        group: ["status"],
      });

      const formattedStats = {
        hadir: 0,
        sakit: 0,
        izin: 0,
        dd: 0,
        bp: 0,
        dl: 0,
        dik: 0,
        satgas: 0,
        tk: 0,
        belum_diisi: 0,
      };

      stats.forEach((item) => {
        formattedStats[item.status] = parseInt(item.getDataValue("count"), 10);
      });

      res.status(200).json(formattedStats);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
    }
  },
};

module.exports = absensiController;
