const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validasi gagal.",
      errors: errors.array(),
    });
  }
  next();
};

const newsValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul wajib diisi.")
    .isLength({ max: 255 })
    .withMessage("Judul maksimal 255 karakter."),
  body("content").trim().notEmpty().withMessage("Konten wajib diisi."),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Kategori wajib diisi.")
    .isLength({ max: 100 })
    .withMessage("Kategori maksimal 100 karakter."),
  body("news_date")
    .optional()
    .isISO8601()
    .withMessage("Format tanggal tidak valid."),
  handleValidationErrors,
];

const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama produk wajib diisi.")
    .isLength({ max: 255 })
    .withMessage("Nama produk maksimal 255 karakter."),
  body("description").trim().notEmpty().withMessage("Deskripsi wajib diisi."),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Kategori maksimal 100 karakter."),
  handleValidationErrors,
];

const galleryValidation = [
  body("gallery_date").notEmpty().withMessage("Tanggal kegiatan wajib diisi."),
  body("description").optional().trim(),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Kategori maksimal 100 karakter."),
  handleValidationErrors,
];

const orgStructureValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi.")
    .isLength({ max: 255 })
    .withMessage("Nama maksimal 255 karakter."),
  body("position")
    .trim()
    .notEmpty()
    .withMessage("Jabatan wajib diisi.")
    .isLength({ max: 255 })
    .withMessage("Jabatan maksimal 255 karakter."),
  body("level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Level harus berupa angka positif."),
  body("parent_id")
    .optional()
    .isInt()
    .withMessage("Parent ID harus berupa angka."),
  body("disc_kode")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 4 })
    .withMessage("Kode karakter DISC maksimal 4 huruf."),
  body("disc_label")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Label karakter maksimal 255 karakter."),
  handleValidationErrors,
];

const programKerjaValidation = [
  body("program").trim().notEmpty().withMessage("Program wajib diisi."),
  body("keterangan").trim().notEmpty().withMessage("Keterangan wajib diisi."),
  body("tanggal_mulai")
    .isISO8601()
    .withMessage("Format tanggal mulai tidak valid."),
  body("tanggal_selesai")
    .optional({ nullable: true, checkFalsy: true })
    .isDate()
    .withMessage("Format tanggal selesai tidak valid."),
  body("deadline").isISO8601().withMessage("Format deadline tidak valid."),
  body("alasan_keterlambatan")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Format alasan tidak valid."),
  body("pic_org_structure_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("PIC harus berupa angka."),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  newsValidation,
  productValidation,
  galleryValidation,
  orgStructureValidation,
  programKerjaValidation,
};
