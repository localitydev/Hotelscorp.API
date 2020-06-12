'use strict';

/**
 * ================================================================
 * [EXPRESS APP Constants]
 * ================================================================
 */
    const express = require('express');
    const router = express.Router();

    const axios = require('axios');
    axios.defaults.baseURL = baseURL;


    const bodyParser = require('body-parser')

    // create application/json parser
    const jsonParser = bodyParser.json()

    // create application/x-www-form-urlencoded parser
    const urlencodedParser = bodyParser.urlencoded({ extended: false })

    // Hotel Schema for Hotel Creation
    const Hotel = require('../../models/hotel').Hotel;


/**
 * ================================================================
 * [EXPRESS Application ROUTES]
 * ================================================================
 */
    const app = express();

    // Show list of routes
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

    // CREATE Hotel
    router.post('/submit', urlencodedParser, (req, res, next) => {

        function parseHotelData(data) {
            console.log("Parsing hotel data:", data);
            return new Promise((resolve, reject) => {

                let hotelData = {

                // Document descriptive data
                    // created: { type: Date, default: Date.now },
                    // createdBy: String,
                    // modifiedBy: String,
                    modified: new Date(),

                // Details about the HOTEL
                    name: data.name,                                   // Name for Hotel
                    sams_id: Number(data.sams_id),            // In the case a number is NOT entered a default number of 0 is added for a return value.
                    isActive: (data.activeHotel === "on") ? true : false,      // Whether the hotel is active or not
                    ribbon: data.ribbon,
                    address: data.address,
                    phone_number: data.phone_number,
                    destination: data.destination,
                    location: data.location,
                    star_rating: Number(data.star_rating),
                    expedia: data.expedia_link,
                    amenities: data.hotel_amenities,
                    // featured image URL
                    // hotel-images URLS
                    languages: {
                        english: {
                            short_description: data.short_description,
                            long_description: data.long_description,
                            dining: data.dining,
                            entertainment: data.entertainment,
                            points_of_interest: data.points_of_interest,
                            policies: data.policies,
                            location: data.location_description
                        },
                        espanol: {
                            short_description: data.short_description_es,
                            long_description: data.long_description_es,
                            dining: data.dining_es,
                            entertainment: data.entertainment_es,
                            points_of_interest: data.points_of_interest_es,
                            policies: data.policies_es,
                            location: data.location_es
                        }
                    },

                // Data relating to BUSINESS needs or objectives. Example: Agent facing tools
                    business: {
                        hotel_amenities: data.business_hotel_amenities,
                        original_price: data.original_price,
                        from_price: data.from_price,
                        resort_fee: data.resort_fee,
                        external_hotel_id: data.external_hotel_id
                    }
                };

                resolve(hotelData);
            });
        }

        function submitData(data) {
            console.log("Submit Data");

            axios.post('api/hotel/create', data)
            .then(function(response){
                console.log("axios Success", response.data);
                res.render('admin/success', {message: "Hotel has been created"});
            }).catch(function(error){
                console.error("Submit Data Error.", error.response.statusText);
                res.render('admin/error', { message: error.response.statusText });
            });
        }

        var bodyData = req.body;

        // PARSE DATA TO CORRECTLY SEND
            parseHotelData(req.body)
        // SEND CORRECT DATA (HTTP POST REQUEST)
            .then(submitData);
    });

    // UPDATE Hotel
    router.post('/update/:hID', urlencodedParser, (req, res, next) => {
        let hID = req.params.hID;

        function parseHotelData(data) {
            // console.log("Parse this Data:", data);
            return new Promise((resolve, reject) => {

                let hotelData = {

                // Document descriptive data
                    // created: { type: Date, default: Date.now },
                    // createdBy: String,
                    // modifiedBy: String,
                    modified: new Date(),

                // Details about the HOTEL
                    name: data.name,                                   // Name for Hotel
                    sams_id: Number(data.sams_id),            // In the case a number is NOT entered a default number of 0 is added for a return value.
                    isActive: (data.activeHotel === "on") ? true : false,      // Whether the hotel is active or not
                    ribbon: data.ribbon,
                    address: data.address,
                    phone_number: data.phone_number,
                    destination: data.destination,
                    location: data.location,
                    star_rating: Number(data.star_rating),
                    expedia: data.expedia_link,
                    amenities: data.hotel_amenities,
                    // featured image URL
                    // hotel-images URLS
                    languages: {
                        english: {
                            short_description: data.short_description,
                            long_description: data.long_description,
                            dining: data.dining,
                            entertainment: data.entertainment,
                            points_of_interest: data.points_of_interest,
                            policies: data.policies,
                            location: data.location_description
                        },
                        espanol: {
                            short_description: data.short_description_es,
                            long_description: data.long_description_es,
                            dining: data.dining_es,
                            entertainment: data.entertainment_es,
                            points_of_interest: data.points_of_interest_es,
                            policies: data.policies_es,
                            location: data.location_description_es
                        }
                    },

                // Data relating to BUSINESS needs or objectives. Example: Agent facing tools
                    business: {
                        hotel_amenities: data.business_hotel_amenities,
                        original_price: data.original_price,
                        from_price: data.from_price,
                        resort_fee: data.resort_fee,
                        external_hotel_id: data.external_hotel_id
                    }
                };

                resolve(hotelData);
            });
        }

        function updateData(data) {
            // console.log("Update this data:", data);

            axios.put('/api/hotel/'+ hID, data)
            .then(function(response){
                console.log("axios PUT success", response.data);
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
                console.error("axios PUT error.", error.response.statusText);
                res.render('admin/error', { message: error.response.statusText });
            });
        }

        var bodyData = req.body;

        // PARSE DATA TO CORRECTLY SEND
            parseHotelData(req.body)
        // SEND CORRECT DATA (HTTP POST REQUEST)
            .then(updateData);
    });

    // EDIT Hotel
    router.get('/edit/:iID', (req, res, next) => {
        let iID = req.params.iID;

        console.log("Edit Params:", req.params);

        if( Number(req.params.iID) > 0) {
            // Pull all Hotels from Database
            Hotel.findOne({ sams_id: iID }, function(err, hotel){
                console.log("Edit Hotel Found:", hotel);
                // IF an ERROR occures while searching
                if (err) return next(err);

                console.log("Hotel Information passed", hotel);
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

    // DELETE INTEREST "ARE YOU SURE?"
    router.get('/delete/:iID', (req, res) => {
        let iID = req.params.iID;
        console.log("Client Delete page load.", iID);

        var allHotels = Hotel.findOne({sams_id: iID}, null, {limit:1}, (err, hotel) => {
            if(err) return next(err);

            res.render('admin/hotel/hotel-delete', hotel);
        });
    });

    // DELETE INTEREST "PERMENANTLY"
    router.get('/delete_submit/:hID', (req, res) => {
        let hID = req.params.hID;
        console.log("Client Request => Delete Hotel:", hID);

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
                console.log("axios Success");
                res.render('admin/success', successObj);
            }).catch(function(error){
                console.log("Deletion Error:", error);
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