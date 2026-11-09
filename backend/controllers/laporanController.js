const { LaporanHarian, LaporanHarianSesi, Soldier, OrgStructure } = require('../models');
const moment = require('moment-timezone');

const getLocalToday = () => moment.tz('Asia/Jakarta').format('YYYY-MM-DD');

const laporanController = {
  // Soldier: Create laporan hari ini + array sesi
  createLaporan: async (req, res) => {
    try {
      const soldier_id = req.user.id;
      const tanggal = getLocalToday();
      const { sesi } = req.body;

      if (!Array.isArray(sesi) || sesi.length === 0) {
        return res.status(400).json({ message: 'Minimal satu sesi harus diisi.' });
      }

      // Check unique constraint
      const existing = await LaporanHarian.findOne({ where: { soldier_id, tanggal } });
      if (existing) {
        return res.status(409).json({
          message: 'Anda sudah membuat laporan untuk hari ini. Gunakan fitur tambah/edit sesi.',
          laporan_id: existing.id
        });
      }

      const laporan = await LaporanHarian.create({ soldier_id, tanggal });

      const sesiData = sesi.map((s, i) => ({
        laporan_harian_id: laporan.id,
        urutan_sesi: i + 1,
        aktivitas: s.aktivitas,
        output_hasil: s.output_hasil,
      }));
      await LaporanHarianSesi.bulkCreate(sesiData);

      const result = await LaporanHarian.findByPk(laporan.id, {
        include: [{ model: LaporanHarianSesi, order: [['urutan_sesi', 'ASC']] }]
      });

      res.status(201).json({ message: 'Laporan berhasil dibuat.', laporan: result });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Laporan untuk hari ini sudah ada.' });
      }
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Soldier: Add a new sesi to today's laporan
  addSesi: async (req, res) => {
    try {
      const soldier_id = req.user.id;
      const tanggal = getLocalToday();
      const { laporan_id, aktivitas, output_hasil } = req.body;

      const laporan = await LaporanHarian.findByPk(laporan_id);
      if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
      if (laporan.soldier_id !== soldier_id) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      if (laporan.tanggal !== tanggal) {
        return res.status(403).json({ message: 'Anda hanya bisa menambah sesi pada laporan hari ini.' });
      }

      const lastSesi = await LaporanHarianSesi.findOne({
        where: { laporan_harian_id: laporan_id },
        order: [['urutan_sesi', 'DESC']]
      });
      const urutan = lastSesi ? lastSesi.urutan_sesi + 1 : 1;

      const sesi = await LaporanHarianSesi.create({
        laporan_harian_id: laporan_id,
        urutan_sesi: urutan,
        aktivitas,
        output_hasil,
      });

      res.status(201).json({ message: 'Sesi berhasil ditambahkan.', sesi });
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Soldier: Edit a sesi
  updateSesi: async (req, res) => {
    try {
      const soldier_id = req.user.id;
      const tanggal = getLocalToday();
      const { id } = req.params;
      const { aktivitas, output_hasil } = req.body;

      const sesi = await LaporanHarianSesi.findByPk(id, {
        include: [{ model: LaporanHarian }]
      });

      if (!sesi) return res.status(404).json({ message: 'Sesi tidak ditemukan.' });
      if (sesi.LaporanHarian.soldier_id !== soldier_id) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      if (sesi.LaporanHarian.tanggal !== tanggal) {
        return res.status(403).json({ message: 'Anda hanya bisa mengedit sesi pada laporan hari ini.' });
      }

      sesi.aktivitas = aktivitas;
      sesi.output_hasil = output_hasil;
      await sesi.save();

      res.status(200).json({ message: 'Sesi berhasil diperbarui.', sesi });
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Soldier: Delete a single sesi (only today's)
  deleteSesi: async (req, res) => {
    try {
      const soldier_id = req.user.id;
      const tanggal = getLocalToday();
      const { id } = req.params;

      const sesi = await LaporanHarianSesi.findByPk(id, {
        include: [{ model: LaporanHarian }]
      });

      if (!sesi) return res.status(404).json({ message: 'Sesi tidak ditemukan.' });
      if (sesi.LaporanHarian.soldier_id !== soldier_id) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
      if (sesi.LaporanHarian.tanggal !== tanggal) {
        return res.status(403).json({ message: 'Anda hanya bisa menghapus sesi pada laporan hari ini.' });
      }

      await sesi.destroy();
      res.status(200).json({ message: 'Sesi berhasil dihapus.' });
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Soldier: Get own laporan history
  getMyLaporan: async (req, res) => {
    try {
      const soldier_id = req.user.id;
      const laporan = await LaporanHarian.findAll({
        where: { soldier_id },
        include: [{ model: LaporanHarianSesi, order: [['urutan_sesi', 'ASC']] }],
        order: [['tanggal', 'DESC']]
      });
      res.status(200).json(laporan);
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Admin: Get all laporan with optional filters
  getAllLaporan: async (req, res) => {
    try {
      const { soldier_id, tanggal } = req.query;
      const where = {};
      if (soldier_id) where.soldier_id = soldier_id;
      if (tanggal) where.tanggal = tanggal;

      const laporan = await LaporanHarian.findAll({
        where,
        include: [
          {
            model: Soldier,
            attributes: ['id', 'username', 'full_name', 'org_structure_id'],
            include: [{ model: OrgStructure, attributes: ['position', 'display_order'] }]
          },
          {
            model: LaporanHarianSesi,
            order: [['urutan_sesi', 'ASC']]
          }
        ],
        order: [['tanggal', 'DESC'], ['created_at', 'DESC']]
      });
      res.status(200).json(laporan);
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },

  // Admin: Delete entire laporan (cascades to sesi)
  deleteLaporan: async (req, res) => {
    try {
      const { id } = req.params;
      const laporan = await LaporanHarian.findByPk(id);
      if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });

      await laporan.destroy(); // CASCADE will remove sesi
      res.status(200).json({ message: 'Laporan dan semua sesi berhasil dihapus.' });
    } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  },
};

module.exports = laporanController;
