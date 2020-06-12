'use strict';

//  Google Maps Platform API KEY - AIzaSyB6VuJdIdr2E0EnX1v_pD8mUnkCY0VJrtY

// Dependencies
var express         = require('express');
var jsonParser      = require('body-parser').json;      // JSON Parser
var logger          = require('morgan');                // URL Query Parser

require('./globals');

// Application
var app             = express();
var routes          = require('./routes');

// Middleware
app.use(logger("dev"));
app.use(jsonParser({limit: '50mb'}));
// default options


// VIEW ENGINE
app.set('view engine', 'pug');

// STATIC FILES
app.use(express.static('./public'));


// ROUTES
    app.use(function(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        // PRE-FLIGHT requests
        if(req.method === "OPTIONS"){
            res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE");
            return res.status(200).json({});
        }

        next();
    });

// Homepage
    app.get('/', (req, res) => {
        res.render('admin/dashboard', { page_title: "RECENTLY ADD ITEMS" });
    });

// CLIENT ROUTES
    // INTERESTS
    var client_hotels = require('./routes/client/hotel');
    app.use('/hotel', client_hotels);

    // INTERESTS
    var client_interests = require('./routes/client/interest');
    app.use('/interest', client_interests);

// API Routers
    // MAINTENANCE
    var api_maintenance = require('./routes/api/maintenance');
    app.use('/api/maintenance', api_maintenance);

    // HOTELS
    var api_hotel = require('./routes/api/hotel');
    app.use('/api/hotel', api_hotel);

    // INVENTORY
    var api_inventory = require('./routes/api/inventory');
    app.use('/api/inventory', api_inventory);

    // INTEREST
    var api_interest = require('./routes/api/interest');
    app.use('/api/interest', api_interest);

    // QUESTIONS
    // app.use('/questions', routes);

    // CATCH 404 and forward to error handler
    // app.use(function(err, req, res, next){
    //     if (err.status === 404) {
    //         var err = new Error("URL Not Found.");
    //         err.status = 404;
    //         console.error("URL Not Found.")
    //         next(err);
    //     }

    //     next();
    //     res.render('404');
    // });


    // Error Handler
    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message
            }
        });

        // res.render('500');
    });

// PORT
    var port = process.env.PORT || 3000;
    process.env.TZ = "America/New_York";    // Sets time zone to EASTERN Time

// PORT Listening
    app.listen(port, () => {
        console.log("Express server is listening on port:", port);
    });