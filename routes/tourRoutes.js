const express = require('express');
const router = express.Router();
const { tourController, authController } = require('../controllers/');
const reviewRouter = require('./reviewRoutes');
router.use('/:tourId/reviews', reviewRouter);
router.get('/tour-stats', tourController.getTourStats);
router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);
router.get(
  '/top-5-cheap',
  tourController.aliasTopTour,
  tourController.getAllTours
);
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  )
  .get(tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/tour-within/distance/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

module.exports = router;
