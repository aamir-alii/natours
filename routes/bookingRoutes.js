const express = require('express');
const router = express.Router();
const { bookingController, authController } = require('../controllers/');

router.use(authController.protect);
router.get('/session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

// router.get('checkout-session/:tourId',
module.exports = router;
