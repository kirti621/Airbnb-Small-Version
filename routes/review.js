
const wrapAsync = require('../utils/wrapasyncs.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing');

const ExpressError = require("../utils/ExpressError.js");
const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviews.js');



const {
    isLoggedIn,
    isReviewOwner,
    validateReview
} = require('../middleware.js');

// POST review route
router.post(
    '/',
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// DELETE review route
router.delete(
    '/:reviewId',
    isLoggedIn,
    isReviewOwner,
    wrapAsync(reviewController.deleteReview)
);



module.exports = router;
