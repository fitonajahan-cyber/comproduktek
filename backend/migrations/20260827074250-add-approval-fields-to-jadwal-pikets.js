"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("jadwal_pikets", "status_usulan", {
      type: Sequelize.ENUM('completed', 'absent'),
      allowNull: true,
    });
    await queryInterface.addColumn("jadwal_pikets", "keterangan_usulan", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("jadwal_pikets", "approval_status", {
      type: Sequelize.ENUM('none', 'pending', 'approved', 'rejected'),
      defaultValue: 'none',
    });
    await queryInterface.addColumn("jadwal_pikets", "reviewed_by_admin_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("jadwal_pikets", "status_usulan");
    await queryInterface.removeColumn("jadwal_pikets", "keterangan_usulan");
    await queryInterface.removeColumn("jadwal_pikets", "approval_status");
    await queryInterface.removeColumn("jadwal_pikets", "reviewed_by_admin_id");
  },
};
