const Listing = require('./models/listing.js');
const express = require('express');
const{ listingSchema, reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');
const Review = require('./models/review.js');
module.exports = {
    isLoggedIn :(req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    next();
   },

    saveRedirectUrl : (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
    },
    isOwner: async (req, res, next) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing.owner.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to do that.');
            return res.redirect(`/listings/${id}`);
        }   

        next();
    },
    isReviewOwner: async (req, res, next) => {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review.author.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to do that.');
            return res.redirect(`/listings/${id}`);
        }
        next();
    },

    validateListing: (req, res, next) => {
        const { error } = listingSchema.validate(req.body.listing);
        if (error) {
            const msg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400, msg);
        }   
        next();
    },
    
    
validateReview: (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    }

    next();
}

}
