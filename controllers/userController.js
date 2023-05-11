const multer = require('multer');
const sharp = require('sharp');
const { User } = require('../models/');
const { catchAsync, AppError } = require('../utils/');
const factory = require('./factoryController');

// const multerStorage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const name = `${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, name);
//   },
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users/');
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadPhoto = upload.single('photo');
const resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  // check if user try to change password here
  // console.log(req.file);
  const { name, email } = req.body;
  const toBeUpdated = { name, email };
  if (req.file) {
    toBeUpdated.photo = req.file.filename;
  }
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password update please use /updatepassword',
        400
      )
    );
  const user = await User.findByIdAndUpdate(req.user.id, toBeUpdated, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user } });
});
const deleteMe = catchAsync(async (req, res, next) => {
  (req.user.active = false), req.user.save({ validateBeforeSave: false });
  res.status(204).json({ status: 'success' });
});
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const getAllUsers = factory.getAll(User, 'User');
const getUser = factory.getOne(User, 'User');
const updateUser = factory.update(User, 'User');
const deleteUser = factory.deleteRecord(User, 'User');

module.exports = {
  getUser,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
  deleteMe,
  updateMe,
  uploadPhoto,
  resizePhoto,
};
