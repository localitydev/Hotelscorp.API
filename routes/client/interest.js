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
    const Interest = require('../../models/interest').Interest;


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

        var allInterests = Interest.find({}, null, {limit:20, sort:{created:'desc'}}, (err, interests) => {
            if(err) return next(err);

            res.render('admin/interest/all', { "interests": interests });
            // res.send("Hello World!");
        });
    });

    // ADD Interest PAGE
    router.get('/add', (req, res, next) => {
        res.render('admin/interest/add');
    });

    // CREATE Interest
    router.post('/submit', urlencodedParser, (req, res, next) => {

        function parseInterestData(data) {
            // console.log("Parse this Data:", data);
            return new Promise((resolve, reject) => {

                let interestData = {
                    name: data.name,
                    interest_type: data.interest_type,
                    destination: data.destination,
                    address: data.address,
                    hours_of_operation: {
                        allDay: data.allday ? true : false,
                        sunday: {
                            open: data.sunday_open,
                            close: data.sunday_closed
                        },
                        monday: {
                            open: data.monday_open,
                            close: data.monday_closed
                        },
                        tuesday: {
                            open: data.tuesday_open,
                            close: data.tuesday_closed
                        },
                        wednesday: {
                            open: data.wednesday_open,
                            close: data.wednesday_closed
                        },
                        thursday: {
                            open: data.thursday_open,
                            close: data.thursday_closed
                        },
                        friday: {
                            open: data.friday_open,
                            close: data.friday_closed
                        },
                        saturday: {
                            open: data.saturday_open,
                            close: data.saturday_closed
                        },
                    },
                    external_link: data.external_link,
                    yelp_link: data.yelp_link,
                    yelp_id: data.yelp_id,
                    open_table_link: data.open_table_link,
                    open_table_id: data.open_table_id,
                    languages: {
                        en: {
                            short_description: data.short_description,
                            long_description: data.long_description
                        },
                        es: {
                            short_description: data.espanol_short_description,
                            long_description: data.espanol_long_description
                        }
                    }
                }

                resolve(interestData);
            });
        }

        function submitData(data) {
            console.log("Submit Data");

            axios.post('api/interest/', data)
            .then(function(response){
                console.log("axios Success");
                res.render('admin/success', {interest_id: response.data.data.interest_id});
            }).catch(function(error){
                console.log("Submit Data Error:", error);
                res.redirect('/interest/error');
            });
        }

        var bodyData = req.body;

        // PARSE DATA TO CORRECTLY SEND
            parseInterestData(req.body)
        // SEND CORRECT DATA (HTTP POST REQUEST)
            .then(submitData);
    });

    // UPDATE Interest
    router.post('/update/:iID', urlencodedParser, (req, res, next) => {
        let iID = req.params.iID;

        function parseInterestData(data) {
            // console.log("Parse this Data:", data);
            return new Promise((resolve, reject) => {

                let interestData = {
                    name: data.name,
                    interest_type: data.interest_type,
                    destination: data.destination,
                    address: data.address,
                    hours_of_operation: {
                        allDay: data.allday ? true : false,
                        sunday: {
                            open: data.sunday_open,
                            close: data.sunday_closed
                        },
                        monday: {
                            open: data.monday_open,
                            close: data.monday_closed
                        },
                        tuesday: {
                            open: data.tuesday_open,
                            close: data.tuesday_closed
                        },
                        wednesday: {
                            open: data.wednesday_open,
                            close: data.wednesday_closed
                        },
                        thursday: {
                            open: data.thursday_open,
                            close: data.thursday_closed
                        },
                        friday: {
                            open: data.friday_open,
                            close: data.friday_closed
                        },
                        saturday: {
                            open: data.saturday_open,
                            close: data.saturday_closed
                        },
                    },
                    external_link: data.external_link,
                    yelp_link: data.yelp_link,
                    yelp_id: data.yelp_id,
                    open_table_link: data.open_table_link,
                    open_table_id: data.open_table_id,
                    languages: {
                        en: {
                            short_description: data.short_description,
                            long_description: data.long_description
                        },
                        es: {
                            short_description: data.espanol_short_description,
                            long_description: data.espanol_long_description
                        }
                    }
                }

                resolve(interestData);
            });
        }

        function updateData(data) {
            // console.log("Update this data:", data);

            axios.put('/api/interest/'+ iID, data)
            .then(function(response){
                console.log("axios Put Success");
                // res.redirect('/interest/edit/' + iID);
                res.redirect('/interest/edit/success');
            }).catch(function(error){
                console.log("Update Data Error:");
            });
        }

        var bodyData = req.body;

        // PARSE DATA TO CORRECTLY SEND
            parseInterestData(req.body)
        // SEND CORRECT DATA (HTTP POST REQUEST)
            .then(updateData);
    });

    // EDIT Interest
    router.get('/edit/:iID', (req, res, next) => {
        let iID = req.params.iID;

        console.log("Edit Params:", req.params);

        if( Number(req.params.iID) > 0) {
            // Pull all Interests from Database
            Interest.find({ interest_id: iID }, function(err, interests){
                // console.log("Edit Interest Found:", interests);
                // IF an ERROR occures while searching
                if (err) return next(err);

                res.render('admin/interest/edit', interests[0]);
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

        var allInterests = Interest.find({interest_id: iID}, null, {limit:1}, (err, interests) => {
            if(err) return next(err);

            res.render('admin/interest/delete', interests[0]);
        });

    });

    // DELETE INTEREST "PERMENANTLY"
    router.get('/delete_submit/:iID', (req, res) => {
        let iID = req.params.iID;
        console.log("Client Request => Delete Interest:", iID);

        if( Number(req.params.iID) > 0) {
            // Delete Interest Document
            axios.delete('/api/interest/' + iID)
            .then(function(response){
                console.log("axios Success");
                res.render('admin/success', );
            }).catch(function(error){
                console.log("Deletion Error:", error);
                res.render('admin/error');
                res.redirect('/interest/delete_submit/error', error);
            });

        }else{
            switch(req.params.iID){
                case "success":

                    break;
                case "error":

                    break;
                default:
                    // REDIRECT to 404
                    res.render('404');
                    break;
            }
        }
    });



    module.exports = router;