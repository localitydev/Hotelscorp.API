'use strict';

// Import Mongoose for SCHEMA management
    var mongoose = require('mongoose');

// Dependency Models
    var Hotel = require("./hotel").Hotel;
    var InvItem = require("./inventory").InvItem;

// Create New SCHEMA Class template
    var Schema = mongoose.Schema;


// Base SCHEMA for INVENTORY ITEM
    var OfferSchema = new Schema({

    });

// Enables the use of this Model
    var Offer = mongoose.model("Offer", OfferSchema);

    module.exports.Offer = Offer;


