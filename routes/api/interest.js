'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser')

const app = express()

// create application/json parser
const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// Hotel Schema for Hotel Creation
const Interest = require('../../models/interest').Interest;

// Get all INTERESTS
// ..Filter by: $Destination; $TypeOfInterest; ID-Number
router.get("/", function(req, res) {

    // Pull all Interests from Database
    Interest.find({}, function(err, interests){
        // IF an ERROR occures while searching
        if (err) return next(err);

        res.status(200);
        res.json(interests);
    });

});

// Create a new INTEREST
router.post("/", urlencodedParser, function(req, res, next) {

    function createInterest(interest) {
        console.log("Processing Interest:", interest.name);

        return new Promise(function(resolve, reject) {
            // SAVE new INTEREST
            var interestObj = req.body;

            var interest = new Interest(interestObj);
            interest.save(function(err, results){
                console.log("Interest Saved or Errored");
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Create One hotel OR Multiple Hotels
    if( (typeof req.body === "object") && (req.body !== null) ) {

        createInterest(req.body)
        .then(function(data){
            console.log("`INTEREST` saved.", data.interest_id);
            res.status(200);
            res.json({
                status_code: 200,
                data: data
            });
        })
        .catch(function(err){
            console.log("Error Inputting", err);
            res.status(500);
            res.json({
                status_code: 500,
                status_message: err
            });
        });
    }else{
        console.log("Invalid Request.");
        const err = new Error('Invalid Request.');
        next(err);
    }

    console.log("Interest POST call completed");
});


// IMPORT HOTEL LIST and SET ACTIVE and INACTIVE hotels
router.put("/:iID", function(req, res) {
    let iID = req.params.iID;

    function updateInterest(updateData) {
        console.log("Updating Interest:", updateData.coordinates);

        return new Promise(function(resolve, reject) {
            // Update INTEREST
            Interest.findOneAndUpdate({interest_id: iID}, updateData, {new:true, runValidators:true},function(err, result){
                if (err) return reject(err);
                console.log("Interest Saved");
                resolve(result);
            });
        });
    }

    // Create One hotel OR Multiple Hotels
    if( (typeof req.body === "object") && (req.body !== null) ) {

        updateInterest(req.body)
        .then(function(data){
            console.log("`INTEREST` updated.", data);
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
    }else{
        console.log("Invalid Request.");
        const err = new Error('Invalid Request.');
        next(err);
    }

    console.log("Interest POST call completed");
});


// IMPORT HOTEL LIST and SET ACTIVE and INACTIVE hotels
router.delete("/:iID", function(req, res, next) {
    let iID = req.params.iID;
    console.log("Delete Interest begin", iID);

    Interest.deleteOne({ interest_id: iID }, function (err) {
        if (err) return next(err);
    })
    .then(function(){
        console.log("`INTEREST` Deleted.");
        res.status(200);
        res.json({
            status_code: 200,
            data: "Delete interest successful"
        });
    })
    .catch(function(err){
        console.log("Error Deleting.");
        res.status(500);
        res.json({
            status_code: 500,
            status_message: err
        });
    });
});


module.exports = router;