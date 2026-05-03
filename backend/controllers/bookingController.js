const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
  const { roomId, startDate, endDate, notes } = req.body;

  if (!roomId || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Please provide roomId, startDate, and endDate' });
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  if (room.availabilityStatus === 'Full') {
    return res.status(400).json({ success: false, message: 'Room is fully occupied' });
  }
  if (room.availabilityStatus === 'Maintenance') {
    return res.status(400).json({ success: false, message: 'Room is under maintenance' });
  }

  // Check for existing active booking by same user for same room
  const existingBooking = await Booking.findOne({
    userId: req.user.id,
    roomId,
    status: { $in: ['Pending', 'Approved'] },
  });
  if (existingBooking) {
    return res.status(400).json({ success: false, message: 'You already have an active booking for this room' });
  }

  const booking = await Booking.create({
    userId: req.user.id,
    roomId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    notes,
  });

  await booking.populate(['userId', 'roomId']);

  res.status(201).json({ success: true, message: 'Booking created successfully', booking });
};

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private (Student)
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate('roomId', 'roomNumber roomType pricePerMonth image availabilityStatus')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email phone')
    .populate('roomId', 'roomNumber roomType pricePerMonth image')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.status = status;
  await booking.save();

  // Update room occupancy if approved
  if (status === 'Approved') {
    await Room.findByIdAndUpdate(booking.roomId, { $inc: { currentOccupancy: 1 } });
  }

  await booking.populate(['userId', 'roomId']);

  res.status(200).json({ success: true, message: `Booking ${status.toLowerCase()} successfully`, booking });
};

// @desc    Cancel booking (Student)
// @route   DELETE /api/bookings/:id
// @access  Private (Student)
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  // Only owner can cancel
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
  }

  if (booking.status === 'Approved') {
    // Decrease occupancy if was approved
    await Room.findByIdAndUpdate(booking.roomId, { $inc: { currentOccupancy: -1 } });
  }

  booking.status = 'Cancelled';
  await booking.save();

  res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('roomId', 'roomNumber roomType pricePerMonth image');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.status(200).json({ success: true, booking });
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking, getBookingById };
