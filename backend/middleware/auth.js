const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Sesi tidak ditemukan, silakan login kembali.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // for backward compatibility with old routes
    req.user = decoded; // for new routes
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Sesi tidak valid atau kedaluwarsa, silakan login kembali.' });
  }
}
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak, butuh hak akses admin.' });
  }
}

function isSoldier(req, res, next) {
  if (req.user && req.user.role === 'soldier') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak, butuh hak akses prajurit.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Akses ditolak, butuh hak akses yang sesuai.' });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Akses ditolak, butuh hak akses yang sesuai.' });
    }
  };
}

module.exports = { requireAuth, isAdmin, isSoldier, requireRole };
