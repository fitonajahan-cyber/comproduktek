const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Absensi = sequelize.define(
  "Absensi",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    soldier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "hadir",
        "sakit",
        "izin",
        "tk",
        "dd",
        "bp",
        "dl",
        "dik",
        "satgas",
        "belum_diisi",
      ),
      allowNull: false,
      defaultValue: "belum_diisi",
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sanggahan_status: {
      type: DataTypes.ENUM("none", "pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "none",
    },
    status_usulan: {
      type: DataTypes.ENUM(
        "hadir",
        "sakit",
        "izin",
        "tk",
        "dd",
        "bp",
        "dl",
        "dik",
        "satgas",
        "belum_diisi",
      ),
      allowNull: true,
    },
    keterangan_sanggahan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "absensis",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["soldier_id", "tanggal"],
      },
    ],
  },
);

module.exports = Absensi;
