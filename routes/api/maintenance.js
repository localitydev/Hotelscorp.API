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
    const Entities = require('html-entities').AllHtmlEntities;

    const entities = new Entities();

    // Hotel Schema for Hotel Creation
    const Hotel                 = require('../../models/hotel').Hotel;



// IMPORT HOTEL LIST and SET ACTIVE and INACTIVE hotels
    router.get("/hotels/", function(req, res){
        console.log("======= BEGIN Pulling Data from Book-n-save.");

        // var affiliateId = 1003;

        let queueBookAndSave = () => {
            return new Promise((resolve, reject) => {
                console.log("STEP 1 - Get hotel data from Book-n-save");

                let url = "https://book-n-save.com/wp-json/wp/v2/hotel?per_page=100&page=1";

                axios.get(url)
                    .then((response) => {
                        console.log("STEP 1.1 - Book-n-save successfully called.", response.data);
                        // var data = JSON.parse(response.data);
                        resolve(response.data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        };

        let parseDataToSchema = (parsedData) => {
            return new Promise((resolve, reject) => {
                console.log("STEP 2 - Refactor data into HOTEL SCHEMA.");

                // Refactor each object according to HOTEL SCHEMA

                var parsedHotels = [];
                parsedData.map((hotel) => {
                    console.log("STEP 2.1: Refactoring Hotel", entities.decode(hotel.title.rendered));

                    let newHotel = {
                        name: entities.decode(hotel.title.rendered),
                        sams_id: parseInt(hotel.acf["hotel-sams_hotel_id"]),
                        ribbon: hotel.acf["hotel-select_ribbon"],
                        address: hotel.acf["hotel-address"],
                        phone_number: hotel.acf["hotel-phone_number"],
                        destination: hotel.acf["hotel-destination"],
                        star_rating: parseInt(hotel.acf["hotel-star_rating"]),
                        expedia_link: hotel.acf["hotel-expedia_link"],
                        hotel_amenities: hotel.acf["hotel-amenities"],
                        languages: {
                            english: {
                                long_description: entities.decode(hotel.acf["hotel-description"]),
                                dining: entities.decode(hotel.acf["hotel-dining"]),
                                entertainment: entities.decode(hotel.acf["hotel-entertainment"]),
                                points_of_interest: entities.decode(hotel.acf["hotel-point_of_interest"]),
                                policies: entities.decode(hotel.acf["hotel-policies"]),
                                location: entities.decode(hotel.acf["hotel-location"])
                            }
                        },
                        flex: {
                            two_night: hotel.acf["flex_hotel-2_night_price"],
                            three_night: hotel.acf["flex_hotel-3_night_price"],
                            four_night: hotel.acf["flex_hotel-4_night_price"]
                        },
                        tripadvisor: hotel.acf["tripadvisor_rating"],

                    // Data relating to BUSINESS needs or objectives. Example: Agent facing tools
                        business: {
                            hotel_amenities: entities.decode(hotel.acf["business_hotel-hotel_amenities"]),
                            original_price: entities.decode(hotel.acf["business_hotel-original_price"]),
                            from_price: entities.decode(hotel.acf["business_hotel-resort_fee"]),
                            resort_fee: entities.decode(hotel.acf["business_hotel-hotel_amenities"]),
                            external_hotel_id: entities.decode(hotel.acf["business_hotel-external_hotel_id"])
                        },
                        rooms: []
                    };

                    newHotel.flex.two_night = (hotel.acf["flex_hotel-2_night_price"]) ? parseInt(hotel.acf["flex_hotel-2_night_price"]) : "";
                    newHotel.flex.three_night = (hotel.acf["flex_hotel-3_night_price"]) ? parseInt(hotel.acf["flex_hotel-3_night_price"]) : "";
                    newHotel.flex.four_night = (hotel.acf["flex_hotel-4_night_price"]) ? parseInt(hotel.acf["flex_hotel-4_night_price"]) : "";

                    /**
                     * Function to take imported room data and parse it into the correct format
                     * @param  {[type]} newHotelData [Object containing properly structured Hotel details]
                     * @param  {[type]} wpRoomData   [Hotel data coming in from Book-N-Save]
                     * @return {[type]}              [Output of the Hoteldata with room details.]
                     */
                    var gatherRoomData = (newHotelData, wpRoomData) => {
                        console.log("2.2: Gathering Room Data.");
                        return new Promise((resolve, reject) => {
                            console.log("2.2.1: Checking if $wpRoomData is an array", wpRoomData);

                            if(wpRoomData.length > 0){
                                wpRoomData.forEach((value, index) => {
                                    console.log("2.2.2: Viewing Room Data.", value);

                                    let roomObj = {
                                        sams_room_type: value["room-sams_room_type"],
                                        room_title: value["room-title"],
                                        room_occupancy: value["room-occupancy"],
                                        room_desc: value["room-description"]
                                    }
                                    newHotelData.rooms.push(roomObj);
                                });

                                resolve(newHotelData);
                            }else{
                                resolve(newHotelData);
                            }

                        })
                    }
                    gatherRoomData(newHotel, hotel.acf["rooms"])
                        .then((hotelData) => {
                            parsedHotels.push(newHotel);
                        });
                });

                console.log("parseDataToSchema resolving...");
                resolve(parsedHotels);
            });
        };

        // Promise Chain for submitting data
        queueBookAndSave()
            .then(parseDataToSchema)
            .then((data) => {
                console.log("Send Data", data);
                axios.post('api/hotel/create', data)
                .then(function(response){
                    console.log("axios Success", response.data);
                    res.render('admin/success', {message: "Hotel has been created"});
                }).catch(function(error){
                    console.error("Submit Data Error.", error.response.statusText);
                    res.render('admin/error', { message: error.response.statusText });
                });
            })
            .catch((err) => {
                res.send(err);
            });
    });

// Download images and import them to correct Hotel Object.
    router.get("/images/", (req, res) => {
        // Dependencies for this request
        var fs = require('fs'),
            request = require('request');

        /**
         * Query Book-N-Save hotels for data
         * @return {object} return array of hotels
         */
        let queueBookAndSave = () => {
            return new Promise((resolve, reject) => {
                console.log("STEP 1 - Get hotel data from Book-n-save");

                let url = "https://book-n-save.com/wp-json/wp/v2/hotel?per_page=5&page=61";

                axios.get(url)
                    .then((response) => {
                        console.log("STEP 1.1 - Book-n-save successfully called.", response.data);
                        resolve(response.data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        };

        let downloadImages = (hotels) => {
            // STEP 2 - For Each returned Hotel
            console.log("STEP 2 - For Each returned Hotel");
            return Promise.all(hotels.map((hotel) => {
                return new Promise((resolve, reject) => {
                    // STEP 2.1 - Download images

                    var download = function(uri, filename, callback){
                        request.head(uri, function(err, res, body){
                            // console.log('content-type:', res.headers['content-type']);
                            // console.log('content-length:', res.headers['content-length']);

                            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                        });
                    };

                    // Temp directory for hotel image download
                    var returnObj = {
                        sams_id: hotel.acf["hotel-sams_hotel_id"],
                        hotel_featured: "",
                        hotel_images: [],
                        rooms: []
                    };

                    var dir = './public/uploads/'+returnObj.sams_id+'/';          // Hotel Directory
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }

                    // STEP 2.1.1 - Featured Hotel Image
                    if(hotel.better_featured_image !== null){
                        var featured_picture           = hotel.better_featured_image.media_details.file.split('/');
                        var featured_extension         = featured_picture[featured_picture.length-1].split('.');
                            returnObj.hotel_featured   = 'featured_'+hotel.slug+'.'+featured_extension[1];

                        let imageURL                   = "https://book-n-save.com/wp-content/uploads/"+hotel.better_featured_image.media_details.file;
                        let downloadToPath             = dir+returnObj.hotel_featured;
                        download(imageURL, downloadToPath, function(){
                            console.log("Download Complete.")
                            Hotel.findOneAndUpdate({sams_id: returnObj.sams_id}, {
                                hotel_featured_image: 'https://hci.nyc3.cdn.digitaloceanspaces.com/'+returnObj.sams_id+'/featured_'+hotel.slug+'.'+featured_extension[1]
                            }, {new:true, runValidators:true},function(err, result){
                                if (err) return reject(err);
                                resolve(result);
                            });
                        });
                    }

                    // STEP 2.1.2 - Hotel Images
                    var hotelImagesPromises = [];
                        hotel.acf['hotel-images'].forEach((image, index) => {
                            hotelImagesPromises.push(
                                new Promise((resolve, reject) => {
                                    if(image['hotel-image'].url){
                                        var picture             = image['hotel-image'].url.split('/');
                                        var picture_extension   = picture[picture.length-1].split('.');
                                        let imageURL            = image['hotel-image'].url;
                                        let downloadToPath      = dir+'/'+hotel.slug+'_'+index+'.'+picture_extension[1];
                                        download(imageURL, downloadToPath, function(){
                                            console.log("Download Complete.")
                                            resolve('https://hci.nyc3.cdn.digitaloceanspaces.com/'+returnObj.sams_id+'/'+hotel.slug+'_'+index+'.'+picture_extension[1]);
                                        });
                                    }
                                })
                            )
                        });
                    Promise.all(hotelImagesPromises).then((data) => {
                        // console.log("Hotel Image Promises", data);
                        Hotel.findOneAndUpdate({sams_id: returnObj.sams_id}, {
                            hotel_images: data
                        }, {new:true, runValidators:true},function(err, result){
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });


                    // STEP 2.1.3 - For Each Room
                    var hotelRoomPromises = [];
                    hotel.acf.rooms.forEach((room, index) => {
                        hotelRoomPromises.push(
                            new Promise((resolve, reject) => {
                                var roomsFolder = './public/uploads/'+returnObj.sams_id+'/rooms/';
                                if (!fs.existsSync(roomsFolder)){
                                    fs.mkdirSync(roomsFolder);
                                }
                                let roomName = room['room-sams_room_type'].replace(/ /g, '').toLowerCase().replace(/\//g, '');
                                let dir = './public/uploads/'+returnObj.sams_id+'/rooms/'+roomName;
                                if (!fs.existsSync(dir)){
                                    fs.mkdirSync(dir);
                                }


                                // Images
                                let roomImagePromises = [];

                                room['room-images'].forEach((roomImage, index) => {
                                    roomImagePromises.push(new Promise((resolve, reject) => {
                                        let picture = roomImage['room-image'].url.split('/');
                                        let picture_extension = picture[picture.length-1].split('.');
                                        download(roomImage['room-image'].url, dir+'/'+returnObj.sams_id+'-'+roomName+'-'+index+'.'+picture_extension[1], function(){
                                            resolve('https://hci.nyc3.cdn.digitaloceanspaces.com/'+returnObj.sams_id+'/rooms/'+roomName+'/'+returnObj.sams_id+'-'+roomName+'-'+index+'.'+picture_extension[1]);
                                        });
                                    }))
                                });
                                Promise.all(roomImagePromises).then((data) => {
                                    resolve({
                                        "sams_room_type": room['room-sams_room_type'],
                                        "room_images": data
                                    })
                                })
                            })
                        )
                    });
                    Promise.all(hotelRoomPromises).then((data) => {
                        data.forEach((room) => {
                            Hotel.updateOne(
                                {
                                    sams_id: returnObj.sams_id,
                                    "rooms.sams_room_type": room.sams_room_type
                                },
                                {
                                    $set: {"rooms.$.room_images": room.room_images}
                                },
                                {new:true, runValidators:true},
                                function(err, result){
                                    if (err) return reject(err);
                                    resolve(result);
                                }
                            );
                        })
                    })


                    // Return URL paths for images that were uploaded
                    resolve(returnObj);

                });
            }));
        };


        // STEP 1 - Query Book-n-Save hotel data
        queueBookAndSave()
        // STEP 2 - For Each returned Hotel
        .then(downloadImages)







        // Promise Array?
            // STEP 3 - Upload Images to SAMS_ID Folders
            .then((hotels) => {
                console.log("STEP 3 - ############################################################################################################");
                res.send(hotels);
            })
                // STEP 3.1 - Create SAMS_ID folder
                // STEP 3.2 - Upload featured image and hotel images to master folder
                    // STEP 3.2.1 - Be Sure to label featured image
                // STEP 3.3 - Create room name sub folder for each room
                    // STEP 3.3.1 - Upload images for room and label featured image
            // STEP 4 - Take uploaded image URLs and input them into database for each hotel.









        // res.send({complete:"complete"});
    });

module.exports = router;