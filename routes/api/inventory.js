'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

// Hotel Schema for Hotel Creation
var InvItem = require('../../models/inventory').InvItem;

// Prior URL string is `/hotels/`

// CREATE Inventory Item
    router.post('/', function(req, res, next){
        function createInvItem(invItem) {
            console.log("Processing Inventory Item:", invItem.name);

            return new Promise(function(resolve, reject) {
                // Check if HOTEL exists in DATABASE via SAMS_ID
                InvItem.find({inventoryId: invItem.inventoryId}, function(err, results){
                    // IF an ERROR occurs while searching
                    if (err) return next(err);

                    // How many HOTELS were found?
                    if (results.length === 1) {
                        console.log("Inventory Item exists:", invItem.inventoryId);
                        itemsNotAdded.push({
                            invItem: invItem.name,
                            message: "Inventory Item exists"
                        });
                        // HOTEL exists. Continue.
                        resolve();
                    } else if(results.length > 1) {
                        var msg = "Multiple Inventory Items found with SAMS_ID: " + invItem.inventoryId + ".";
                        itemsNotAdded.push({
                            invItem: invItem.name,
                            message: msg
                        });
                        console.log(msg, invItem.name);
                        resolve();
                    } else {
                        var itemObj = {isActive: true};

                        // Checking if properties Exists
                        if (typeof(invItem.inventoryId  ) !== "undefined" && typeof(invItem.inventoryId ) === "string") itemObj.inventoryId = invItem.inventoryId         ;
                        if (typeof(invItem.category     ) !== "undefined" && typeof(invItem.category    ) === "string") itemObj.category    = invItem.category            ;
                        if (typeof(invItem.destination  ) !== "undefined" && typeof(invItem.destination ) === "string") itemObj.destination = invItem.destination         ;
                        if (typeof(invItem.name         ) !== "undefined" && typeof(invItem.name        ) === "string") itemObj.name        = invItem.name                ;
                        if (typeof(invItem.description  ) !== "undefined" && typeof(invItem.description ) === "string") itemObj.description = invItem.description         ;
                        if (typeof(invItem.gate_price   ) !== "undefined" && typeof(invItem.gate_price  ) === "string") itemObj.gate_price  = Number(invItem.gate_price)  ;
                        if (typeof(invItem.price        ) !== "undefined" && typeof(invItem.price       ) === "string") itemObj.price       = Number(invItem.price)       ;
                        if (typeof(invItem.cost         ) !== "undefined" && typeof(invItem.cost        ) === "string") itemObj.cost        = Number(invItem.cost)        ;
                        if (typeof(invItem.brand        ) !== "undefined" && typeof(invItem.brand       ) === "string") itemObj.brand       = invItem.brand               ;

                        // Creating New INVENTORY ITEM using InvItem MODEL
                        var newInvItem = new InvItem(itemObj);

                        // SAVE current Inventory Item
                        newInvItem.save(function(err, value){
                            if (err) return next(err);

                            console.log("Inventory Item Added", value.name);
                            itemsAdded.push(value);
                            resolve();
                        });
                    }
                });
            });
        }

        // Receive HOTELS from POST body
        var inventoryItems = req.body;

        // Returning Variables
        var itemsAdded = [];
        var itemsNotAdded = [];

        var invItemPromises = [];
        // Create One hotel OR Multiple Hotels
        if(!Array.isArray(inventoryItems)){
            console.log("Request Body is NOT an ARRAY");
            invItemPromises.push(createInvItem(inventoryItems));
        }else{
            console.log("Request Body is an ARRAY");
            // ADD HOTELS to database
            inventoryItems.forEach(function(inventoryItem, index){
                invItemPromises.push(createInvItem(inventoryItem));
            });
        }

        // After saving ALL hotels created
        Promise.all(invItemPromises)
        .then(function(){
            console.log("Hotel Promises Finished");
            res.status(200);
            res.json({
                message: "Completed",
                itemsAdded: itemsAdded,
                itemsNotAdded: itemsNotAdded
            });
        })

        console.log("Inventory Item POST call completed");
    });

// UPDATE Hotels
    router.put('/');
    // accepts an `ARRAY` of Hotels or array of hotels

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
    router.delete('/');
    // accepts an `ARRAY` of Hotels or array of hotels

module.exports = router;