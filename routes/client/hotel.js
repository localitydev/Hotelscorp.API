'use strict';

/**
 * ================================================================
 * [EXPRESS APP Constants]
 * ================================================================
 */
    const express               = require('express');
    const router                = express.Router();

    const axios                 = require('axios');
    axios.defaults.baseURL      = baseURL;

    const app = express();


    // Hotel Schema for Hotel Creation
    const Hotel                 = require('../../models/hotel').Hotel;

/**
 * ================================================================
 * [EXPRESS Application ROUTES]
 * ================================================================
 */


// Show list of Hotels
    router.get('/all', (req, res, next) => {
        // Get Total Documents
            // Get total created by user
            // Trash by document
        // Get Limited amount of Documents

        // SEARCH URL
        // ..Choices: all, add, edit, view
            // VIEW/:iID

        // , sort:{created:'desc'}
        var allHotels = Hotel.find({}, null, {sort:{created:'desc'}}, (err, hotels) => {
            if(err) return next(err);

            res.render('admin/hotel/hotel-all', { "hotels": hotels });
            // res.send("Hello World!");
        });
    });

// ADD Hotel PAGE
    router.get('/add', (req, res, next) => {
        res.render('admin/hotel/hotel-add');
    });

// EDIT Hotel
    router.get('/edit/:iID', (req, res, next) => {
        let iID = req.params.iID;

        // console.log("Edit Params:", req.params);

        if( Number(req.params.iID) > 0) {
            // Pull all Hotels from Database
            Hotel.findOne({ sams_id: iID }, function(err, hotel){
                // console.log("Edit Hotel Found:", hotel);
                // IF an ERROR occures while searching
                if (err) return next(err);

                // console.log("Hotel Information passed", hotel);
                res.render('admin/hotel/hotel-edit', hotel);
            });
        }else{
            switch(req.params.iID){
                case "success":
                    res.render('admin/success');
                    break;
                case "error":
                    res.render('admin/error');
                    break;
                default:
                    // REDIRECT to 404
                    res.render('404');
                    break;
            }
        }
    });

