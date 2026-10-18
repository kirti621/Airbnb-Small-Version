const User = require('../models/user.js');
const passport = require('passport');
const ExpressError = require('../utils/ExpressError.js');
const listings = require('../models/listing.js');
const wrapAsync = require('../utils/wrapasyncs.js');

module.exports.Signup = (req, res) => {
    res.render('users/signup.ejs');
}


module.exports.signupform = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash('success', 'Welcome to the site!');
            return res.redirect('/listings');
        });

    } catch (e) {
        if (res.headersSent) {
            return next(e);
        }

        req.flash('error', e.message);
        return res.redirect('/signup');
    }
};

module.exports.loginform = (req, res) => {
    res.render('users/login.ejs');
}


module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');

    const redirectUrl = res.locals.redirectUrl || '/listings';

    delete req.session.redirectUrl;

    return res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', 'You have logged out successfully!');
        res.redirect('/login');
    });
}





   