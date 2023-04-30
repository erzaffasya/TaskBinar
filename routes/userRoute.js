const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers/userController');
const userController = new UserController();
const { registerValidator, loginValidator } = require('../helpers/validator');
const { authAdmin, authNotVerif, auth } = require('../middlewares/authentication');
const validation = require('../middlewares/validation')
const { upload } = require('../middlewares/multer')


router.get('/user', authAdmin, userController.get);
router.get('/profile', auth, userController.profile);
router.get('/user/verify', userController.verify)
router.post('/register', validation(registerValidator), userController.register);
router.post('/login', validation(loginValidator), userController.login);
router.post('/send-verif', authNotVerif, userController.sendVerif);
router.post('/update-avatar', auth, upload.single('avatar'), userController.updateAvatar);
router.patch('/user', auth, upload.single('avatar'), userController.update);
router.delete('/user', authAdmin, userController.deleteByID);


router.post('/active-user/:id', authAdmin, userController.activeUser);
router.post('/disable-user/:id', authAdmin, userController.disableUser);

module.exports = router;
