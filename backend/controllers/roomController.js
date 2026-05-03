const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res) => {
  const { roomNumber, roomType, pricePerMonth, capacity, description, amenities, availabilityStatus } = req.body;

  if (!roomNumber || !roomType || !pricePerMonth || !capacity) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const existing = await Room.findOne({ roomNumber });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Room number already exists' });
  }

  let imageData = { url: '', public_id: '' };

  if (req.file) {
    imageData = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  const room = await Room.create({
    roomNumber,
    roomType,
    pricePerMonth: Number(pricePerMonth),
    capacity: Number(capacity),
    description,
    amenities: amenities ? JSON.parse(amenities) : [],
    availabilityStatus: availabilityStatus || 'Available',
    image: imageData,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, message: 'Room created successfully', room });
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res) => {
  const { type, status, minPrice, maxPrice, search } = req.query;

  const filter = {};
  if (type) filter.roomType = type;
  if (status) filter.availabilityStatus = status;
  if (minPrice || maxPrice) {
    filter.pricePerMonth = {};
    if (minPrice) filter.pricePerMonth.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerMonth.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { roomNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const rooms = await Room.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: rooms.length, rooms });
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id).populate('createdBy', 'name email');
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.status(200).json({ success: true, room });
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res) => {
  let room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  const { roomNumber, roomType, pricePerMonth, capacity, currentOccupancy, description, amenities, availabilityStatus } = req.body;

  let imageData = room.image;

  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (room.image && room.image.public_id) {
      await cloudinary.uploader.destroy(room.image.public_id);
    }
    imageData = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  room = await Room.findByIdAndUpdate(
    req.params.id,
    {
      roomNumber: roomNumber || room.roomNumber,
      roomType: roomType || room.roomType,
      pricePerMonth: pricePerMonth ? Number(pricePerMonth) : room.pricePerMonth,
      capacity: capacity ? Number(capacity) : room.capacity,
      currentOccupancy: currentOccupancy !== undefined ? Number(currentOccupancy) : room.currentOccupancy,
      description: description !== undefined ? description : room.description,
      amenities: amenities ? JSON.parse(amenities) : room.amenities,
      availabilityStatus: availabilityStatus || room.availabilityStatus,
      image: imageData,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Room updated successfully', room });
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  // Delete image from Cloudinary
  if (room.image && room.image.public_id) {
    await cloudinary.uploader.destroy(room.image.public_id);
  }

  await room.deleteOne();

  res.status(200).json({ success: true, message: 'Room deleted successfully' });
};

module.exports = { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom };
