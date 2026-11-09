require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize, Admin, OrgStructure, Soldier } = require('./models');
const { Op } = require('sequelize');

// ─── DATA STRUKTUR ORGANISASI ─────────────────────────────────────────────────
const positionsData = [
  // Level 1
  { ref: 'DANSATLAK',          position: 'DANSATLAK DUKTEKSI',                            parentRef: null,              color: 'merah' },

  // Level 2
  { ref: 'SPACER_KIRI',        position: '_EMPTY_',                                        parentRef: 'DANSATLAK',       color: 'teal' },
  { ref: 'KABAGOPS',           position: 'KABAGOPS',                                       parentRef: 'DANSATLAK',       color: 'teal' },
  { ref: 'TRUNK_1',            position: '_TRUNK_',                                        parentRef: 'DANSATLAK',       color: 'teal' },
  { ref: 'KABAGMIN',           position: 'KABAGMIN',                                       parentRef: 'DANSATLAK',       color: 'teal' },
  { ref: 'SPACER_BATIMIN',     position: '_SPACER_BATIMIN_',                               parentRef: 'DANSATLAK',       color: 'teal' },

  // Level 3
  { ref: 'PAUROPS',            position: 'PAUROPS',                                        parentRef: 'KABAGOPS',        color: 'teal' },
  { ref: 'TRUNK_2',            position: '_TRUNK_',                                        parentRef: 'TRUNK_1',         color: 'teal' },
  { ref: 'PAURMIN',            position: 'PAURMIN',                                        parentRef: 'KABAGMIN',        color: 'teal' },
  { ref: 'BATIMIN',            position: 'BATIMIN',                                        parentRef: 'SPACER_BATIMIN',  color: 'teal' },

  // Level 4
  { ref: 'BAMIN_BAGOPS',       position: 'BAMIN BAGOPS',                                   parentRef: 'PAUROPS',         color: 'teal' },
  { ref: 'TRUNK_3',            position: '_TRUNK_',                                        parentRef: 'TRUNK_2',         color: 'teal' },
  { ref: 'BAMIN_BAGMIN',       position: 'BAMIN BAGMIN',                                   parentRef: 'PAURMIN',         color: 'teal' },
  { ref: 'TAMUDI',             position: 'TAMUDI',                                         parentRef: 'BATIMIN',         color: 'teal' },

  // Level 5
  { ref: 'DANTIM_BANGTEKSI',   position: 'DANTIMBANGTEKSI',                                parentRef: 'TRUNK_3',         color: 'teal' },
  { ref: 'DANTIM_RT',          position: 'DANTIM REKAYASA TERBALIK',                       parentRef: 'TRUNK_3',         color: 'teal' },
  { ref: 'DANTIM_HARWAT',      position: 'DANTIM HARWATSTAL',                              parentRef: 'TRUNK_3',         color: 'teal' },

  // Level 6
  { ref: 'SPACER_PENATA_DIG',  position: '_SPACER_PENATA_',                                parentRef: 'DANTIM_BANGTEKSI',color: 'teal' },
  { ref: 'DANUNIT_QA',         position: 'DANUNIT BAG QUANTUM DAN AI',                     parentRef: 'DANTIM_BANGTEKSI',color: 'teal' },
  { ref: 'DANUNIT_KOM',        position: 'DANUNIT KOM KEAMANAN DIG',                       parentRef: 'DANTIM_BANGTEKSI',color: 'teal' },
  { ref: 'SPACER_PENATA_APP',  position: '_SPACER_PENATA_',                                parentRef: 'DANTIM_RT',       color: 'teal' },
  { ref: 'DANUNIT_IOT',        position: 'DANUNIT REKAYASA IOT',                           parentRef: 'DANTIM_RT',       color: 'teal' },
  { ref: 'DANUNIT_RPL',        position: 'DANUNIT REKAYASA PERANGKAT LUNAK',               parentRef: 'DANTIM_RT',       color: 'teal' },
  { ref: 'SPACER_PENATA_SERVER',position: '_SPACER_PENATA_',                               parentRef: 'DANTIM_HARWAT',   color: 'teal' },
  { ref: 'DANUNIT_HW',         position: 'DANUNIT HARWAT HARDWARE',                        parentRef: 'DANTIM_HARWAT',   color: 'teal' },
  { ref: 'DANUNIT_SW',         position: 'DANUNIT HARWAT SOFTWARE',                        parentRef: 'DANTIM_HARWAT',   color: 'teal' },

  // Level 7
  { ref: 'PENATA_DIG',         position: 'PENATA ADMIN DAN ANALIS DIG',                    parentRef: 'SPACER_PENATA_DIG',   color: 'teal' },
  { ref: 'PENATA_APP',         position: 'PENATA PENILAIAN KEAMANAN SISTEM DAN APLIKASI',  parentRef: 'SPACER_PENATA_APP',   color: 'teal' },
  { ref: 'PENATA_SERVER',      position: 'PENATA INSTALASI SISTEM DAN SERVER',             parentRef: 'SPACER_PENATA_SERVER',color: 'teal' },
  { ref: 'PAUNIT_AI',          position: 'PAUNIT KECERDASAN BUATAN',                       parentRef: 'DANUNIT_QA',      color: 'teal' },
  { ref: 'PAUNIT_BQ',          position: 'PAUNIT BANG BQ',                                 parentRef: 'DANUNIT_QA',      color: 'teal' },
  { ref: 'PAUNIT_DATA',        position: 'PAUNIT PEMULIHAN DATA',                          parentRef: 'DANUNIT_KOM',     color: 'teal' },
  { ref: 'PAUNIT_KONTRA',      position: 'PAUNIT KONTRA PENGINDRAAN',                      parentRef: 'DANUNIT_KOM',     color: 'teal' },
  { ref: 'PAUNIT_KEAM_IOT',    position: 'PAUNIT KEAMANAN SI IOT',                         parentRef: 'DANUNIT_IOT',     color: 'teal' },
  { ref: 'PAUNIT_REKON',       position: 'PAUNIT REKONTRUKSI SISTEM',                      parentRef: 'DANUNIT_RPL',     color: 'teal' },
  { ref: 'PAUNIT_HW',          position: 'PAUNIT HARWAT PERANGKAT KERAS',                  parentRef: 'DANUNIT_HW',      color: 'teal' },
  { ref: 'PAUNIT_SW',          position: 'PAUNIT HARWAT PERANGKAT LUNAK',                  parentRef: 'DANUNIT_SW',      color: 'teal' },

  // Level 8
  { ref: 'BAUR_AI',            position: 'BAUR KECERDASAN BUATAN',                         parentRef: 'PAUNIT_AI',       color: 'teal' },
  { ref: 'BAUR_DATA',          position: 'BAUR PEMULIHAN DATA',                            parentRef: 'PAUNIT_DATA',     color: 'teal' },
  { ref: 'BAUR_KONTRA',        position: 'BAUR KONTRA PENGINDRAAN',                        parentRef: 'PAUNIT_KONTRA',   color: 'teal' },
  { ref: 'BAUR_KEAM_IOT',      position: 'BAUR KEAMANAN SI IOT',                           parentRef: 'PAUNIT_KEAM_IOT', color: 'teal' },
  { ref: 'BAUR_REKON',         position: 'BAUR REKONTRUKSI SISTEM',                        parentRef: 'PAUNIT_REKON',    color: 'teal' },
  { ref: 'BAUR_HAR_HW',        position: 'BAUR HAR PERANGKAT KERAS',                       parentRef: 'PAUNIT_HW',       color: 'teal' },
  { ref: 'BAUR_HARWAT_SW',     position: 'BAUR HARWAT PERANGKAT LUNAK',                    parentRef: 'PAUNIT_SW',       color: 'teal' },

  // Level 9
  { ref: 'BA_WAT_HW',          position: 'BA WAT PERANGKAT KERAS',                         parentRef: 'BAUR_HAR_HW',     color: 'teal' },
];

