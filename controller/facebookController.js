const Product = require('../model/Product');
const User = require('../model/User');
const Order = require('../model/Order');
const axios = require('axios');

exports.renderfacebookPage = async (req, res) => {
    try {
        res.render('facebookLogin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.callback = (req, res) => {
    try {
        res.render('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
