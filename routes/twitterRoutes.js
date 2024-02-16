const express = require('express');
const twitterController = require('../controller/twitterController');
const router = express.Router();

router.get('/twitter', (req, res) => {
    res.render('twitter');
});

router.post('/twitter', twitterController.postTweet);

module.exports = router;
