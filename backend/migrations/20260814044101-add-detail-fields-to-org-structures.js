"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("org_structures");
    if (!table.disc_kode) {
      await queryInterface.addColumn("org_structures", "disc_kode", {
        type: Sequelize.STRING(4),
        allowNull: true,
      });
    }
    if (!table.disc_label) {
      await queryInterface.addColumn("org_structures", "disc_label", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    if (!table.kekuatan_utama) {
      await queryInterface.addColumn("org_structures", "kekuatan_utama", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!table.rekomendasi_pengembangan) {
      await queryInterface.addColumn("org_structures", "rekomendasi_pengembangan", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!table.cara_komunikasi) {
      await queryInterface.addColumn("org_structures", "cara_komunikasi", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("org_structures", "disc_kode");
    await queryInterface.removeColumn("org_structures", "disc_label");
    await queryInterface.removeColumn("org_structures", "kekuatan_utama");
    await queryInterface.removeColumn("org_structures", "rekomendasi_pengembangan");
    await queryInterface.removeColumn("org_structures", "cara_komunikasi");
  },
};