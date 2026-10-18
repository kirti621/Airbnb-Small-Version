const Listing = require('../models/listing');
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require('../utils/wrapasyncs.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const { listingSchema } = require('../schema.js');
module.exports.index= async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
};
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author" }}).populate("owner"); // <-- REQUIRED HERE
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }
   console.log(listing);
   res.render('listings/show.ejs', { listing });
};
// module.exports.createListing = async (req, res) => {
//     // const { title, description, price, location, country } = req.body;
//     let response=awaitgeocodingClient.forwardGeocode({
//      query: req.body.listing.location,
//      limit: 2
//     })
//      .send()
    
//      res.send("done!");

//     let url = req.file.path;
//     let filename = req.file.filename;
//    let newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };
//     newListing.geometry= response.body.features[0].geometry;
//     let savedListing=await newListing.save();
//     console.log(savedListing);

//     req.flash('success', 'Listing created successfully!');
//     res.redirect('/listings');
// };
module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;
    
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    
    // Assign coordinates from Mapbox
    if (response.body.features.length) {
        newListing.geometry = response.body.features[0].geometry;
    }

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
};
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
        res.redirect('/listings');
    }
    let ListingImageUrl = listing.image.url;
    ListingImageUrl = ListingImageUrl.replace("/upload", "/upload/,h_300,w_250");

    res.render("listings/edit.ejs", { listing, ListingImageUrl });
};
// module.exports.updateListing = async (req, res) => {
//     if (!req.body.listing) {
//         throw new ExpressError(400, "Missing required listing data");
//     }
//     const { id } = req.params;
//     let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing });
//     if( typeof req.file !== "undefined" ){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = { url, filename };
//         await listing.save();
//     }
//     req.flash('success', 'Listing updated successfully!');
//     res.redirect(`/listings/${id}`);
// };
module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Missing required listing data");
    }
    const { id } = req.params;

    // 1. Find the existing listing first
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    // 2. Re-geocode if location changed or geometry is missing
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    if (response.body.features.length) {
        listing.geometry = response.body.features[0].geometry;
    }

    // 3. Update fields and optional new image
    Object.assign(listing, req.body.listing);

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
};
