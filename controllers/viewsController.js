const { Tour, User, Booking } = require('../models/');
const { catchAsync, AppError } = require('../utils/');

const getOverview = catchAsync(async (req, res, next) => {
  // get All tour
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour)
    return next(
      new AppError(`There is no tour with this name ${req.params.slug}`),
      404
    );
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', { title: `${tour.name} Tour`, tour });
});

const getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My Account',
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getMyTours = catchAsync(async (req, res, next) => {
  // find All Bookings
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.render('overview', {
    title: 'My Tours',
    tours,
  });
});
const updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      vailidators: true,
    }
  );
  res.render('account', {
    user,
  });
});
module.exports = {
  getOverview,
  getMyTours,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
};
