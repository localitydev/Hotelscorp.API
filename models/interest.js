'use strict';

const https = require("https");

// Variables
    var locations = [
        "ANAHEIM",
        "BRANSON",
        "CANCUN",
        "COCOA BEACH",
        "DAYTONA BEACH",
        "GATLINBURG",
        "HOUSTON",
        "LAS VEGAS",
        "MESA",
        "MIAMI",
        "MYRTLE BEACH",
        "NEW TORK CITY",
        "OCOEE",
        "ORLANDO",
        "ORLANDO SOUTH",
        "PARK CITY",
        "PORT CANAVERAL",
        "PORT EVERGLADES",
        "TEST LOCATION",
        "TUNICA",
        "WILLIAMSBURG",
        "UNCATERGORIZED"
    ];

// Import Mongoose for SCHEMA management
    var mongoose = require('mongoose');

// Create New SCHEMA Class template
    var Schema = mongoose.Schema;

// COUNTER
    var CounterSchema = new Schema({
        _id: {type: String, required: true},
        seq: { type: Number, default: 0 }
    });
    var counter = mongoose.model('counter', CounterSchema);

// Interest SCHEMA
    var InterestSchema = new Schema({
        name: {type: String, required: true},
        interest_id: {type: Number, default: 0},
        interest_type: {type: String, default: "uncatergorized"},
        created: { type: Date, default: Date.now },
        destination: {
            type: String,
            enum: locations,
            default: "UNCATERGORIZED",
            required: true
        },
        address: String,
        coordinates: {
            latitude: String,
            longitude: String
        },
        hours_of_operation: {
            allDay: Boolean,
            sunday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            monday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            tuesday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            wednesday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            thursday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            friday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
            saturday: {
                open: {
                    type: String,
                },
                close: {
                    type: String,
                }
            },
        },
        external_link: String,
        yelp_link: String,
        yelp_id: String,
        open_table_link: String,
        open_table_id: String,
        languages: {
            en: {
                short_description: String,
                long_description: String
            },
            es: {
                short_description: String,
                long_description: String
            }
        }
    });



// Enables the use of this Model
    var Interest = mongoose.model("Interest", InterestSchema);

    // PRE-SAVE Middleware
    InterestSchema.pre("save", function(next){

        // Variables
        var interestObj = this;

        // Increment Interest_ID
        function incrementInterestID() {
            console.log("=== Auto Increment Offer ID number.");
            return new Promise(function(resolve, reject){
                // Auto Increment ID with a counterSchema
                counter.findByIdAndUpdate(
                    { _id: 'interest' },            // ID to find
                    { $inc: { seq: 1 } },           // Action to take
                    function(error, counter)   {    // Callback
                        if(error) return reject(error);
                        interestObj.interest_id = counter.seq;
                        resolve(interestObj);
                    }
                );
            });
        }

        function googleCoordinates(input) {
            console.log("Converting `INTEREST` address into coordinates");
            return new Promise(function(resolve, reject){
                // Reaching out to google maps API for address to coordinates conversion.
                console.log("Google Maps API call for coordinates", input.address);
                var address = input.address;

                var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+GMKEY;
                if( address === "" ) reject();

                https.get(url, (res) => {
                    // Capturing Data Chunks to create a response.
                    var body = '';
                    res.on('data', function(d) {
                        body += d;
                    });

                    // At the END of response chunking
                    res.on('end', () => {
                        var data = JSON.parse(body);
                        console.log("Coordinate Data Return:", data);

                        if(data.results.length > 0){
                            console.log("Latitude:", data.results[0].geometry.location.lat);
                            console.log("Longitude:", data.results[0].geometry.location.lng);

                            console.log("Coordinate Results check:", data.results.length);

                            if(!interestObj.coordinates.latitude) interestObj.coordinates.latitude = data.results[0].geometry.location.lat;
                            if(!interestObj.coordinates.longitude) interestObj.coordinates.longitude = data.results[0].geometry.location.lng;

                        }else{
                            console.log("No coordinate results.");
                            if(!interestObj.coordinates.latitude) interestObj.coordinates.latitude = 0;
                            if(!interestObj.coordinates.longitude) interestObj.coordinates.longitude = 0;
                        }

                        resolve(interestObj);
                    });

                }).on('error', (e) => {
                    console.error("HTTPS ERROR:", e);
                    reject(e);
                });

            });
        }

        // Run PROMISES
            // Increment UNIQUE interest ID
            incrementInterestID()
            // THEN - google Coordinates the address
            .then(googleCoordinates)
            // END - next();
            .then(function(){
                next();
            })
            // CATCH - any errors
            .catch(function(err){
                console.log("An Error has occured", err);
                next(err);
            });

    });

    module.exports.Interest = Interest;