const { Review } = require('../models/');
const factory = require('./factoryController');

const setTourUserIds = (req, res, next) => {
  req.body.user = req.body.user || req.user.id;
  req.body.tour = req.body.tour || req.params.tourId;
  next();
};

const getAllReviews = factory.getAll(Review, 'Review');
const createReview = factory.create(Review, 'Review');
const getReview = factory.getOne(Review, 'Review');
const updateReview = factory.update(Review, 'Review');
const deleteReview = factory.deleteRecord(Review, 'Review');

module.exports = {
  getAllReviews,
  getReview,
  updateReview,
  createReview,
  deleteReview,
  setTourUserIds,
};
