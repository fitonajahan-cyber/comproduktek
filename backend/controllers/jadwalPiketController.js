const {
  JadwalPiket,
  Soldier,
  Admin,
  OrgStructure,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { getEligibleSoldiers } = require("../utils/getEligibleSoldiers");

const getDaysInMonth = (bulan, tahun) => new Date(tahun, bulan, 0).getDate();

const getDatesInMonth = (bulan, tahun) => {
  const dates = [];
  for (let i = 1; i <= getDaysInMonth(bulan, tahun); i++) {
    dates.push(new Date(tahun, bulan - 1, i, 12, 0, 0));
  }
  return dates;
};

const soldierInclude = (attributes = ["id", "full_name", "username", "pangkat", "status"]) => ({
  model: Soldier,
  attributes,
  include: [{ model: OrgStructure, attributes: ["position"] }],
});

const getEligibleIds = async () =>
  new Set((await getEligibleSoldiers()).map((soldier) => soldier.id));

const todayDateOnly = () => new Date().toISOString().split("T")[0];

const isBeforeToday = (date) => String(date) < todayDateOnly();

const getLastSoldierFromPreviousMonth = async (bulan, tahun) => {
  const prevBulan = bulan === 1 ? 12 : bulan - 1;
  const prevTahun = bulan === 1 ? tahun - 1 : tahun;
  const lastJadwal = await JadwalPiket.findOne({
    where: { bulan: prevBulan, tahun: prevTahun },
    order: [["tanggal_piket", "DESC"]],
  });
  return lastJadwal ? lastJadwal.soldier_id : null;
};

exports.generate = async (req, res) => {
  try {
    const { bulan, tahun } = req.body;
    if (!bulan || !tahun || bulan < 1 || bulan > 12 || tahun < 2024) {
      return res.status(400).json({ message: "Bulan dan tahun tidak valid." });
    }

    const existingJadwal = await JadwalPiket.findOne({
      where: { bulan, tahun },
    });
    if (existingJadwal) {
      return res
        .status(409)
        .json({
          message:
            "Jadwal piket bulan ini sudah ada. Reset terlebih dahulu jika ingin membuat ulang.",
        });
    }

    const eligibleSoldiers = await getEligibleSoldiers();
    if (eligibleSoldiers.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "Tidak ada anggota aktif dengan pangkat Letnan Satu ke bawah.",
        });
    }

    const dates = getDatesInMonth(bulan, tahun);
    const lastSoldierId = await getLastSoldierFromPreviousMonth(bulan, tahun);
    const shuffled = [...eligibleSoldiers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (
      lastSoldierId &&
      shuffled.length > 1 &&
      shuffled[0].id === lastSoldierId
    ) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    const jadwalData = dates.map((date, i) => ({
      soldier_id: shuffled[i % shuffled.length].id,
      tanggal_piket: date.toISOString().split("T")[0],
      bulan,
      tahun,
      status: "scheduled",
      admin_id: req.user.id,
    }));

    const createdJadwal = await JadwalPiket.bulkCreate(jadwalData);
    res.status(201).json({
      message: "Jadwal piket berhasil dibuat.",
      data: createdJadwal,
      meta: {
        total_generated: createdJadwal.length,
        total_eligible: eligibleSoldiers.length,
      },
    });
  } catch (error) {
    console.error("Error generate jadwal piket:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat jadwal piket.", error: error.message });
  }
};

