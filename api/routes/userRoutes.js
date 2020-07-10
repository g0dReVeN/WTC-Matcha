const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/userController');
const isAuth = require('../middleware/is-auth');
const imgUpload = require('../middleware/multer');

const router = express.Router();

// router.get('/users', isAuth , userController.getFilteredUsers);

router.patch('/editProfile',
  [
    body('username', 'Username needs to be a string between 4 and 15 characters.')
      .optional()
      .isString()
      .isLength({ min: 4, max: 15 }),
    body('firstname', 'Firstname needs to be a string between 4 and 15 characters.')
      .optional()
      .isString()
      .isLength({ min: 1, max: 30 }),
    body('lastname', 'Lastname needs to be a string between 4 and 15 characters.')
      .optional()
      .isString()
      .isLength({ min: 1, max: 30 }),
    body('email', 'Please enter a valid email.')
      .optional()
      .isString()
      .normalizeEmail()
      .isEmail(),
    body('password', 'Password needs to be alphanumeric and between 6 and 12 characters.')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 6, max: 12 })
      .isAlphanumeric(),
    body('age', 'Age needs to be an integer between 18 and 70.')
      .optional()
      .isInt({ min: 18, max: 70 }),
    // body('location', 'Location needs to be of type JSON.')
    //   .optional()
    //   .isJSON(),
    body('gender', 'Gender needs to be an integer of values \'1\' or \'2\' to represent male and female respectively.')
      .optional()
      .isInt({ min: 1, max: 2 }),
    body('sexual_preference', 'Sexual preference needs to be an integer of values \'1\' or \'2\' to represent male and female respectively.')
      .optional()
      .isInt({ min: 1, max: 2 }),
    body('tags', 'Tags needs to be an array of strings.')
      .optional(),
      // .isArray(),
    body('biography', 'Biography needs to be a string.')
      .optional()
      .isString()
  ], isAuth, userController.patchEditProfile);

router.put('/addHistory',
[
  body('user_id', 'User_id needs to be a string.')
  .isInt(),
  body('like', 'Like needs to be a boolean value')
  .isBoolean()
], isAuth, userController.putHistory);

/** Update DB componenets and async */
router.post('/retrieveFilteredUsers', isAuth, userController.postFilteredUsers);

router.put('/addSingleUserImage', isAuth, imgUpload.any(), userController.putSingleUserImage);

router.put('/addMultipleUserImages', isAuth, imgUpload.any(), userController.putMultipleUserImages);

router.delete('/deleteUserImage/:img', isAuth, userController.deleteUserImage);

router.get('/userImage/:username/:img', isAuth, userController.getUserImages);

module.exports = router;