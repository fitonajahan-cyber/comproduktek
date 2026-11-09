const { sequelize, OrgStructure, Soldier } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Menghapus 1 anggota. Kalau anggota ini punya bawahan langsung, parent_id
 * bawahan-bawahan tersebut dikosongkan dulu (bukan ikut terhapus) supaya
 * tidak ada data yang menunjuk ke ID yang sudah tidak ada di database.
 */
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const item = await OrgStructure.findByPk(req.params.id, { transaction: t });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    await OrgStructure.update(
      { parent_id: null },
      { where: { parent_id: item.id }, transaction: t }
    );
    await item.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Data berhasil dihapus.' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal menghapus data.' });
  }
};

/**
 * Menyimpan ulang urutan (display_order) sesama saudara (anak dari parent_id
 * yang sama). Dibungkus transaction supaya urutan tidak setengah jadi kalau
 * ada yang gagal di tengah proses.
 * Body: { parent_id: number|null, order: [id2, id1, id3, ...] }
 */
exports.reorder = async (req, res) => {
  const { parent_id, order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'Data urutan tidak valid.' });
  }

  const ids = order.map((id) => Number(id));
  if (ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ message: 'Data urutan berisi ID yang tidak valid.' });
  }

  const parentId = parent_id === undefined || parent_id === null || parent_id === '' ? null : Number(parent_id);

  const t = await sequelize.transaction();
  try {
    const count = await OrgStructure.count({ where: { id: ids, parent_id: parentId }, transaction: t });
    if (count !== ids.length) {
      await t.rollback();
      return res.status(400).json({
        message: 'Data pada urutan ini tidak konsisten dengan atasannya. Silakan muat ulang halaman.',
      });
    }

    await Promise.all(
      ids.map((id, index) => OrgStructure.update({ display_order: index + 1 }, { where: { id }, transaction: t }))
    );

    await t.commit();

    const updated = await OrgStructure.findAll({ order: [['display_order', 'ASC']] });
    res.json({ message: 'Urutan berhasil diperbarui.', data: updated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memperbarui urutan.' });
  }
};

/**
 * Mengosongkan data personil pada suatu jabatan (OrgStructure)
 * dan mereset akun Soldier yang terhubung dengan jabatan tersebut.
 */
exports.emptyPosition = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const item = await OrgStructure.findByPk(id, { transaction: t });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ message: 'Data jabatan tidak ditemukan.' });
    }

    // 1. Kosongkan data personil di struktur organisasi
    await item.update({
      name: '',
      rank: null,
      photo: null,
      disc_kode: null,
      disc_label: null,
      kekuatan_utama: null,
      rekomendasi_pengembangan: null,
      cara_komunikasi: null,
    }, { transaction: t });

    // 2. Reset akun Soldier (jika ada)
    const soldier = await Soldier.findOne({ where: { org_structure_id: id }, transaction: t });
    let temporaryPassword = null;
    if (soldier) {
      temporaryPassword = crypto.randomBytes(8).toString('hex');
      const hashed = await bcrypt.hash(temporaryPassword, 10);
      await soldier.update({
        full_name: item.position, // kembalikan ke nama jabatan
        password: hashed
      }, { transaction: t });
    }

    await t.commit();
    const response = { message: 'Identitas pejabat berhasil dikosongkan dan akun direset.' };
    if (temporaryPassword) response.temporary_password = temporaryPassword;
    res.json(response);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal mengosongkan identitas.' });
  }
};
