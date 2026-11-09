'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kolom dokumen perencanaan & hasil pada program_kerjas (idempotent:
    //    skip bila sudah ada, mis. dibuat oleh sequelize.sync() sebelumnya)
    const pkColumns = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'program_kerjas'",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const pkCols = new Set(pkColumns.map((r) => r.column_name));

    if (!pkCols.has('file_perencanaan')) {
      await queryInterface.addColumn('program_kerjas', 'file_perencanaan', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!pkCols.has('file_hasil')) {
      await queryInterface.addColumn('program_kerjas', 'file_hasil', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 2. Tabel relasi many-to-many tim program kerja (skip bila sudah ada)
    const tables = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'program_kerja_tims'",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (tables.length === 0) {
      await queryInterface.createTable('program_kerja_tims', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        proker_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'program_kerjas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        soldier_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'soldiers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
      });
    }

    // 3. Unique composite index: satu soldier tidak bisa dobel masuk tim yang sama
    await queryInterface.addIndex('program_kerja_tims', ['proker_id', 'soldier_id'], {
      unique: true,
      name: 'unique_proker_soldier',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('program_kerja_tims', 'unique_proker_soldier').catch(() => {});
    await queryInterface.dropTable('program_kerja_tims').catch(() => {});
    await queryInterface.removeColumn('program_kerjas', 'file_perencanaan').catch(() => {});
    await queryInterface.removeColumn('program_kerjas', 'file_hasil').catch(() => {});
  },
};
