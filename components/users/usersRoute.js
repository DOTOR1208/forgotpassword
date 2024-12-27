var express = require('express');
var { getRegister, postRegister, getLogin, postLogin, getForgotPassword, postForgotPassword, getResetPassword, postResetPassword} = require('./usersController');
var router = express.Router();                      //Sau postLogin là được thêm


//**********************************//
const usersController = require('./usersController');

router.get('/forgotpassword', usersController.getForgotPassword);  
router.post('/forgotpassword', usersController.postForgotPassword);  //Tùy chính (bỏ usersController máy không chạy được?)
//***********************************//

router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/login', getLogin);
router.post('/login', postLogin);

router.get('/resetpassword/:token', getResetPassword);
router.post('/resetpassword', postResetPassword);


module.exports = router;