// facebookRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        res.render('facebookLogin', { APP_ID: process.env.APP_ID });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/callback', (req, res) => {
    try {
        console.log(req.query); // You can log or use the received data here
        // Handle the data you receive from Facebook here
        res.redirect('/'); // Redirect to the homepage or wherever you want
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
