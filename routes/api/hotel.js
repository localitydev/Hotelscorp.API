'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

// Hotel Schema for Hotel Creation
var Hotel = require('../../models/hotel').Hotel;

// Prior URL string is `/hotels/`

// CREATE Hotels
    router.post('/create', function(req, res, next){
        function createHotel(hotel) {

            return new Promise(function(resolve, reject) {
                console.log("Processing Hotel:", hotel.name);

                // Check if HOTEL exists in DATABASE via SAMS_ID
                Hotel.find({ "sams_id": hotel.sams_id }, function(err, results){
                    // IF an ERROR occurs while searching
                    if (err) return next(err);

                    // How many HOTELS were found?
                    if (results.length >= 1) {
                        var msg = "Hotel already exists.";
                        var err = new Error(msg);
                        err.status = 500;
                        console.log(msg);

                        reject(err);
                    } else {
                        var msg = "Hotel not found: ";
                        console.log(msg, hotel);

                        var newHotel = new Hotel(hotel);
                        newHotel.save(function(err, value){
                            // console.log("Hotel Added", value);
                            if (err) return next(err);
                            resolve();
                        });
                    }
                });
            });
        }

        // Receive HOTELS from POST body
        var hotels = req.body;

        // Returning Variables
        var addedHotels = [];
        var notAddedHotels = [];
        var hotelPromises = [];
        if(!Array.isArray(hotels)){
            hotelPromises.push(createHotel(hotels));
        }else{
            // ADD HOTELS to database
            hotels.forEach(function(hotel, index){
                hotelPromises.push(createHotel(hotel));
            });
        }

        // After saving ALL hotels created
        Promise.all(hotelPromises)
        .then(function(){
            console.log("Hotel Promises Finished");
            res.status(200);
            res.json({
                status: "Completed",
                addedHotels: addedHotels,
                notAddedHotels: notAddedHotels
            });
        }).catch((err) => {
            res.json(err);
        });
    });

// UPDATE Hotels
    router.put('/:hID', (req, res, next) => {
        let hID = req.params.hID;

        function updateHotel(updateData) {
            console.log("Updating Hotel:", updateData);

            return new Promise(function(resolve, reject) {
                // Update INTEREST
                Hotel.findOneAndUpdate({sams_id: hID}, updateData, {new:true, runValidators:true},function(err, result){
                    if (err) return reject(err);
                    console.log("Hotel UPDATED.");
                    resolve(result);
                });
            });
        }

        updateHotel(req.body)
        .then(function(data){
            console.log("`HOTEL` updated.", data);
            res.status(200);
            res.json({
                status_code: 200,
                data: data
            });
        })
        .catch(function(err){
            console.log("Error Inputting.");
            res.status(500);
            res.json({
                status_code: 500,
                status_message: err
            });
        });

    });

// READ Hotels
    router.get('/', function(req, res){
        // Deliver a list of hotels
        Hotel.find({}, function(err, hotels){
            // IF an ERROR occurs while searching
            if (err) return next(err);

            res.status(200);
            res.json(hotels);
        });
    });

    // GET Routes: :hotelState/:hasDetails
    router.get("/:hotelState", function(req, res, next){
        if( req.params.hotelState.search(/^active|nonactive$/) === -1) {
            var err = new Error("Not Found");
            err.status = 404;
            next(err);
        }else{
            // Be default is active is false
            // ..If ACTIVE set isActive to true ELSE remain False
            // ..Search for hotels and return results.
            var isActive = false;
            if(req.params.hotelState === "active") isActive = true;
            Hotel.find({isActive: isActive}, function(err, results){
                res.status = 200;
                res.json(results);
            });
        }
    });

// DELETE Hotels
    router.delete('/:hID', (req, res, next) => {
        let hID = req.params.hID;

        console.log("Hotel ID to delete:", hID);

        Hotel.deleteOne({ sams_id: hID }, (err) => {
            if (err) return next(err);
        })
        .then(() => {
            console.log("HOTEL deleted");
            res.status(200);
            res.json({
                status_code: 200,
                data: "Delete HOTEL successful."
            });
        })
        .catch((err) => {
            console.log("Error deleting HOTEL.");
            res.status(500);
            res.json({
                status_code: 500,
                status_message: err
            });
        });
    });
    // accepts an `ARRAY` of Hotels or array of hotels

    router.post("*", function(req, res, next){
        var err = new Error("URL Not Found.");
        err.status = 404;
        next(err);
    });

module.exports = router;