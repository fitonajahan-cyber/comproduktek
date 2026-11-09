'use strict';

module.exports = {
  async up(queryInterface) {
    // Tabel program_kerja_tims bisa jadi dibuat oleh sequelize.sync() TANPA
    // FK dan TANPA ON DELETE CASCADE. Migration ini memastikan:
    // 1. Baris yatim (proker/soldier sudah terhapus) dibersihkan
    // 2. FK dengan ON DELETE CASCADE terpasang (jika belum ada)

    await queryInterface.sequelize.query(
      'DELETE FROM program_kerja_tims WHERE proker_id NOT IN (SELECT id FROM program_kerjas)',
    );
    await queryInterface.sequelize.query(
      'DELETE FROM program_kerja_tims WHERE soldier_id NOT IN (SELECT id FROM soldiers)',
    );

    const constraints = await queryInterface.sequelize.query(
      `SELECT rc.constraint_name, kcu.column_name
       FROM information_schema.referential_constraints rc
       JOIN information_schema.key_column_usage kcu
         ON rc.constraint_name = kcu.constraint_name AND rc.constraint_schema = kcu.constraint_schema
       WHERE kcu.table_name = 'program_kerja_tims'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const existing = new Set(constraints.map((r) => r.column_name));

    if (!existing.has('proker_id')) {
      await queryInterface.sequelize.query(
        `ALTER TABLE program_kerja_tims
         ADD CONSTRAINT fk_proker_tims_proker
         FOREIGN KEY (proker_id) REFERENCES program_kerjas(id)
         ON DELETE CASCADE ON UPDATE CASCADE`,
      );
    }
    if (!existing.has('soldier_id')) {
      await queryInterface.sequelize.query(
        `ALTER TABLE program_kerja_tims
         ADD CONSTRAINT fk_proker_tims_soldier
         FOREIGN KEY (soldier_id) REFERENCES soldiers(id)
         ON DELETE CASCADE ON UPDATE CASCADE`,
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE program_kerja_tims DROP CONSTRAINT IF EXISTS fk_proker_tims_proker',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE program_kerja_tims DROP CONSTRAINT IF EXISTS fk_proker_tims_soldier',
    );
  },
};
