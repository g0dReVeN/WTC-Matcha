const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/userController');
const isAuth = require('../middleware/is-auth');
const imgUpload = require('../middleware/multer');

const router = express.Router();

router.patch('/editProfile',
  [
    body('username', 'Username needs to be between 4 and 15 characters')
      .optional()
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('firstname', 'Firstname needs to be between 4 and 15 characters')
      .optional()
      .isString()
      .isLength({ min: 1, max: 30 }),
    body('lastname', 'Lastname needs to be between 4 and 15 characters')
      .optional()
      .isString()
      .isLength({ min: 1, max: 30 }),
    body('email', 'Please enter a valid email')
      .optional()
      .isString()
      .normalizeEmail()
      .isEmail(),
    body('password', 'Password needs to be alphanumeric between 6 and 12 characters')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 6, max: 12 })
      .isAlphanumeric(),
    body('age', 'Age needs to be a number between 18 and 70')
      .optional()
      .isInt({ min: 18, max: 70 }),
    body('lat', 'Lat needs to be a number')
      .optional()
      .isInt(),
    body('long', 'Long needs to be a number')
      .optional()
      .isInt(),
    body('location', 'Location needs to be of type JSON')
      .optional()
      .isJSON(),
    body('gender', 'Gender needs to be a number of values \'0\' or \'1\' to represent male and female respectively')
      .optional()
      .isInt({ min: 0, max: 1 }),
    body('sexual_preference', 'Sexual preference needs to be a number of values \'0\', \'1\' or \'2\' to represent bisexual, male and female respectively')
      .optional()
      .isInt({ min: 0, max: 2 }),
    body('tags', 'Tags needs to be an array of characters')
      .optional()
      .isArray(),
    body('biography', 'Biography needs to contain characters')
      .optional()
      .isString()
  ], isAuth, imgUpload.any(), userController.patchEditProfile);

router.get('/history', isAuth, userController.getUserHistory);

router.get('/likes', isAuth, userController.getUserLikes);

router.get('/report', isAuth, userController.getUserReport);

router.get('/connected', isAuth, userController.getConnections);

router.post('/filteredUsers', isAuth, userController.postUsers);

router.patch('/action', isAuth, userController.patchAction);

router.get('/downloads/:img', isAuth, userController.getUserImage);

router.get('/tags', isAuth, userController.getTags);

router.get('/notification', isAuth, userController.getUserNotificationList);

router.get('/:id', isAuth, userController.getUser);

module.exports = router;

// router.put('/like', isAuth, userController.putLike);

// router.put('/consult', isAuth, userController.putConsult);

// router.put('/unlike', isAuth, userController.putUnlike);

// router.patch('/block', isAuth, userController.patchBlockUser);

// router.patch('/unblock', isAuth, userController.patchUnblockUser);