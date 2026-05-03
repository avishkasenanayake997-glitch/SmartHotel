const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingById,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/', adminOnly, getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', adminOnly, updateBookingStatus);
router.delete('/:id', cancelBooking);

module.exports = router;
