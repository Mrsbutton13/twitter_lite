const express = require('express');
const router = express.Router();
const db = require("../db/models");
const { check, validationResult } = require('express-validator')

const { Tweet } = db;
const tweetNotFoundError = id => {
    const error = Error(`Tweet with id ${id} was not found.`)
    // error.title = 'Tweet Not Found'
    error.status = 404
    return error
}

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next)

router.get('/', asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll({ order: ['createdAt'] })
    res.json({ tweets })
}))

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10)
    const tweet = await Tweet.findByPk(tweetId)
    if(tweet) {
        res.json({ tweet })
    } else {
        next(tweetNotFoundError(tweetId))
    }
}))

router.get("/", (req, res) => {
    res.json({ message: "test tweets index" });
});

const validateTweet = [ 
    check('message') 
    .exists({ checkFalsy: true })
    .withMessage("Tweet is empty, please try again!")
    .isLength({ max: 280 })
    .withMessage("This tweet is long!!!")
 ]

 
 const handleValidationErrors = (req, res, next) => {
     const validationErrors = validationResult(req);
  if(!validationErrors.isEmpty()){
      const errors = validationErrors.array().map((error) => error.msg)
      const err = Error("Bad request.");
      err.errors = errors;
      err.status = 400;
      err.title = "Bad request.";
      return next(err);
    }
    next()
    // TODO: Generate error object and invoke next middleware function
};

router.post('/', validateTweet, handleValidationErrors, asyncHandler(async(req, res) => {
   const { message } = req.body
   const tweet = await Tweet.create({ message })
   res.status(201).json({ tweet })
}))






module.exports = router;
