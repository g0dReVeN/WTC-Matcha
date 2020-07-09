const express = require('express');

const userController = require('../controllers/userController');
const isAuth = require('../middleware/is-auth');
const imgUpload = require('../middleware/multer');

const router = express.Router();

// router.get('/users', isAuth , userController.getFilteredUsers);

router.patch('/edit-profile', isAuth , userController.patchEditProfile);

router.put('/addHistory', isAuth , userController.putHistory);

/** Update DB componenets and async */
router.get('/retrieveFilteredUsers', isAuth, userController.getFilteredUsers);

router.put('/addSingleUserImage', isAuth, imgUpload.any(), userController.putSingleUserImage);

router.put('/addMultipleUserImages', isAuth, imgUpload.any(), userController.putMultipleUserImages);

router.delete('/deleteUserImage/:img', isAuth, userController.deleteUserImage);

router.get('/userImage/:username/:img', isAuth, userController.getUserImages);

module.exports = router;