// CREATE Hotel
    router.post('/submit', upload.any(), (req, res, next) => {
        // console.log("Begin hotel creation:", req.body, req.files);

        // Saving the files uploaded by Multer to DigitalOcean Spaces
        var incomingFiles = req.files;

        // CREATE 1.0 - BUILDING Data in a way that can be correctly sent to MONGODB
        let parseHotelData = function(incomingData){
            // console.log("CREATE 1.0 - Incoming hotel data:", incomingData);
            return new Promise(function(resolve, reject){
                let hotelData = incomingData;       // The master object that will be formatted and passed to MONGODB
                let hotelRoomData = [];

                hotelData.created = new Date();
                hotelData.modified = new Date();
                // createdBy: String,
                // modifiedBy: String,

                // Refactoring the fields for MONGODB insert
                hotelData.isActive = (hotelData.activeHotel === "on") ? true : false;
                                     delete hotelData.activeHotel;

                /**
                 * Fields Refactoring
                 * ======================================
                 * FIRST - create a property for languages that is then set to an object
                 * SECOND - create an object for each property to be placed in.
                 * THIRD - create the proper Schema property and place the field's value in it.
                 * LAST - delete the old property to reduce the sending of unnecessary data
                 */


                    hotelData.flex = {};
                    hotelData.flex.two_night         = hotelData.flex_two;
                    hotelData.flex.three_night       = hotelData.flex_three;
                    hotelData.flex.four_night        = hotelData.flex_four;

                    // Business Details
                    hotelData.business = {};
                    hotelData.business.hotel_amenities          = hotelData.business_hotel_amenities;
                                                                  delete hotelData.business_hotel_amenities;
                    hotelData.business.original_price           = hotelData.original_price;
                                                                  delete hotelData.original_price;
                    hotelData.business.from_price               = hotelData.from_price;
                                                                  delete hotelData.from_price;
                    hotelData.business.resort_fee               = hotelData.resort_fee;
                                                                  delete hotelData.resort_fee;
                    hotelData.business.external_hotel_id        = hotelData.external_hotel_id;
                                                                  delete hotelData.external_hotel_id;

                    // English Content
                    hotelData.languages = {};
                    hotelData.languages.english = {};
                    hotelData.languages.english.short_description   = hotelData.short_description;
                                                                      delete hotelData.short_description;
                    hotelData.languages.english.long_description    = hotelData.long_description;
                                                                      delete hotelData.long_description;
                    hotelData.languages.english.dining              = hotelData.dining;
                                                                      delete hotelData.dining;
                    hotelData.languages.english.entertainment       = hotelData.entertainment;
                                                                      delete hotelData.entertainment;
                    hotelData.languages.english.points_of_interest  = hotelData.points_of_interest;
                                                                      delete hotelData.points_of_interest;
                    hotelData.languages.english.policies            = hotelData.policies;
                                                                      delete hotelData.policies;
                    hotelData.languages.english.location            = hotelData.location_description;
                                                                      delete hotelData.location_description;

                    // Spanish Fields Refactoring
                    hotelData.languages.espanol = {};
                    hotelData.languages.espanol.short_description   = hotelData.short_description_es;
                                                                      delete hotelData.short_description_es;
                    hotelData.languages.espanol.long_description    = hotelData.long_description_es;
                                                                      delete hotelData.long_description_es;
                    hotelData.languages.espanol.dining              = hotelData.dining_es;
                                                                      delete hotelData.dining_es;
                    hotelData.languages.espanol.entertainment       = hotelData.entertainment_es;
                                                                      delete hotelData.entertainment_es;
                    hotelData.languages.espanol.points_of_interest  = hotelData.points_of_interest_es;
                                                                      delete hotelData.points_of_interest_es;
                    hotelData.languages.espanol.policies            = hotelData.policies_es;
                                                                      delete hotelData.policies_es;
                    hotelData.languages.espanol.location            = hotelData.location_es;
                                                                      delete hotelData.location_es;

                // console.log("CREATE 1.1 - Hotel data is formatted to match HOTEL SCHEMA:", hotelData);
                resolve(hotelData);
            });
        };

        // CREATE 2.0 - Grab the file for "hotel_featured_image"
        let getHotelFeaturedImage = function(hotelData){
            // console.log("CREATE 2.0 - Looking through all the uploaded files for the 'hotel_featured_image' field:", incomingFiles);
            return new Promise(function(resolve, reject){

                /** [Used as a filter function to return only files that match field name to hotel_featured_image] */
                function checkForHotelFeaturedImage(obj){
                    return obj.fieldname === "hotel_featured_image";
                };

                // Filter files to retrieve hotel image data.
                hotelData.hotel_featured_image = incomingFiles.filter(checkForHotelFeaturedImage);

                if(hotelData.hotel_featured_image.length !== 0){
                    hotelData.hotel_featured_image = hotelData.hotel_featured_image[0].location.replace('hci.nyc3', 'hci.nyc3.cdn');
                    // console.log("CREATE 2.1 - 'hotel_featured_image' field image found:", hotelData.hotel_featured_image);
                }

                resolve(hotelData);
            });
        };

        // CREATE 3.0 - Grab all the files for "hotel_images"
        let getHotelImages = function(hotelData){
            // console.log("CREATE 3.0 - Grab all the files for 'hotel_images'");
            return new Promise(function(resolve, reject){
                /** [Used as a filter function to return only files that match field name to hotel_images] */
                function checkForHotelImage(obj){
                    return obj.fieldname === "hotel_images";
                };

                // Grab each image URL, change it to the CDN url
                function pushImageLocation(fileObj){
                    return new Promise(function(resolve, reject){
                        hotelData.hotel_images.push(fileObj.location.replace('hci.nyc3', 'hci.nyc3.cdn'));
                        resolve();
                    });
                }

                hotelData.hotel_images = [];
                let hotelImageObjs = incomingFiles.filter(checkForHotelImage);
                let hotelImages = hotelImageObjs.map(pushImageLocation);

                // Make sure to run all hotel image getting promises then pass the data to the next function
                Promise.all(hotelImages)
                .then(function(){
                    // console.log("CREATE 3.1 - Hotel images should be a part of the data now.:", hotelData);
                    resolve(hotelData);
                });

            });
        };

        // CREATE 4.0 - Parse all the room data from the field data to the image data
        let parseRoomData = function(hotelData){
            // console.log("CREATE 4.0 - Parse all the room data from the field data to the image data.");
            return new Promise(function(resolve, reject){
                let hotelRoomData = [];     // Container to place each room that was found. This will then be added to the hotelData object

                // Filter out all other data and leave only fields that contain in their name "room["
                let roomData = Object.keys(hotelData).filter(
                        (key) => { return key.indexOf('room[') == 0;
                    });

                if(roomData.length > 0){
                    // console.log("CREATE 4.1 - Room Data was found. Begin parsing data");
                    var refactorRoomData = function(roomData, index){
                        // console.log("CREATE 4.2."+index+" - Parsing a room", roomData);
                        return new Promise( function(resolve, reject){
                            // What Room index is this?
                            let roomIndex,
                            // What File Input Name am I parsing?
                                roomField;

                            // Example field name room[0]featured_image
                            // 'room' is the form field name
                            // '[0]' room index number
                            // 'featured_image' is the property name for this image
                            let splitPrefix = roomData.split("[");
                            let splitSuffix = splitPrefix[1].split("]");
                            roomIndex = Number(splitSuffix[0]);
                            roomField = splitSuffix[1];

                            // console.log("Parts of the Split:", splitSuffix);
                            // console.log("Original Data:", hotelData[roomData]);

                            // IF the specified INDEX of the new Data array does not have an object in it, create one and add this property
                            if(typeof hotelRoomData[roomIndex] === "undefined"){
                                hotelRoomData[roomIndex] = {};
                                hotelRoomData[roomIndex][roomField] = hotelData[roomData];
                                // delete hotelData[roomData]; // Field Clean up. No need for extra object keys when sending data to be reformatted
                            // ELSE add a new property to that object.
                            }else{
                                hotelRoomData[roomIndex][roomField] = hotelData[roomData];
                                // delete hotelData[roomData]; // Field Clean up. No need for extra object keys when sending data to be reformatted
                            }

                            resolve();

                        });
                    }

                    var refactorImageData =  function(imageData, index){
                        // console.log("CREATE 4.3."+index+" - Parsing a room's image data", imageData);
                        return new Promise(function(resolve, reject){
                            let fieldName = imageData.fieldname;

                            // What Room index is this?
                            let roomIndex,
                            // What File Input Name am I parsing?
                                roomField;

                            // Example field name room[0]featured_image
                            // 'room' is the form field name
                            // '[0]' room index number
                            // 'featured_image' is the property name for this image
                            let splitPrefix = fieldName.split("[");

                            if(splitPrefix.length < 2){
                                resolve();
                            }

                            let splitSuffix = splitPrefix[1].split("]");
                            roomIndex = Number(splitSuffix[0]);
                            roomField = splitSuffix[1];

                            // IF the specified INDEX of the new Data array does not have an object in it, create one and add this property
                            if(typeof hotelRoomData[roomIndex] === "undefined"){
                                hotelRoomData[roomIndex] = {};

                                let imageURL = imageData.location;
                                imageURL = imageURL.replace('hci.nyc3.', 'hci.nyc3.cdn.');

                                // Create an array of images
                                hotelRoomData[roomIndex][roomField] = [imageURL];
                            // ELSE add a new property to that object.
                            }else{

                                let imageURL = imageData.location;
                                imageURL = imageURL.replace('hci.nyc3', 'hci.nyc3.cdn');

                                // Push to the array that should have been created from above
                                if (typeof hotelRoomData[roomIndex][roomField] === "undefined") {
                                    hotelRoomData[roomIndex][roomField] = [imageURL]
                                }else{
                                    hotelRoomData[roomIndex][roomField].push(imageURL);
                                }
                            }
                        });
                    }

                    var refactoredData = roomData.map(refactorRoomData);
                    var refactoredImages = incomingFiles.map(refactorImageData);

                    // Now Parse through each of the returned keys and grab their data and place them into hotelRoomData[]
                    var results = Promise.all([refactoredData, refactoredImages]);

                    results.then( function(){
                        hotelData.rooms = hotelRoomData.filter(function(){return true;});
                        // console.log("CREATE 4.4 - Room data successfully parsed.", hotelData);
                        resolve(hotelData);
                    })
                    .catch(function(err){
                        // console.log("CREATE 4.4 - Room data ERROR.", err);
                        reject(err);
                    });
                }else{
                    // console.log("CREATE 4.1 - No room data. Passing hotel data to next promise.");
                    resolve(hotelData);
                };
            });
        };

        // CREATE 5.0 - Grab all the files for "hotel_images"
        let submitData = function(data) {
            // console.log("Submit Data");

            axios.post('api/hotel/create', data)
            .then(function(response){
                // console.log("axios Success", response.data);
                res.render('admin/success', {message: "Hotel has been created"});
            }).catch(function(error){
                // console.error("Submit Data Error.", error.response.statusText);
                res.render('admin/error', { message: error.response.statusText });
            });
        };

        // PROMISE CHAIN
        parseHotelData(req.body)
        .then( getHotelFeaturedImage )
        .then( getHotelImages        )
        .then( parseRoomData         )
        .then( submitData            )

        .catch(function(err){
            next(err);
        });
    });

