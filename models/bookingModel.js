const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to user!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, async function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' }).clone();
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
