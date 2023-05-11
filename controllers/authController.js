const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models/');
const { catchAsync, Email } = require('../utils/');
const { AppError } = require('../utils/');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
const createSendToken = (res, user, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cannot modified by anyone
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
const signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();
  createSendToken(res, user, 201);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) if email and password exists
  if (!email || !password)
    return next(new AppError('Please provide email and password'), 400);
  // 2) if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');
  const check = await user?.correctPassword(password, user?.password);
  if (!user || !check)
    return next(new AppError('incorrect email or password', 401));
  // 4) if everything is correct send token
  createSendToken(res, user, 200);
});
const protect = catchAsync(async (req, res, next) => {
  // [ ] Get token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // this logic is only for /me views
  if (req.path == '/me' && !token) {
    res.redirect('back');
  }
  if (!token)
    return next(
      new AppError('you are not logged in! please login and try again', 401)
    );

  // [ ] validate token if it is valid (verfication)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // [ ] check if user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError('the user belonging to token does not exist', 401)
    );
  // [ ] check if user doest not change password after token was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password. Please login', 401)
    );
  // [ ] Grant access to user
  req.user = user;
  res.locals.user = user;

  next();
});

const isLoggedIn = async (req, res, next) => {
  // [ ] Get token and check if it exist
  try {
    let token;
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) return next();
    // [ ] validate token if it is valid (verfication)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // [ ] check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) return next();
    // [ ] check if user doest not change password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) return next();
    res.locals.user = user;
    next();
  } catch (err) {
    next();
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not authorized to perform this action', 403)
      );
    next();
  };
};
const forgetPassword = catchAsync(async (req, res, next) => {
  // [ ] check if user exist with given email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('there is no user with givin email', 404));
  // [ ] generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;
    await new Email(user, url).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'reset token sent successfully to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(err.message, 500));
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  // [ ] get user base on token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token invalid or expired', 400));
  // [ ] set new password if user exist and token is not expire
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //  [ ] login user
  createSendToken(res, user, 200);
});
const updatePassword = catchAsync(async (req, res, next) => {
  // Get User from the database
  const { currPassword, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  let check = await user.correctPassword(currPassword, user?.password);
  if (!check) {
    return next(new AppError('your current password is incorrect', 401));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  createSendToken(res, user, 200);
});
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000 * 10),
    httpOnly: true,
  });
  return res
    .status(200)
    .json({ status: 'success', message: 'logout successfully' });
};
module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout,
};
