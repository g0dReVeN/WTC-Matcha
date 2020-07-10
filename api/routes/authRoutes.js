const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');

router.post('/register',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('email', 'Please enter a valid email.')
      .isString()
      .normalizeEmail()
      .isEmail(),
    body('password', 'Password needs to be an alphanumeric string and between 6 and 12 characters.')
      .isString()
      .trim()
      .isLength({ min: 6, max: 12 })
      .isAlphanumeric()
  ], authController.postRegistration);

router.post('/dummyDataRegister', authController.postDummyRegistration);

router.post('/login',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('password', 'Password needs be an alphanumeric string and be between 6 and 12 characters.')
      .isString()
      .trim()
      .isAlphanumeric()
      .isLength({ min: 6, max: 12 })
  ], authController.postLogin);

router.patch('/forgotPassword',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('forgot', 'Forgot needs to be a boolean value')
      .isBoolean()
  ], authController.patchForgotPassword);

router.patch('/changePassword',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('password', 'Password needs be an alphanumeric string and be between 6 and 12 characters.')
      .isString()
      .trim()
      .isAlphanumeric()
      .isLength({ min: 6, max: 12 })
  ], authController.patchChangePassword);

router.post('/validateResetToken',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isString()
      .isLength({ min: 4, max: 15 })
  ], authController.postValidateResetToken);

/** IN PROGRESS Although this is a test */
// router.post('/usersEditTest', authController.postUsersEditTest);

router.get('/', isAuth, (req, res) => { return res.status(200).json({ success: true, msg: 'Token valid' }) });

router.patch('/confirm',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .isLength({ min: 4, max: 15 })
  ], authController.patchUserConfirmation);

module.exports = router;