exports.index = async (req, res) => {
  try {
    const {
      bulan,
      tahun,
      page = 1,
      limit = 100,
      approval_status,
      swap_approval_status,
    } = req.query;
    const where = {};
    if (approval_status) where.approval_status = approval_status;
    if (swap_approval_status) where.swap_approval_status = swap_approval_status;
    if (!approval_status && !swap_approval_status) {
      if (!bulan || !tahun)
        return res
          .status(400)
          .json({ message: "Bulan dan tahun wajib diisi." });
      where.bulan = parseInt(bulan);
      where.tahun = parseInt(tahun);
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await JadwalPiket.findAndCountAll({
      where,
      include: [
        soldierInclude(),
        { model: Admin, attributes: ["id", "full_name"] },
        { model: Admin, as: "reviewer", attributes: ["id", "full_name"] },
        {
          model: JadwalPiket,
          as: "SwapWithSchedule",
          include: [soldierInclude()],
        },
      ],
      order: [["tanggal_piket", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in jadwal piket index:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server.",
        error: error.message,
      });
  }
};

exports.show = async (req, res) => {
  try {
    const jadwal = await JadwalPiket.findByPk(req.params.id, {
      include: [
        soldierInclude(),
        { model: Admin, attributes: ["id", "full_name"] },
      ],
    });
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    res.json({ data: jadwal });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server.",
        error: error.message,
      });
  }
};

exports.showByDate = async (req, res) => {
  try {
    const jadwal = await JadwalPiket.findOne({
      where: { tanggal_piket: req.params.date },
      include: [
        soldierInclude(["id", "full_name", "username", "photo"]),
        { model: Admin, attributes: ["id", "full_name"] },
      ],
    });
    if (!jadwal)
      return res
        .status(404)
        .json({
          message: "Jadwal piket tidak ditemukan untuk tanggal tersebut.",
        });
    res.json({ data: jadwal });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server.",
        error: error.message,
      });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { soldier_id, status, keterangan } = req.body;
    const jadwal = await JadwalPiket.findByPk(id);
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });

    if (soldier_id) {
      const eligibleIds = await getEligibleIds();
      if (!eligibleIds.has(Number(soldier_id)))
        return res
          .status(400)
          .json({
            message:
              "Anggota pengganti harus aktif dan berpangkat Letnan Satu ke bawah.",
          });
      const duplicateJadwal = await JadwalPiket.findOne({
        where: {
          tanggal_piket: jadwal.tanggal_piket,
          soldier_id,
          id: { [Op.ne]: id },
        },
      });
      if (duplicateJadwal)
        return res
          .status(409)
          .json({
            message: "Anggota sudah memiliki jadwal piket di hari tersebut.",
          });
      jadwal.soldier_id = soldier_id;
    }

    if (status) {
      if (!["scheduled", "completed", "absent"].includes(status))
        return res.status(400).json({ message: "Status tidak valid." });
      jadwal.status = status;
    }
    if (keterangan !== undefined) jadwal.keterangan = keterangan;
    await jadwal.save();
    res.json({ message: "Jadwal piket berhasil diperbarui.", data: jadwal });
  } catch (error) {
    console.error("Error update jadwal piket:", error);
    res
      .status(500)
      .json({
        message: "Gagal memperbarui jadwal piket.",
        error: error.message,
      });
  }
};

exports.remove = async (req, res) => {
  try {
    const jadwal = await JadwalPiket.findByPk(req.params.id);
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    await jadwal.destroy();
    res.json({ message: "Jadwal piket berhasil dihapus." });
  } catch (error) {
    console.error("Error delete jadwal piket:", error);
    res.status(500).json({ message: "Gagal menghapus jadwal piket." });
  }
};

exports.reset = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun)
      return res.status(400).json({ message: "Bulan dan tahun wajib diisi." });
    const deletedCount = await JadwalPiket.destroy({
      where: { bulan: parseInt(bulan), tahun: parseInt(tahun) },
    });
    res.json({
      message: "Jadwal piket berhasil direset.",
      deleted_count: deletedCount,
    });
  } catch (error) {
    console.error("Error reset jadwal piket:", error);
    res
      .status(500)
      .json({ message: "Gagal mereset jadwal piket.", error: error.message });
  }
};