// ─── HELPER ───────────────────────────────────────────────────────────────────
function isPlaceholder(position) {
  return position.startsWith('_');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await sequelize.sync();

    // ── 1. Admin ──────────────────────────────────────────────────────────────
    console.log('\n[1/3] Seeding admin...');
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'UbahPasswordIni123!';
    const hashedAdmin   = await bcrypt.hash(adminPassword, 10);

    const [admin, adminCreated] = await Admin.findOrCreate({
      where: { username: adminUsername },
      defaults: {
        email:     process.env.SEED_ADMIN_EMAIL    || 'admin@dukteksi.mil.id',
        password:  hashedAdmin,
        full_name: process.env.SEED_ADMIN_FULLNAME || 'Administrator Dukteksi',
      },
    });

    if (!adminCreated) {
      // Update password & data agar sinkron dengan .env
      await admin.update({
        password:  hashedAdmin,
        email:     process.env.SEED_ADMIN_EMAIL    || admin.email,
        full_name: process.env.SEED_ADMIN_FULLNAME || admin.full_name,
      });
      console.log(`   Admin "${adminUsername}" sudah ada → password & data diperbarui.`);
    } else {
      console.log(`   Admin "${adminUsername}" berhasil dibuat.`);
    }

    // ── 2. Org Structure ─────────────────────────────────────────────────────
    console.log('\n[2/3] Seeding struktur organisasi...');
    const existingCount = await OrgStructure.count();
    if (existingCount > 0) {
      console.log(`   Sudah ada ${existingCount} data org structure, dilewati.`);
    } else {
      const refToId = {};
      let pending = positionsData.map((p, i) => ({ ...p, order: i + 1 }));

      while (pending.length > 0) {
        let progressMade = false;
        for (let i = pending.length - 1; i >= 0; i--) {
          const item = pending[i];
          const parentResolved = item.parentRef === null || refToId[item.parentRef] !== undefined;
          if (!parentResolved) continue;

          const created = await OrgStructure.create({
            name:          '',
            position:      item.position,
            rank:          null,
            photo:         null,
            parent_id:     item.parentRef === null ? null : refToId[item.parentRef],
            display_order: item.order,
            box_color:     item.color,
            admin_id:      null,
          });
          refToId[item.ref] = created.id;
          pending.splice(i, 1);
          progressMade = true;
        }
        if (!progressMade) {
          console.error('   Circular dependency terdeteksi pada positionsData, seed berhenti.');
          break;
        }
      }
      console.log(`   ${Object.keys(refToId).length} entri org structure berhasil dibuat.`);
    }

    // ── 3. Soldiers ──────────────────────────────────────────────────────────
    console.log('\n[3/3] Seeding akun soldier...');
    const structures = await OrgStructure.findAll({
      where: { position: { [Op.notLike]: '\\_%' } },
    });

    const defaultPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    let createdCount = 0;
    let skippedCount = 0;

    for (const structure of structures) {
      if (isPlaceholder(structure.position)) { skippedCount++; continue; }

      const existing = await Soldier.findOne({ where: { org_structure_id: structure.id } });
      if (existing) { skippedCount++; continue; }

      let username = structure.position.toLowerCase().replace(/\s+/g, '_').substring(0, 50);

      // Hindari bentrok username
      let finalUsername = username;
      let counter = 1;
      while (await Soldier.findOne({ where: { username: finalUsername } })) {
        finalUsername = `${username}_${counter++}`;
      }

      await Soldier.create({
        username:         finalUsername,
        password:         defaultPassword,
        full_name:        structure.position,
        org_structure_id: structure.id,
      });
      createdCount++;
    }

    console.log(`   ${createdCount} akun soldier dibuat, ${skippedCount} dilewati.`);
    console.log('\n✅ Seed selesai!');
    console.log('   Login admin  :', adminUsername);
    console.log('   Password     : (sesuai SEED_ADMIN_PASSWORD di .env)');
    console.log('   ⚠️  Password soldier di-generate acak. Reset via halaman admin.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed gagal:', err.message);
    process.exit(1);
  }
}

seed();