// UPDATE Hotel
    router.post('/update/:hID', upload.any(), (req, res, next) => {
        let hID = req.params.hID;

        // Saving the files uploaded by Multer to DigitalOcean Spaces
        var incomingFiles = req.files;

        // UPDATE 1.0 - BUILDING Data in a way that can be correctly sent to MONGODB
        let parseHotelData = function(incomingData){
            // console.log("UPDATE 1.0 - Incoming hotel data:", incomingData);
            return new Promise(function(resolve, reject){
                let hotelData = incomingData;       // The master object that will be formatted and passed to MONGODB
                let hotelRoomData = [];

                hotelData.created = new Date();
                hotelData.modified = new Date();
                // createdBy: String,
                // modifiedBy: String,

                // Refactoring the fields for MONGODB insert
                hotelData.isActive = (hotelData.activeHotel === "on") ? true : false;
                                     delete hotelData.activeHotel;

                /**
                 * Fields Refactoring
                 * ======================================
                 * FIRST - create a property for languages that is then set to an object
                 * SECOND - create an object for each property to be placed in.
                 * THIRD - create the proper Schema property and place the field's value in it.
                 * LAST - delete the old property to reduce the sending of unnecessary data
                 */

                    hotelData.flex = {};
                    hotelData.flex.two_night         = hotelData.flex_two;
                    hotelData.flex.three_night       = hotelData.flex_three;
                    hotelData.flex.four_night        = hotelData.flex_four;

                    // Business Details
                    hotelData.business = {};
                    hotelData.business.hotel_amenities          = hotelData.business_hotel_amenities;
                                                                  delete hotelData.business_hotel_amenities;
                    hotelData.business.original_price           = hotelData.original_price;
                                                                  delete hotelData.original_price;
                    hotelData.business.from_price               = hotelData.from_price;
                                                                  delete hotelData.from_price;
                    hotelData.business.resort_fee               = hotelData.resort_fee;
                                                                  delete hotelData.resort_fee;
                    hotelData.business.external_hotel_id        = hotelData.external_hotel_id;
                                                                  delete hotelData.external_hotel_id;

                    // English Content
                    hotelData.languages = {};
                    hotelData.languages.english = {};
                    hotelData.languages.english.short_description   = hotelData.short_description;
                                                                      delete hotelData.short_description;
                    hotelData.languages.english.long_description    = hotelData.long_description;
                                                                      delete hotelData.long_description;
                    hotelData.languages.english.dining              = hotelData.dining;
                                                                      delete hotelData.dining;
                    hotelData.languages.english.entertainment       = hotelData.entertainment;
                                                                      delete hotelData.entertainment;
                    hotelData.languages.english.points_of_interest  = hotelData.points_of_interest;
                                                                      delete hotelData.points_of_interest;
                    hotelData.languages.english.policies            = hotelData.policies;
                                                                      delete hotelData.policies;
                    hotelData.languages.english.location            = hotelData.location_description;
                                                                      delete hotelData.location_description;

                    // Spanish Fields Refactoring
                    hotelData.languages.espanol = {};
                    hotelData.languages.espanol.short_description   = hotelData.short_description_es;
                                                                      delete hotelData.short_description_es;
                    hotelData.languages.espanol.long_description    = hotelData.long_description_es;
                                                                      delete hotelData.long_description_es;
                    hotelData.languages.espanol.dining              = hotelData.dining_es;
                                                                      delete hotelData.dining_es;
                    hotelData.languages.espanol.entertainment       = hotelData.entertainment_es;
                                                                      delete hotelData.entertainment_es;
                    hotelData.languages.espanol.points_of_interest  = hotelData.points_of_interest_es;
                                                                      delete hotelData.points_of_interest_es;
                    hotelData.languages.espanol.policies            = hotelData.policies_es;
                                                                      delete hotelData.policies_es;
                    hotelData.languages.espanol.location            = hotelData.location_es;
                                                                      delete hotelData.location_es;

                // console.log("UPDATE 1.1 - Hotel data is formatted to match HOTEL SCHEMA:", hotelData);
                resolve(hotelData);
            });
        };

        // UPDATE 2.0 - Grab the file for "hotel_featured_image"
        let getHotelFeaturedImage = function(hotelData){
            // console.log("UPDATE 2.0 - Looking through all the uploaded files for the 'hotel_featured_image' field:", incomingFiles);
            return new Promise(function(resolve, reject){

                /** [Used as a filter function to return only files that match field name to hotel_featured_image] */
                function checkForHotelFeaturedImage(obj){
                    return obj.fieldname === "hotel_featured_image";
                };

                // If the featured image exists, don't do anything. If it doesn't make it an empty string to
                // ...send in. (Empty string may mean a user removed the featured image and saved)
                hotelData.hotel_featured_image = hotelData.hotel_featured_image || "";

                // Filter files to retrieve hotel_featured_image data.
                let hotelImageFileUpload = incomingFiles.filter(checkForHotelFeaturedImage);
                // console.log("UPDATE 2.1 - 'hotelImageFileUpload' field image found:", hotelImageFileUpload);

                if(hotelImageFileUpload.length !== 0){
                    // console.log("UPDATE 2.2 - 'hotel_featured_image' field image found:", hotelImageFileUpload);
                    hotelData.hotel_featured_image = hotelImageFileUpload[0].location.replace('hci.nyc3', 'hci.nyc3.cdn');
                    // console.log("UPDATE 2.3 - 'hotel_featured_image' pathname:", hotelData.hotel_featured_image);
                }
                resolve(hotelData);
            });
        };

        // UPDATE 3.0 - Grab all the files for "new_hotel_images"
        let getHotelImages = function(hotelData){
            // console.log("UPDATE 3.0 - Grab all the files for 'new_hotel_images'");
            return new Promise(function(resolve, reject){
                /** [Used as a filter function to return only files that match field name to new_hotel_images] */
                function checkForHotelImage(obj){
                    return obj.fieldname === "new_hotel_images";
                };

                // Grab each image URL, change it to the CDN url
                function pushImageLocation(fileObj){
                    return new Promise(function(resolve, reject){
                        hotelData.hotel_images.push(fileObj.location.replace('hci.nyc3', 'hci.nyc3.cdn'));
                        resolve();
                    });
                }

                // IF hotel image data exists, then hotel images doesn't change, otherwise make
                // ...a property called hotel_images equal to an empty array: []
                if(typeof hotelData.hotel_images === "string"){
                    hotelData.hotel_images = [ hotelData.hotel_images ];
                }
                hotelData.hotel_images = hotelData.hotel_images || [];
                let hotelImageObjs = incomingFiles.filter(checkForHotelImage);
                let hotelImages = hotelImageObjs.map(pushImageLocation);

                // Make sure to run all hotel image getting promises then pass the data to the next function
                Promise.all(hotelImages)
                .then(function(){
                    // console.log("UPDATE 3.1 - Hotel images should be a part of the data now.:", hotelData);
                    resolve(hotelData);
                });
            });
        };

        // UPDATE 4.0 - Parse all the room data from the field data to the image data
        let parseRoomData = function(hotelData){
            // console.log("UPDATE 4.0 - Parse all the room data from the field data to the image data.", hotelData);
            return new Promise(function(resolve, reject){
                let hotelRoomData = [];     // Container to place each room that was found. This will then be added to the hotelData object

                // Filter out all other data and leave only fields that contain in their name "room["
                let roomData = Object.keys(hotelData).filter(
                        (key) => { return key.indexOf('room[') == 0;
                    });

                if(roomData.length > 0){
                    // console.log("UPDATE 4.1 - Room Data was found. Begin parsing data", roomData, hotelData);
                    var refactorRoomData = function(roomData, index){
                        // console.log("UPDATE 4.2."+index+" - Parsing a room", roomData);
                        return new Promise( function(resolve, reject){
                            // What Room index is this?
                            let roomIndex,
                            // What File Input Name am I parsing?
                                roomField;

                            // Example field name room[0]featured_image
                            // 'room' is the form field name
                            // '[0]' room index number
                            // 'featured_image' is the property name for this image
                            let splitPrefix = roomData.split("[");
                            let splitSuffix = splitPrefix[1].split("]");
                            roomIndex = Number(splitSuffix[0]);
                            roomField = splitSuffix[1];

                            // console.log("Parts of the Split:", splitSuffix);
                            // console.log("Original Data:", hotelData[roomData]);

                            // IF the specified INDEX of the new Data array does not have an object in it, create one and add this property
                            if(typeof hotelRoomData[roomIndex] === "undefined"){
                                hotelRoomData[roomIndex] = {};
                                hotelRoomData[roomIndex][roomField] = hotelData[roomData];
                                // delete hotelData[roomData]; // Field Clean up. No need for extra object keys when sending data to be reformatted
                            // ELSE add a new property to that object.
                            }else{
                                hotelRoomData[roomIndex][roomField] = hotelData[roomData];
                                // delete hotelData[roomData]; // Field Clean up. No need for extra object keys when sending data to be reformatted
                            }

                            resolve();

                        });
                    }

                    // var refactoredImages = incomingFiles.map(refactorImageData);
                    var refactoredData = roomData.map(refactorRoomData);

                    // Now Parse through each of the returned keys and grab their data and place them into hotelRoomData[]
                    // var results = Promise.all([refactoredData, refactoredImages]);
                    var results = Promise.all(refactoredData);

                    results.then( function(){
                        hotelData.rooms = hotelRoomData.filter(function(){return true;});
                        // console.log("UPDATE 4.4 - Room data successfully parsed.", hotelData);
                        resolve(hotelData);
                    })
                    .catch(function(err){
                        // console.log("UPDATE 4.4 - Room data ERROR.", err);
                        reject(err);
                    });
                }else{
                    // console.log("UPDATE 4.1 - No room data. Passing hotel data to next promise.");
                    resolve(hotelData);
                };
            });
        };

        // UPDATE 5.0 - Parse all Room Images
        let parseRoomImages = function(hotelData){
            console.log("// UPDATE 5.0 - Parse all Room Images");

            return new Promise(function(resolve, reject){

                // parse room_images
                // Parse new_room_images

                resolve(hotelData);
                // var refactorImageData =  function(imageData, index){
                //     console.log("UPDATE 4.3."+index+" - Parsing a room's image data", imageData);
                //     return new Promise(function(resolve, reject){
                //         let fieldName = imageData.fieldname;

                //         console.log("------- Field Name: ");
                //         console.log("------- ", fieldName);

                //         // What Room index is this?
                //         let roomIndex,
                //         // What File Input Name am I parsing?
                //             roomField;

                //         // Example field name room[0]featured_image
                //         // 'room' is the form field name
                //         // '[0]' room index number
                //         // 'featured_image' is the property name for this image
                //         let splitPrefix = fieldName.split("[");

                //         if(splitPrefix.length < 2){
                //             resolve();
                //         }

                //         let splitSuffix = splitPrefix[1].split("]");
                //         roomIndex = Number(splitSuffix[0]);
                //         roomField = splitSuffix[1];

                //         // IF the specified INDEX of the new Data array does not have an object in it, create one and add this property
                //         if(typeof hotelRoomData[roomIndex] === "undefined"){
                //             console.log("------- hotelRoomData["+roomIndex+"]: undefined");
                //             hotelRoomData[roomIndex] = {};

                //             let imageURL = imageData.location;
                //             imageURL = imageURL.replace('hci.nyc3.', 'hci.nyc3.cdn.');

                //             // Create an array of images
                //             hotelRoomData[roomIndex]["room_images"] = [imageURL];
                //         // ELSE add a new property to that object.
                //         }else{
                //             console.log("------- hotelRoomData["+roomIndex+"]: Defined");

                //             let imageURL = imageData.location;
                //             imageURL = imageURL.replace('hci.nyc3', 'hci.nyc3.cdn');

                //             // Push to the array that should have been created from above
                //             if (typeof hotelRoomData[roomIndex]["room_images"] === "undefined") {
                //                 hotelRoomData[roomIndex]["room_images"] = [imageURL];
                //             }else{
                //                 hotelRoomData[roomIndex]["room_images"].push(imageURL);
                //             }
                //         }
                //     });
                // }
            });
        }

        // UPDATE 6.0 - Send Information to Database
        let updateData = function(data) {
            // console.log("Update this data:", data);

            axios.put('/api/hotel/'+ hID, data)
            .then(function(response){
                // console.log("axios PUT success", response.data);
                let successObj = {
                    message: "Hotel has been updated.",
                    back_button: {
                        link: "/hotel/edit/" + hID,
                        label: "Back to Edit"
                    },
                    home_button: {
                        link: "/hotel/all",
                        label: "Return to Hotels"
                    }
                }
                res.render('admin/success', successObj);
            }).catch(function(error){
                // console.error("axios PUT error.", error.response.statusText);
                res.render('admin/error', { message: error.response.statusText });
            });
        };

        // PROMISE CHAIN
        parseHotelData(req.body)                // Properly Format Data Inputs
        .then( getHotelFeaturedImage )          // Update Hotel's Featured Image
        .then( getHotelImages        )          // Update Hotel Images
        .then( parseRoomData         )          // Update Room Data
        .then( parseRoomImages       )          // Update Room Images
        .then( updateData            )          // Store Data

        .catch(function(err){
            next(err);
        });

    });

