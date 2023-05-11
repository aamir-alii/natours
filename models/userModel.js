const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please tell us your name'] },
    email: {
      type: String,
      required: [true, 'Please Provide email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide valid email address'],
    },
    photo: { type: String, default: 'default.jpeg' },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'please provide password'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'please provide confirm password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'password and confirm should be same',
      },
    },
    passwordChangeAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { type: Boolean, default: true, select: false },
  },
  {
    toObject: { virtuals: true },
    toJson: { virtuals: true },
  }
);

userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id',
});

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'User',
//     select: 'name photo',
//   });
//   next();
// });
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 2000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  } else return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
