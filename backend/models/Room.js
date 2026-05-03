const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple'],
      required: [true, 'Room type is required'],
    },
    pricePerMonth: {
      type: Number,
      required: [true, 'Price per month is required'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
    amenities: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-update availability status based on occupancy
roomSchema.pre('save', function (next) {
  if (this.currentOccupancy >= this.capacity) {
    this.availabilityStatus = 'Full';
  } else if (this.availabilityStatus !== 'Maintenance') {
    this.availabilityStatus = 'Available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