// DELETE INTEREST "ARE YOU SURE?"
    router.get('/delete/:iID', (req, res) => {
        let iID = req.params.iID;
        // console.log("Client Delete page load.", iID);

        var allHotels = Hotel.findOne({sams_id: iID}, null, {limit:1}, (err, hotel) => {
            if(err) return next(err);

            res.render('admin/hotel/hotel-delete', hotel);
        });
    });

// DELETE INTEREST "PERMENANTLY"
    router.get('/delete_submit/:hID', (req, res) => {
        let hID = req.params.hID;
        // console.log("Client Request => Delete Hotel:", hID);

        // RENDER a SUCCESS or an ERROR
        if( Number(req.params.hID) > 0) {
            // Delete Hotel Document
            axios.delete('/api/hotel/' + hID )
            .then(function(response){
                let successObj = {
                    message: "Hotel has been successfully deleted.",
                    back_button: {
                        link: "/hotel/all",
                        label: "Return to Hotels"
                    }
                };
                // console.log("axios Success");
                res.render('admin/success', successObj);
            }).catch(function(error){
                // console.log("Deletion Error:", error);
                let successObj = {
                    message: "Something went wrong.",
                    back_button: {
                        link: "/hotel/all",
                        label: "Return to Hotels"
                    }
                };
                res.render('admin/error', );
            });

        }else{
            res.render('404');
        }
    });


    module.exports = router;