const express = require('express');
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('image'), createRoom);
router.put('/:id', protect, adminOnly, upload.single('image'), updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
