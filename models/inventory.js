'use strict';

// Import Mongoose for SCHEMA management
    var mongoose = require('mongoose');

// Create New SCHEMA Class template
    var Schema = mongoose.Schema;


// Base SCHEMA for INVENTORY ITEM
    var InvItemSchema = new Schema({
        inventoryId: {type: Number, default: 0},
        category: {type: String, default: ""},
        destination: {type: String, default: ""},
        name: {type: String, default: ""},
        description: {type: String, default: ""},
        gate_price: {type: Number, default: 0},
        price: {type: Number, default: 0},
        cost: {type: Number, default: 0},
        brand: {type: String, default: ""},
        isActive: {type: Boolean, default: false}
    });

// Enables the use of this Model
    var InvItem = mongoose.model("InvItem", InvItemSchema);

    module.exports.InvItem = InvItem;


