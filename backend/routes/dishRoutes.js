const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDishes, getDishById, createDish, updateDish, deleteDish, toggleAvailable } = require('../controllers/dishController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(ext && mime ? null : new Error('Type de fichier non supporté'), ext && mime);
    },
});

router.get('/', getDishes);
router.get('/:id', getDishById);
router.post('/', protect, upload.single('image'), createDish);
router.put('/:id', protect, upload.single('image'), updateDish);
router.delete('/:id', protect, deleteDish);
router.patch('/:id/toggle', protect, toggleAvailable);

module.exports = router;
