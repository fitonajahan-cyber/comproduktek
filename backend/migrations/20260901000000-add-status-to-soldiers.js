'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('soldiers', 'status', {
      type: Sequelize.ENUM('aktif', 'nonaktif'),
      allowNull: false,
      defaultValue: 'aktif',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('soldiers', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_soldiers_status;');
  },
};
