require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize, Admin, OrgStructure, Soldier } = require('./models');
const { Op } = require('sequelize');

async function seed() {
  try {
    await sequelize.sync();

    // 1. Tambahkan akun Soldier berdasarkan OrgStructure
    // Ambil semua jabatan di OrgStructure yang bukan _EMPTY_, _TRUNK_, atau _SPACER_
    const structures = await OrgStructure.findAll({
      where: {
        position: {
          [Op.notLike]: '\\_%', // mengabaikan yang diawali underscore
        }
      }
    });

const crypto = require('crypto');

    const defaultPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    let createdCount = 0;

    for (const structure of structures) {
      // Periksa jika kata-katanya mengandung '_SPACER_' atau '_TRUNK_' atau '_EMPTY_' (untuk keamanan ganda)
      if (structure.position.includes('_EMPTY_') || structure.position.includes('_TRUNK_') || structure.position.includes('_SPACER_')) {
        continue;
      }

      // Buat username dari position: huruf kecil semua, hilangkan spasi menjadi underscore
      let username = structure.position.toLowerCase().replace(/\s+/g, '_');
      // Batasi panjang username maksimal 50 karakter (sesuai model)
      if (username.length > 50) {
        username = username.substring(0, 50);
      }

      const existingSoldier = await Soldier.findOne({ where: { org_structure_id: structure.id } });
      if (!existingSoldier) {
        // Cek juga bentrok username
        let checkUsername = await Soldier.findOne({ where: { username } });
        let finalUsername = username;
        let counter = 1;
        while(checkUsername) {
          finalUsername = `${username}_${counter}`;
          checkUsername = await Soldier.findOne({ where: { username: finalUsername } });
          counter++;
        }

        await Soldier.create({
          username: finalUsername,
          password: defaultPassword,
          full_name: structure.position, // default full_name ke nama jabatan
          org_structure_id: structure.id,
        });
        createdCount++;
      }
    }

    console.log(`${createdCount} akun Prajurit/Soldier berhasil dibuat. Password acak telah di-hash; distribusikan secara aman.`);
    process.exit(0);
  } catch (err) {
    console.error('Gagal melakukan seed:', err.message);
    process.exit(1);
  }
}

seed();
