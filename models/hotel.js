'use strict';

// Import Mongoose for SCHEMA management
    var mongoose = require('mongoose');

// Create New SCHEMA Class template
    var Schema = mongoose.Schema;

// Hotel SCHEMA
    var HotelSchema = new Schema({

    // Document descriptive data
        created: { type: Date, default: Date.now },
        createdBy: { type: String, default: "" },
        modifiedBy: { type: String, default: "" },
        modified: Date,

    // Details about the HOTEL
        name: { type:String, required: true },              // Name for Hotel
        sams_id: {type: Number, required: true},            // In the case a number is NOT entered a default number of 0 is added for a return value.
        isActive: {type: Boolean, default: false},          // Whether the hotel is active or not
        ribbon: { type: String, default: "none" },
        address: {type: String, required: true},
        phone_number: { type: String, default: "" },
        destination: { type: String, default: "" },
        location: { type: String, default: "" },
        star_rating: { type:Number, default: 0 },
        expedia_link: { type: String, default: "" },
        hotel_amenities: [String],
        hotel_featured_image: { type: String, default: "" },
        hotel_images: [String],
        languages: {
            english: {
                short_description: String,
                long_description: String,
                dining: String,
                entertainment: String,
                points_of_interest: String,
                policies: String,
                location: String
            },
            espanol: {
                short_description: String,
                long_description: String,
                dining: String,
                entertainment: String,
                points_of_interest: String,
                policies: String,
                location: String
            }
        },
        rooms: [{
            sams_room_type: String,
            room_title: String,
            room_amenities: String,
            room_occupancy: String,
            room_desc: String,
            featured_image: String,
            room_images: { type: [String], default: [] }
        }],
        flex: {
            two_night: String,
            three_night: String,
            four_night: String,
        },
        tripadvisor: String,

    // Data relating to BUSINESS needs or objectives. Example: Agent facing tools
        business: {
            hotel_amenities: String,
            original_price: String,
            from_price: String,
            resort_fee: String,
            external_hotel_id: String
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    });


// Enables the use of this Model
    var Hotel = mongoose.model("Hotel", HotelSchema);

    // PRE-SAVE Middleware
    HotelSchema.pre("save", function(next){

        console.log("Pre-SAVE:", this.name);
        console.log("Obtaining map coordinates...");

        next();
    });


    module.exports.Hotel = Hotel;