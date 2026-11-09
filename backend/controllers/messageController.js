const { Message } = require('../models');
const { validationResult } = require('express-validator');

// Publik: kirim pesan dari form Kontak
exports.submit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Data tidak valid.', errors: errors.array() });
  }
  try {
    const { sender_name, sender_email, subject, message } = req.body;
    const item = await Message.create({ sender_name, sender_email, subject, message });
    res.status(201).json({ message: 'Pesan berhasil dikirim. Terima kasih telah menghubungi kami.', data: item });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengirim pesan.', error: err.message });
  }
};

// Admin: list pesan (Kotak Masuk)
exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy, sortOrder = 'ASC' } = req.query;
    const where = {};
    if (status) where.status = status;
    const offset = (Number(page) - 1) * Number(limit);

    let order = [['created_at', 'DESC']];
    const allowedSortFields = ['created_at', 'sender_name', 'sender_email', 'subject', 'status'];
    const safeOrderDirection = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    if (sortBy && allowedSortFields.includes(sortBy)) {
        order = [[sortBy, safeOrderDirection]];
    }

    const { rows, count } = await Message.findAndCountAll({
      where,
      order,
      limit: Number(limit),
      offset,
    });

    const unreadCount = await Message.count({ where: { status: 'Belum Dibaca' } });

    res.json({
      data: rows,
      unreadCount,
      pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data pesan.', error: err.message });
  }
};

// Admin: buka detail pesan -> otomatis jadi "Sudah Dibaca"
exports.show = async (req, res) => {
  try {
    const item = await Message.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Pesan tidak ditemukan.' });

    if (item.status === 'Belum Dibaca') {
      item.status = 'Sudah Dibaca';
      await item.save();
    }

    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail pesan.', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Message.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
    await item.destroy();
    res.json({ message: 'Pesan berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus pesan.', error: err.message });
  }
};
