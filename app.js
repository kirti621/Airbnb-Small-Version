if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.CLOUD_API_SECRET);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path= require('path');
const methodOverride = require('method-override');
const ejsmate = require('ejs-mate');
const { listingSchema , reviewSchema } = require('./schema.js');
const ExpressError = require("./utils/ExpressError.js");
const listing = require('./routes/listing.js');
const review = require('./routes/review.js');
const session = require('express-session');

// ✅ Correct for connect-mongo v6 with CommonJS
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');

// const mongo_url = 'mongodb://localhost:27017/myapp';
const dbUrl = process.env.ATLASDB_URL;


main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}  


// main().catch(err => console.error(err));



app.engine('ejs', ejsmate);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week        
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;        // <-- yeh zaroori hai
    res.locals.currentUser = req.user;     // <-- dono define rakhein
    next();
});

// app.get('/demouser', async (req, res) => {
//     let demoUser = new User({
//         username: "demoUser",
//         email: "student@example.com",
//         password: "demopassword"
//     }); 

//     let registeredUser = await User.register(demoUser, demoUser.password);
//     console.log('Demo user created successfully:', registeredUser);
//     res.send('Demo user created successfully');

// });



// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.use('/listings', listing);
app.use('/listings/:id/reviews', review);
app.use('/', userRoutes);



// app.get('/testlisting',async (req,res)=>{
//     let samplelisting = new listing({
//         title: "Sample Listing",
//         description: "This is a sample listing for testing.",
//         price: 100,
//         location: "Sample Location",
//         country: "Sample Country",
//     });
//     await samplelisting.save();
//     console.log('Sample listing created successfully');
//     res.send('Sample listing created successfully');
// });
 
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const {
        statusCode = 500,
        message = "Something went wrong!"
    } = err;

    res.status(statusCode).render("error", {
        err: {
            statusCode,
            message
        }
    });
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
