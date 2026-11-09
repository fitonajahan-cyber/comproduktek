'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('program_kerjas', 'pic_soldier_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'soldiers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(`
      UPDATE program_kerjas
      SET pic_soldier_id = soldiers.id
      FROM soldiers
      WHERE program_kerjas.pic_org_structure_id = soldiers.org_structure_id
        AND program_kerjas.pic_soldier_id IS NULL
        AND soldiers.status = 'aktif'
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('program_kerjas', 'pic_soldier_id');
  },
};
