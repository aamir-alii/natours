const express = require('express');
// const multer = require('multer');
const router = express.Router();
const { userController } = require('../controllers/');
const { authController } = require('../controllers/');

// const upload = multer({ dest: 'public/img/users/' });
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch(
  '/updateme',
  userController.uploadPhoto,
  userController.resizePhoto,
  userController.updateMe
);
router.delete('/deleteme', userController.deleteMe);
router.patch('/updatemypassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