exports.calendar = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun)
      return res.status(400).json({ message: "Bulan dan tahun wajib diisi." });
    const jadwals = await JadwalPiket.findAll({
      where: { bulan: parseInt(bulan), tahun: parseInt(tahun) },
      include: [
        soldierInclude(),
        { model: Admin, attributes: ["id", "full_name"] },
        { model: Admin, as: "reviewer", attributes: ["id", "full_name"] },
        {
          model: JadwalPiket,
          as: "SwapWithSchedule",
          include: [soldierInclude()],
        },
      ],
      order: [["tanggal_piket", "ASC"]],
    });
    res.json({ data: jadwals });
  } catch (error) {
    console.error("Error fetch calendar jadwal piket:", error);
    res
      .status(500)
      .json({
        message: "Gagal memuat kalender jadwal piket.",
        error: error.message,
      });
  }
};

exports.ajukanUsulanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;
    const jadwal = await JadwalPiket.findByPk(id);
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    if (jadwal.soldier_id !== req.user.id)
      return res
        .status(403)
        .json({
          message: "Anda tidak berhak mengajukan usulan untuk jadwal ini.",
        });
    if (!status || !["completed", "absent"].includes(status))
      return res
        .status(400)
        .json({ message: "Status harus 'completed' atau 'absent'." });
    if (status === "completed" && !isBeforeToday(jadwal.tanggal_piket) && jadwal.tanggal_piket !== todayDateOnly())
      return res
        .status(400)
        .json({ message: "Status selesai hanya bisa diajukan pada/ setelah tanggal piket." });
    if (status === "absent" && !keterangan)
      return res
        .status(400)
        .json({ message: "Keterangan wajib diisi jika status 'absent'." });
    if (jadwal.approval_status === "pending")
      return res
        .status(409)
        .json({ message: "Sudah ada usulan yang menunggu persetujuan admin." });
    if (jadwal.swap_approval_status === "pending")
      return res
        .status(409)
        .json({
          message: "Sudah ada usulan tukar yang menunggu persetujuan admin.",
        });

    jadwal.status_usulan = status;
    jadwal.keterangan_usulan = keterangan || null;
    jadwal.approval_status = "pending";
    await jadwal.save();
    res.json({
      message: "Usulan status jadwal piket berhasil diajukan.",
      data: jadwal,
    });
  } catch (error) {
    console.error("Error ajukan usulan status:", error);
    res
      .status(500)
      .json({
        message: "Gagal mengajukan usulan status.",
        error: error.message,
      });
  }
};

exports.reviewUsulanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!action || !["approve", "reject"].includes(action))
      return res
        .status(400)
        .json({ message: "Action harus 'approve' atau 'reject'." });
    const jadwal = await JadwalPiket.findByPk(id);
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    if (jadwal.approval_status !== "pending")
      return res
        .status(409)
        .json({ message: "Tidak ada usulan yang menunggu persetujuan." });

    if (action === "approve") {
      jadwal.status = jadwal.status_usulan;
      jadwal.keterangan = jadwal.keterangan_usulan;
      jadwal.approval_status = "approved";
    } else {
      jadwal.approval_status = "rejected";
    }
    jadwal.reviewed_by_admin_id = req.user.id;
    await jadwal.save();
    res.json({
      message: `Usulan jadwal piket berhasil di${action === "approve" ? "setujui" : "tolak"}.`,
      data: jadwal,
    });
  } catch (error) {
    console.error("Error review usulan status:", error);
    res
      .status(500)
      .json({ message: "Gagal mereview usulan status.", error: error.message });
  }
};

