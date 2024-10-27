    // productController.js

    const Product = require('../model/Product');
    const twitterController = require('../controller/twitterController');

    const axios = require('axios');
    require('dotenv').config();
    const apiKey = process.env.OPEN_EXCHANGE_API_KEY;

    const { TwitterApi } = require("twitter-api-v2");

        const client = new TwitterApi({
        appKey: process.env.API_KEY,
        appSecret: process.env.API_KEY_SECRET,
        accessToken: process.env.ACCESS_TOKEN,
        accessSecret: process.env.ACCESS_TOKEN_SECRET,
        });

    exports.createProduct = async (req, res) => {
        try {
            const { name, price, category } = req.body;
            const imageFileName = req.file ? req.file.filename : null;
    
            const newProduct = new Product({
                name,
                price,
                category,
                imageData: imageFileName,
            });
    
            await newProduct.save();

            // Tweet about the new product
            try {
                const tweetText = `Hey, I added a new product: 
                Product Name:${name},
                Price:${price},
                Category: ${category}!`;
                const rwClient = client.readWrite;
                await rwClient.v2.tweet(tweetText);
                console.log('Tweet posted successfully');
            } catch (tweetError) {
                console.error('Error posting tweet:', tweetError);
            }
            
            res.redirect('/');
        } catch (err) {
            res.status(500).send('Error creating product.');
        }
    };

    exports.getProducts = async (req, res, next) => {
        try {
            const products = await Product.find();
            const usdToIls = await convertCurrency(); 
            console.log("USD to ILS Rate:", usdToIls); 
            const isAdmin = req.session.isAdmin || false;
            
            res.render('products/index', { 
                products, 
                usdToIls,  
                username: req.session.username, isAdmin,
                query: req.query 
            });
        } catch (error) {
            next(error);
        }
    };

    exports.getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.render('products/show', { product: product });
        } catch (error) {
            res.status(500).send('Server error');
        }
    };

    exports.updateProduct = async (req, res) => {
        try {
            const imageFileName = req.file ? req.file.filename : null;
            const updatedData = {
                ...req.body,
                ...(imageFileName && { imageData: imageFileName })
            };

            const updatedProduct = await Product.findOneAndUpdate({ _id: req.params.id }, updatedData, {
                new: true,
                runValidators: true
            });

            if (!updatedProduct) {
                return res.status(404).send('Product not found');
            }

            res.redirect('/');
        } catch (error) {
            res.status(500).send('Server error');
        }
    };

    exports.deleteProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndRemove(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.redirect('/'); 
            
        } catch (error) {
            res.status(500).send('Server error');
        }
    };

    exports.getCreateProductForm = (req, res) => {
        if (req.session.isAdmin) {
            res.render('products/create', { imageFileName: null }); // Pass imageFileName to the template
        }
    };

    exports.getUpdateProductForm = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.render('products/update', { product, imageFileName: product.imageData });

        } catch (error) {
            res.status(500).send('Server error');
        }
    };

    exports.getDeleteProductForm = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.render('products/delete-product', { product });

        } catch (error) {
            res.status(500).send('Server error');
        }
    };

    exports.uploadProductImage = (req, res, next) => {
        if (!req.files || !req.files.image) {
        return res.status(400).send('No image file uploaded.');
        }
    
        const imageFile = req.files.image;
        const imageFileName = `product_${Date.now()}${path.extname(imageFile.name)}`;

        imageFile.mv(path.join(__dirname, '../public/images', imageFileName), (err) => {
        if (err) {
            return res.status(500).send('Error uploading image.');
        }
        req.body.imageFileName = imageFileName; // Store the image file name in the request object for later use
        next();
        });
    };

    exports.searchProduct = async (req, res) => {
        let query = {};
        
        if (req.query.name) {
            query.name = new RegExp(req.query.name, 'i');
        }

        if (req.query.category) {
            query.category = new RegExp(req.query.category, 'i');
        }

        if (req.query.price) {
            const range = 5; // Example range
            query.price = {
                $gte: Number(req.query.price) - range,
                $lte: Number(req.query.price) + range
            };
        }
        
        const products = await Product.find(query);
        res.render('products/index', { 
            products,query: req.query,
            username: req.session.username,
            isAdmin: req.session.isAdmin });
    };

    exports.addToCart = async (req, res) => {
        const productId = req.params.id;
        const product = await Product.findById(productId);
    
        if (!req.session.cart) {
        req.session.cart = [];
        }
    
        req.session.cart.push(product);
        res.redirect(`/?addedToCart=${productId}`);
    };

    exports.getCart = (req, res) => {
        const cartItems = req.session.cart || []; // Use the cart items from the session or default to an empty array
        res.render('cart', { cartItems, pageTitle: 'Your Cart' });
    };

    exports.removeItem = async (req, res) => {
        try {
        const itemId = req.params.itemId; 
        
        let cart = req.session.cart || []; // If the cart does not exist, it initializes an empty array.
    
        cart = cart.filter(item => item._id.toString() !== itemId); 
    
        req.session.cart = cart;  
    
        res.redirect('/cart');
        } catch (error) {
        res.redirect('/error');  
        }
    };

    exports.ensureAdmin = (req, res, next) => {
        if (!req.session || !req.session.isAdmin) {
            return res.status(403).send('Hey, Access denied');
        }
        next();
    };

    async function convertCurrency() {
        try {
            const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
            const rates = response.data.rates;
            const usdToIls = rates.ILS;
            return usdToIls; 
        } catch (error) {
            return undefined; 
        }
    }

