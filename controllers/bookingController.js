// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factoryController = require('./factoryController');
const { Tour, Booking, User } = require('../models/');
const { catchAsync, AppError } = require('../utils/');
const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tourId = req.params.tourId;
  const tour = await Tour.findById(tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get(
    //   'host'
    // )}/?tourId=${tourId}&userId=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 1000,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://natours-aamir.cyclic.app/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({ status: 'success', session });
});

// const createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { userId, tourId, price } = req.query;
//   if (!userId && !tourId && !price) {
//     return next();
//   }
//   await Booking.create({ user: userId, tour: tourId, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

createBookingCheckout = catchAsync(async (session) => {
  // line_items: [
  //   {
  //     price_data: {
  //       currency: 'usd',
  //       unit_amount
  const tourId = session.client_reference_id;
  const userId = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;
  await Booking.create({ user: userId, tour: tourId, price });
});
const webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return next(new AppError(`Webhook Error: ${error.message}`, 400));
  }

  if (event.type === 'checkout.session.complete')
    createBookingCheckout(event.data.object);
  res.status(200).json({ recieved: true });
});

const createBooking = factoryController.create(Booking, 'Booking');
const updateBooking = factoryController.update(Booking, 'Booking');
const deleteBooking = factoryController.deleteRecord(Booking, 'Booking');
const getBooking = factoryController.getOne(Booking, 'Booking');
const getAllBooking = factoryController.getAll(Booking, 'Booking');

module.exports = {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getAllBooking,
  webhookCheckout,
};
