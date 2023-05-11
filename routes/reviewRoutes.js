const express = require('express');
const router = express.Router({ mergeParams: true });
const { reviewController, authController } = require('../controllers/');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  );

module.exports = router;
