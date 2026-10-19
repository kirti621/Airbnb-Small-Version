const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const wrapAsync = require('../utils/wrapasyncs.js');
const userController = require('../controllers/user.js');
const ExpressError = require('../utils/ExpressError.js');   

router.route('/signup')
 .get(userController.Signup)
 .post(wrapAsync(userController.signupform));

router.route('/login')
 .get(userController.loginform)
 .post(saveRedirectUrl,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    }),
    userController.login
)

router.get('/logout', userController.logout);


module.exports=router;