'use strict';

var express = require('express');
var router = express.Router();

// SCHEMA MODEL REQUIREMENTS
var Question = require("./models/models").Question;    // Example [delete]

var Hotel       = require("./models/hotel").Hotel;
var InvItem     = require("./models/inventory").InvItem;
var Offer       = require("./models/offer").Offer;
var Interest    = require("./models/interest").Interest;


// This will be executed whenever qID is present
// CALLBACK takes same parameters as middleware except the last parameter
// ...the last parameter is the parameter from the URL. In this case the qID
    router.param("qID", function(request, response, next, id){
        Question.findById(id, function(err, doc){
            if(err) return next(err);
            if(!doc) {
                err = new Error("Not Found");
                err.status = 404;
                return next(err);
            }

            // By placing the results on the "REQUEST" object, other middleware can use this document
            request.question = doc;
            return next();  // trigger the next middleware
        })
    });

    router.param("aID", function(request, response, next, id){
        // Mongoose has a special method on sub documents array called ID
        // ... the ID method takes an ID of a sub-document, and returns the document with that ID
        request.answer = request.question.answers.id(id);
        if(!request.answer) {
            err = new Error("Not Found");
            err.status = 404;
            return next(err);
        }
        next();
    });




// GET /questions
    router.get("/", function(request, response, next){
        // Return all the questions
        // IF a function is not the second parameter
        // Model.find( $specificObject, projection (return excerpts of objects), sort parameter, callback )
        Question.find({}, null, {sort: {createdAt: -1}}, function(err, questions){
            // Handle any ERRORS that may happen
            if(err) return next(err);
            response.json(questions);
        });
    });

// POST /questions
// Route for creating questions
    router.post("/", function(request, response){
        // Save a question
        var question = new Question(request.body);
        question.save(function(err, question){
            if (err) return next(err);
            response.status(201);
            response.json(question);
        });
    });

// GET /questions/:id
// Router for specific questions
    router.get("/:qID", function(request, response, next){
        // Get a specific question
        response.json(request.question);
    });

// POST /questions/:qID/answers
// Route for creating an answer
    router.post("/:qID/answers", function(request, response){
        // No need for another query for questions. Its already a part of the REQUEST
        request.question.answers.push(request.body);
        request.question.save(function(err, question) {
            if (err) return next(err);
            response.status(201);
            response.json(question);
        });
    });

// PUT /questions/:qID/anwsers/:aID
// Edit a specific answer
    router.put("/:qID/anwsers/:aID", function(request, response){
        request.answer.update(request.body, function(err, result){
            if (err) return next(err);
            response.json(result);
        });
    });

// DELETE /questions/:qID/anwsers/:aID
// delete a specific answer
    router.delete("/:qID/anwsers/:aID", function(request, response){
        request.answer.remove(function(err){
            request.question.save(function(err, question){
                if(err) return next(err);
                response.json(question);
            })
        });
    });


// POST /questions/:qID/anwsers/:aID/vote-up
// POST /questions/:qID/anwsers/:aID/vote-down
// Vote a specific answer
    router.post("/:qID/anwsers/:aID/vote-:dir", function(request, response, next){

            if( request.params.dir.search(/^up|down$/) === -1) {
                var err = new Error("Not Found");
                err.status = 404;
                next(err);
            }else{
                request.vote = request.params.dir
                next();
            }

        },
        function(request, response){
            request.answer.vote(request.vote, function(err, question){
                if(err) return next(err);
                response.json(question);
            });

            response.json({
                response: "You sent me a POST request to /vote-" + request.params.dir,
                questionId: request.params.qID,
                answerId: request.params.aID,
                vote: request.params.dir
            });
    });




module.exports = router;