exports.suggestSwapTargets = async (req, res) => {
  try {
    const sourceJadwal = await JadwalPiket.findByPk(req.params.id);
    if (!sourceJadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    if (sourceJadwal.soldier_id !== req.user.id)
      return res
        .status(403)
        .json({
          message: "Anda tidak berhak mengajukan tukar untuk jadwal ini.",
        });

    const eligibleIds = await getEligibleIds();
    const swapTargets = await JadwalPiket.findAll({
      where: {
        id: { [Op.ne]: sourceJadwal.id },
        bulan: sourceJadwal.bulan,
        tahun: sourceJadwal.tahun,
        status: "scheduled",
        tanggal_piket: { [Op.gte]: todayDateOnly() },
        soldier_id: { [Op.ne]: req.user.id },
      },
      include: [soldierInclude()],
      order: [["tanggal_piket", "ASC"]],
    });
    res.json({
      data: swapTargets.filter(
        (item) =>
          eligibleIds.has(item.soldier_id) &&
          item.swap_approval_status !== "pending",
      ),
    });
  } catch (error) {
    console.error("Error suggest swap targets:", error);
    res
      .status(500)
      .json({
        message: "Gagal memuat calon tukar jadwal.",
        error: error.message,
      });
  }
};

exports.ajukanUsulanTukar = async (req, res) => {
  try {
    const { id } = req.params;
    const { swap_with_schedule_id, swap_reason } = req.body;
    if (!swap_with_schedule_id || !String(swap_reason || "").trim())
      return res
        .status(400)
        .json({ message: "Jadwal pengganti dan alasan wajib diisi." });

    const sourceJadwal = await JadwalPiket.findByPk(id);
    const targetJadwal = await JadwalPiket.findByPk(swap_with_schedule_id);
    if (!sourceJadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    if (!targetJadwal)
      return res
        .status(404)
        .json({ message: "Jadwal pengganti tidak ditemukan." });
    if (sourceJadwal.soldier_id !== req.user.id)
      return res
        .status(403)
        .json({
          message: "Anda tidak berhak mengajukan tukar untuk jadwal ini.",
        });
    if (sourceJadwal.soldier_id === targetJadwal.soldier_id)
      return res
        .status(400)
        .json({ message: "Tidak bisa menukar jadwal dengan diri sendiri." });
    if (isBeforeToday(sourceJadwal.tanggal_piket) || isBeforeToday(targetJadwal.tanggal_piket))
      return res
        .status(400)
        .json({ message: "Tukar jadwal hanya bisa untuk tanggal yang belum lewat." });
    if (
      sourceJadwal.bulan !== targetJadwal.bulan ||
      sourceJadwal.tahun !== targetJadwal.tahun
    )
      return res
        .status(400)
        .json({
          message:
            "Tukar hanya boleh dilakukan dalam bulan dan tahun yang sama.",
        });
    if (
      sourceJadwal.status !== "scheduled" ||
      targetJadwal.status !== "scheduled"
    )
      return res
        .status(400)
        .json({ message: "Jadwal asal dan pengganti harus masih terjadwal." });
    if (sourceJadwal.approval_status === "pending")
      return res
        .status(409)
        .json({
          message:
            "Sudah ada usulan status yang menunggu persetujuan. Selesaikan dulu.",
        });
    if (
      sourceJadwal.swap_approval_status === "pending" ||
      targetJadwal.swap_approval_status === "pending"
    )
      return res
        .status(409)
        .json({ message: "Sudah ada usulan tukar yang menunggu persetujuan." });

    const eligibleIds = await getEligibleIds();
    if (!eligibleIds.has(sourceJadwal.soldier_id))
      return res
        .status(400)
        .json({ message: "Anda tidak memenuhi syarat piket." });
    if (!eligibleIds.has(targetJadwal.soldier_id))
      return res
        .status(400)
        .json({ message: "Jadwal pengganti tidak memenuhi syarat piket." });

    sourceJadwal.swap_with_schedule_id = targetJadwal.id;
    sourceJadwal.swap_requester_id = req.user.id;
    sourceJadwal.swap_reason = String(swap_reason).trim();
    sourceJadwal.swap_approval_status = "pending";
    await sourceJadwal.save();
    res.json({
      message: "Usulan tukar jadwal berhasil diajukan.",
      data: sourceJadwal,
    });
  } catch (error) {
    console.error("Error ajukan usulan tukar:", error);
    res
      .status(500)
      .json({
        message: "Gagal mengajukan usulan tukar jadwal.",
        error: error.message,
      });
  }
};

exports.reviewUsulanTukar = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!action || !["approve", "reject"].includes(action))
      return res
        .status(400)
        .json({ message: "Action harus 'approve' atau 'reject'." });

    const sourceJadwal = await JadwalPiket.findByPk(id);
    if (!sourceJadwal)
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan." });
    if (sourceJadwal.swap_approval_status !== "pending")
      return res
        .status(409)
        .json({ message: "Tidak ada usulan tukar yang menunggu persetujuan." });

    if (action === "reject") {
      sourceJadwal.swap_approval_status = "rejected";
      sourceJadwal.swap_reviewed_by_admin_id = req.user.id;
      await sourceJadwal.save();
      return res.json({
        message: "Usulan tukar jadwal berhasil ditolak.",
        data: sourceJadwal,
      });
    }

    const targetJadwal = await JadwalPiket.findByPk(
      sourceJadwal.swap_with_schedule_id,
    );
    if (!targetJadwal)
      return res
        .status(409)
        .json({ message: "Jadwal pengganti tidak ditemukan." });
    if (
      targetJadwal.status !== "scheduled" ||
      targetJadwal.swap_approval_status === "pending"
    )
      return res
        .status(409)
        .json({ message: "Jadwal pengganti tidak memenuhi syarat tukar." });

    await sequelize.transaction(async (transaction) => {
      const sourceSoldierId = sourceJadwal.soldier_id;
      sourceJadwal.soldier_id = targetJadwal.soldier_id;
      targetJadwal.soldier_id = sourceSoldierId;
      sourceJadwal.swap_approval_status = "approved";
      sourceJadwal.swap_reviewed_by_admin_id = req.user.id;
      targetJadwal.swap_approval_status = "none";
      await sourceJadwal.save({ transaction });
      await targetJadwal.save({ transaction });
    });

    res.json({
      message: "Usulan tukar jadwal berhasil disetujui.",
      data: sourceJadwal,
    });
  } catch (error) {
    console.error("Error review usulan tukar:", error);
    res
      .status(500)
      .json({
        message: "Gagal mereview usulan tukar jadwal.",
        error: error.message,
      });
  }
};

