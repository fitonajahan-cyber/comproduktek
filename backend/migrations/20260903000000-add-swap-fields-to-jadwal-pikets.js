'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('jadwal_pikets', 'swap_with_schedule_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('jadwal_pikets', 'swap_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('jadwal_pikets', 'swap_approval_status', {
      type: Sequelize.ENUM('none', 'pending', 'approved', 'rejected'),
      defaultValue: 'none',
    });
    await queryInterface.addColumn('jadwal_pikets', 'swap_reviewed_by_admin_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('jadwal_pikets', 'swap_with_schedule_id');
    await queryInterface.removeColumn('jadwal_pikets', 'swap_reason');
    await queryInterface.removeColumn('jadwal_pikets', 'swap_approval_status');
    await queryInterface.removeColumn('jadwal_pikets', 'swap_reviewed_by_admin_id');
  },
};
