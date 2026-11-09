require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { sequelize, Soldier } = require('./models');

async function main() {
  try {
    await sequelize.authenticate();
    const soldiers = await Soldier.findAll({ attributes: ['id', 'username', 'status'] });

    const rows = [];
    for (const s of soldiers) {
      const temp = crypto.randomBytes(8).toString('hex');
      s.password = await bcrypt.hash(temp, 10);
      s.must_change_password = true;
      await s.save();
      rows.push({ username: s.username, password: temp });
      console.log(`${s.username} : ${temp}`);
    }

    const maxUser = Math.max(...rows.map((r) => r.username.length), 8);
    const header = 'Username'.padEnd(maxUser) + '  |  Password Sementara';
    const separator = '-'.repeat(maxUser) + '--+--' + '-'.repeat(18);

    const fileLines = [
      '=== RESET PASSWORD PRAJURIT ===',
      'Simpan file ini secara aman. JANGAN commit ke git.',
      '',
      header,
      separator,
      ...rows.map((r) => r.username.padEnd(maxUser) + '  |  ' + r.password),
      '',
      `Total ${soldiers.length} akun direset. Semua wajib ganti password saat login pertama.`,
      '',
    ];
    const out = fileLines.join('\n') + '\n';
    fs.writeFileSync('soldier-passwords.txt', out, { mode: 0o600 });

    console.log('');
    console.log('Daftar password juga disimpan ke: backend/soldier-passwords.txt');
    console.log('HAPUS file ini setelah didistribusikan. Jangan commit ke git.');
    process.exit(0);
  } catch (err) {
    console.error('Gagal:', err.message);
    process.exit(1);
  }
}

main();