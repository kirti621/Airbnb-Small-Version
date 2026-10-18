const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapasyncs.js');
const { listingSchema , reviewSchema } = require('../schema.js');
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing');
const { isLoggedIn, isOwner,validateListing } = require('../middleware.js');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const { storage } = require('../cloudconfig.js');

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (jpg, jpeg, png, webp, avif) are allowed!'), false);
        }
    }
});
router.route('/')
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));
    
        




 // new route (wrapAsync hata dein kyunki renderNewForm plain sync function hai)
router.get('/new', isLoggedIn, listingController.renderNewForm);
   
router.route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));



// edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));


module.exports = router;