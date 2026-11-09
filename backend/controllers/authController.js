const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Soldier, OrgStructure } = require('../models');
const { Op } = require('sequelize');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 jam
});

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username atau email
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/email dan password wajib diisi.' });
    }

    // Coba cari di tabel Admin dulu
    let user = await Admin.findOne({
      where: { [Op.or]: [{ username: identifier }, { email: identifier }] },
    });
    let role = 'admin';

    // Jika tidak ketemu di Admin, cari di Soldier
    if (!user) {
      user = await Soldier.findOne({
        where: { username: identifier },
        include: [{ model: OrgStructure, attributes: ['position', 'rank'] }]
      });
      role = 'soldier';
    }

    if (!user) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    if (role === 'soldier' && user.status !== 'aktif') {
      return res.status(403).json({ message: 'Akun anggota nonaktif.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Username/email atau password salah.' });
    }

    const payload = { 
      id: user.id, 
      username: user.username, 
      full_name: user.full_name,
      role: role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    res.cookie('token', token, cookieOptions());
    
    // Return full user data with role
    const userData = { ...user.toJSON(), role };
    delete userData.password;
    
    res.json({ message: 'Login berhasil.', user: userData, token });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil.' });
};

exports.me = async (req, res) => {
  try {
    const { id, role } = req.user || req.admin;
    let currentUser;
    if (role === 'admin') {
      currentUser = await Admin.findByPk(id, { attributes: { exclude: ['password'] } });
    } else {
      currentUser = await Soldier.findByPk(id, { 
        attributes: { exclude: ['password'] },
        include: [{ model: OrgStructure, attributes: ['position', 'rank'] }]
      });
    }
    
    if (!currentUser) return res.status(404).json({ message: "User not found" });
    if (role === 'soldier' && currentUser.status !== 'aktif') {
      res.clearCookie('token');
      return res.status(403).json({ message: 'Akun anggota nonaktif.' });
    }

    const userData = { ...currentUser.toJSON(), role };
    res.json({ user: userData });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
