const sequelize = require('../config/database');
const Admin = require('./Admin');
const News = require('./News');
const Product = require('./Product');
const Gallery = require('./Gallery');
const Message = require('./Message');
const OrgStructure = require('./OrgStructure');

const Soldier = require('./Soldier');
const ProgramKerja = require('./ProgramKerja');
const ProgramKerjaTim = require('./ProgramKerjaTim');
const Absensi = require('./Absensi');
const LaporanHarian = require('./LaporanHarian');
const LaporanHarianSesi = require('./LaporanHarianSesi');
const JadwalPiket = require('./JadwalPiket');

// Relasi: audit trail -> admin pembuat konten
Admin.hasMany(News, { foreignKey: 'admin_id' });
News.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Product, { foreignKey: 'admin_id' });
Product.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(Gallery, { foreignKey: 'admin_id' });
Gallery.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(ProgramKerja, { foreignKey: 'admin_id' });
ProgramKerja.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.hasMany(OrgStructure, { foreignKey: 'admin_id' });
OrgStructure.belongsTo(Admin, { foreignKey: 'admin_id' });

// Relasi hierarki
OrgStructure.hasMany(OrgStructure, { as: 'children', foreignKey: 'parent_id' });
OrgStructure.belongsTo(OrgStructure, { as: 'parent', foreignKey: 'parent_id' });

// Relasi OrgStructure ke Soldier (1 jabatan bisa dipegang 1 orang/akun)
OrgStructure.hasOne(Soldier, { foreignKey: 'org_structure_id' });
Soldier.belongsTo(OrgStructure, { foreignKey: 'org_structure_id' });

// Relasi OrgStructure ke ProgramKerja (1 jabatan bisa punya banyak proker)
OrgStructure.hasMany(ProgramKerja, { foreignKey: 'pic_org_structure_id' });
ProgramKerja.belongsTo(OrgStructure, { as: 'pic', foreignKey: 'pic_org_structure_id' });
Soldier.hasMany(ProgramKerja, { as: 'programKerjaPic', foreignKey: 'pic_soldier_id' });
ProgramKerja.belongsTo(Soldier, { as: 'picSoldier', foreignKey: 'pic_soldier_id' });

// Relasi many-to-many: tim anggota program kerja
ProgramKerja.belongsToMany(Soldier, { through: ProgramKerjaTim, as: 'tim', foreignKey: 'proker_id', otherKey: 'soldier_id' });
Soldier.belongsToMany(ProgramKerja, { through: ProgramKerjaTim, as: 'programKerjaTim', foreignKey: 'soldier_id', otherKey: 'proker_id' });

// Relasi Absensi
Soldier.hasMany(Absensi, { foreignKey: 'soldier_id' });
Absensi.belongsTo(Soldier, { foreignKey: 'soldier_id' });
Admin.hasMany(Absensi, { foreignKey: 'reviewed_by_admin_id' });
Absensi.belongsTo(Admin, { foreignKey: 'reviewed_by_admin_id' });

// Relasi Laporan Harian (Header – Detail dengan Cascade Delete)
Soldier.hasMany(LaporanHarian, { foreignKey: 'soldier_id' });
LaporanHarian.belongsTo(Soldier, { foreignKey: 'soldier_id' });
LaporanHarian.hasMany(LaporanHarianSesi, { foreignKey: 'laporan_harian_id', onDelete: 'CASCADE', hooks: true });
LaporanHarianSesi.belongsTo(LaporanHarian, { foreignKey: 'laporan_harian_id' });

// Relasi Jadwal Piket
Admin.hasMany(JadwalPiket, { foreignKey: 'admin_id' });
JadwalPiket.belongsTo(Admin, { foreignKey: 'admin_id' });
Admin.hasMany(JadwalPiket, { as: 'reviewedPikets', foreignKey: 'reviewed_by_admin_id' });
JadwalPiket.belongsTo(Admin, { as: 'reviewer', foreignKey: 'reviewed_by_admin_id' });
Soldier.hasMany(JadwalPiket, { foreignKey: 'soldier_id' });
JadwalPiket.belongsTo(Soldier, { foreignKey: 'soldier_id' });
JadwalPiket.belongsTo(Soldier, { as: 'SwapRequester', foreignKey: 'swap_requester_id' });
JadwalPiket.belongsTo(JadwalPiket, { as: 'SwapWithSchedule', foreignKey: 'swap_with_schedule_id' });

module.exports = { sequelize, Admin, News, Product, Gallery, Message, OrgStructure, Soldier, ProgramKerja, ProgramKerjaTim, Absensi, LaporanHarian, LaporanHarianSesi, JadwalPiket };
