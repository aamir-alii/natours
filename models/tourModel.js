const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating average can not be less than one'],
      max: [5, 'rating average can be greater than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        return this.price > val;
      },
      message: 'discount price ({VALUE}) must be greater than regular price',
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a descripiton'],
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //lat, long
      address: String,
      description: String,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// creating indexs
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Adding virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// adding reviews on tours virtualy
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document Middleware
tourSchema.pre('save', function (next) {
  // Add slug in tour with tour name
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// query Middleware
tourSchema.pre(/^find/, function (next) {
  // populating guides when someone query for tours
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});
module.exports = mongoose.model('Tour', tourSchema);
