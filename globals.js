'use strict';

const mongoose = require('mongoose');

console.log("[GLOBALS] included.");

// Axios default URL
let env = {
    DEV_API: 'DEVELOPMENT_URL',
    PROD_API: 'PRODUCTION_URL'
}

if (process.env.NODE_ENV === "development") {
    global.baseURL = env.DEV_API;
}else{
    global.baseURL = env.PROD_API;
}


// Google Maps Platform API key
global.GMKEY = "GOOGLE_MAPS_API";


// DATABASE Connection
// Connect to Database VIA URI
var dbURI = "MONGO_DB URI";
var dbOptions = {
    dbName: 'hci'
};


/* =================================================================
 * [   FILE UPLOAD   ] =============================================
 * ============================================================== */
    const aws                   = require('aws-sdk');
    const multer                = require('multer');
    const multerS3              = require('multer-s3');

    // DigitalOcean SPACES
    global.awsKey      = "AWSKEY";
    global.awsId       = "AWSID";
    global.endPointUrl = "ENDPOINTURL";

    // CONFIGURATION
    aws.config.update({
        secretAccessKey: awsKey,
        accessKeyId: awsId,
        region: 'REGION'
    });

    // Set S3 endpoint to DigitalOcean Spaces
    const spacesEndpoint = new aws.Endpoint(endPointUrl);
    const s3 = new aws.S3({
        endpoint: spacesEndpoint
    });

    global.upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'hci',
            acl: 'public-read',
            key: function (request, file, cb) {
                // Creates a folder for Hotel's SAMS_ID and places photo inside it with timestamp added to file name.
                cb(null, request.body.sams_id + '/' + new Date().getTime() + '-' + file.originalname);
            },
            metadata: function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            }
        })
    });

/* =================================================================
 * [   DATABASE CONNECTION   ] =====================================
 * ============================================================== */
    mongoose.connect(dbURI, dbOptions);

    // Monitor the database connection
    global.db = mongoose.connection;

    db.on("error", function(err){
        console.error("Database connection resulted in an error:", err);
    });

    // ONCE will only fire ONCE the EVENT occurs
    db.once("open", function(){
        console.log("Database connection was successful.");
    });
// [   END - DATABASE CONNECTION   ] ===============================