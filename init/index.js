const mongoose = require('mongoose');
const { data } = require('./data');
const Listing = require('../models/listing');
const initData = require("./data.js");

const mongo_url = 'mongodb://localhost:27017/myapp';

main()
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

async function main() {
    await mongoose.connect(mongo_url);
}

const initDB = async () => {
    await Listing.deleteMany({});
    console.log('Existing listings cleared');

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: '68f123456789abcdef123456'
    }));

    await Listing.insertMany(initData.data);

    console.log('Sample listings inserted successfully');
};

initDB();