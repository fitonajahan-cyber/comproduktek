const { News, Product, Gallery, Message } = require('../models');

exports.summary = async (req, res) => {
  try {
    const [totalNews, totalProducts, totalGalleries, unreadMessages] = await Promise.all([
      News.count(),
      Product.count(),
      Gallery.count(),
      Message.count({ where: { status: 'Belum Dibaca' } }),
    ]);

    res.json({
      data: {
        totalNews,
        totalProducts,
        totalGalleries,
        unreadMessages,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard.', error: err.message });
  }
};