exports.mySwaps = async (req, res) => {
  try {
    const soldierId = req.user.id;
    const mySwaps = await JadwalPiket.findAll({
      where: {
        swap_with_schedule_id: { [Op.ne]: null },
        swap_approval_status: { [Op.ne]: "none" },
      },
      include: [
        soldierInclude(),
        {
          model: JadwalPiket,
          as: "SwapWithSchedule",
          include: [soldierInclude()],
        },
        {
          ...soldierInclude(),
          as: "SwapRequester",
        },
      ],
      order: [["updated_at", "DESC"]],
      limit: 100,
    });

    const filteredSwaps = [];
    for (const item of mySwaps) {
      const isApproved = item.swap_approval_status === "approved";
      const requesterId =
        item.swap_requester_id ||
        (isApproved ? item.SwapWithSchedule?.soldier_id : item.soldier_id);
      const requester =
        item.SwapRequester ||
        (isApproved ? item.SwapWithSchedule?.Soldier : item.Soldier);
      const partner = isApproved
        ? item.Soldier
        : item.SwapWithSchedule?.Soldier;
      const partnerId = partner?.id;

      if (requesterId === soldierId || partnerId === soldierId) {
        const isRequester = requesterId === soldierId;
        const plain = item.toJSON();
        plain.is_requester = isRequester;
        plain.requester = requester;
        plain.partner = partner;
        plain.requester_date = item.tanggal_piket;
        plain.partner_date = item.SwapWithSchedule?.tanggal_piket;
        filteredSwaps.push(plain);
      }
    }

    res.json({ data: filteredSwaps });
  } catch (error) {
    console.error("Error get my swap requests:", error);
    res.status(500).json({
      message: "Gagal memuat riwayat usulan tukar jadwal.",
      error: error.message,
    });
  }
};

