const express = require("express");
const router = express.Router();
const soldierController = require("../controllers/soldierController");
const { requireAuth, isAdmin, isSoldier } = require("../middleware/auth");

const upload = require("../middleware/upload");

// === UNTUK SOLDIER (USER BIASA) ===
router.put(
  "/profile",
  requireAuth,
  isSoldier,
  upload.single("photo"),
  soldierController.updateProfile,
);

// === UNTUK ADMIN ===
// Mendapatkan semua anggota
router.get("/", requireAuth, isAdmin, soldierController.getAllSoldiers);

// Mendapatkan detail anggota
router.get("/:id", requireAuth, isAdmin, soldierController.getSoldierById);

// Update data anggota (reset password, ganti username)
router.put("/:id", requireAuth, isAdmin, soldierController.updateSoldier);

// Reset password anggota (generate password acak sementara)
router.post("/:id/reset-password", requireAuth, isAdmin, soldierController.resetSoldierPassword);

module.exports = router;
