const multer = require('multer');
const sharp = require('sharp');
const { Tour } = require('../models/');
const factoryController = require('../controllers/factoryController');
const { AppError, catchAsync } = require('../utils/');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);
const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (img, i) => {
      const imageName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageName}`);
      req.body.images.push(imageName);
    })
  );
  next();
});

const aliasTopTour = (req, _res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
  next();
};

const getAllTours = factoryController.getAll(Tour, 'Tour');
const getTour = factoryController.getOne(Tour, 'Tour', { path: 'reviews' });
const createTour = factoryController.create(Tour, 'Tour');
const updateTour = factoryController.update(Tour, 'Tour');
const deleteTour = factoryController.deleteRecord(Tour, 'Tour');

const getTourStats = catchAsync(async (_req, res, _next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res
    .status(200)
    .json({ status: 'success', message: 'Tours stats', data: { stats } });
});
const getMonthlyPlan = catchAsync(async (req, res, _next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: 'Monthly Plan stats',
    result: `${plan.length} results`,
    data: { plan },
  });
});

const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3936.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('Please provide valid langitue latitude', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  return res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); // split string into array with comma (,)
  if (!lat || !lng) {
    return next(new AppError('Please provide valid langitue latitude', 400));
  }
  const multiplier = unit === 'mi' ? 0.0006213 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: { distance: 1, name: 1 },
    },
  ]);
  return res.status(200).json({
    status: 'success',
    data: { distances },
  });
});

module.exports = {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
};
