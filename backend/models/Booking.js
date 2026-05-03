const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calculate total amount before save
bookingSchema.pre('save', async function (next) {
  if (this.startDate && this.endDate) {
    const Room = mongoose.model('Room');
    const room = await Room.findById(this.roomId);
    if (room) {
      const months =
        (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12 +
        (this.endDate.getMonth() - this.startDate.getMonth());
      this.totalAmount = months > 0 ? months * room.pricePerMonth : room.pricePerMonth;
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
