const {
  tourRouter,
  userRouter,
  reviewRouter,
  viewsRouter,
  bookingRouter,
} = require('../routes/');
const { AppError } = require('../utils/');
const { errorController } = require('../controllers/');
module.exports = async (app) => {
  app.use('/api/v1/tours', tourRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/bookings', bookingRouter);
  app.use('/', viewsRouter);
  app.all('*', (req, res, next) => {
    return next(new AppError(`can't find ${req.originalUrl}`, 404));
  });
  app.use(errorController);
  return app;
};
