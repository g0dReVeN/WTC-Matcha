const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');
const UserModel = require('../models/user');

router.post('/register',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 }),
    body('email', 'Please enter a valid email.')
      .normalizeEmail()
      .isEmail(),
    body('password', 'Password has to be alphanumeric and between 6 and 12 characters.')
      .trim()
      .isLength({ min: 6, max: 12 })
      .isAlphanumeric()
  ], authController.postRegistration);

router.post('/dummyDataRegister', authController.postDummyRegistration);

router.post('/login',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 }),
    body('password', 'Password has be alphanumeric and be between 6 and 12 characters.')
      .trim()
      .isAlphanumeric()
      .isLength({ min: 6, max: 12 })
  ], authController.postLogin);

router.patch('/forgotPassword',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 }),
    body('forgot', 'Forgot needs to be a boolean value')
      .isBoolean()
  ], authController.patchForgotPassword);

router.patch('/changePassword',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 }),
    body('password', 'Password has be alphanumeric and be between 6 and 12 characters.')
      .trim()
      .isAlphanumeric()
      .isLength({ min: 6, max: 12 })
  ], authController.patchChangePassword);

router.post('/validateResetToken',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 })
  ], authController.postValidateResetToken);

/** IN PROGRESS Although this is a test */
// router.post('/usersEditTest', authController.postUsersEditTest);

router.get('/', isAuth, (req, res) => { return res.status(200).json({ success: true, msg: 'Token valid' }) });

router.patch('/confirm',
  [
    body('username', 'Username has to be between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 })
  ], authController.patchUserConfirmation);

module.exports = router;