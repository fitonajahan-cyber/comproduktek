'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('soldiers', 'pangkat', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE soldiers
      SET pangkat = org_structures.rank
      FROM org_structures
      WHERE soldiers.org_structure_id = org_structures.id
        AND soldiers.pangkat IS NULL
        AND org_structures.rank IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('soldiers', 'pangkat');
  },
};
