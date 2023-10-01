// productController.js

const Product = require('../model/Product');

/* API */
const axios = require('axios');
require('dotenv').config();
//const apiKey = process.env.OPEN_EXCHANGE_API_KEY;
/* API */


// Helper function to convert Buffer to Base64
function toBase64(buffer) {
    return buffer.toString('base64');
}

// Create a new product
exports.createProduct = async (req, res) => {
    try {
      const { name, price, category } = req.body;

      // Check if the image is uploaded (You'll implement this according to your setup)
      const imageFileName = req.file ? req.file.filename : null;

      const newProduct = new Product({
        name,
        price,
        category,
        imageData: imageFileName,

      });

      await newProduct.save();
      res.redirect('/');
    } catch (err) {
      console.error('Error creating product:', err);
      //console.log(req.file);
      res.status(500).send('Error creating product.');
    }
};


// Get all products

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        /* API */
        const usdToIls = await convertCurrency(); // Fetch the conversion rate
        console.log("USD to ILS Rate:", usdToIls); // Debug line
        /* API */
        const isAdmin = req.session.isAdmin || false;
        
        res.render('products/index', { 
            products, 
            /* API */
            usdToIls,  
            /* API */
            username: req.session.username, isAdmin,
            query: req.query 
        });
    } catch (error) {
        next(error);
    }
};




// Get a single product by ID
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

// Update a product by ID
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
        console.error("Error updating product:", error);
        res.status(500).send('Server error');
    }
};



// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndRemove(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        console.log(`Deleted product with ID: ${req.params.id}`);
        
        // Redirect back to the main product listing page
        res.redirect('/'); // You can specify the appropriate URL here
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Server error');
    }
};


// Display the product creation form
exports.getCreateProductForm = (req, res) => {
    // Check if the user is an admin
    if (req.session.isAdmin) {
        res.render('products/create', { imageFileName: null }); // Pass imageFileName to the template
    } else {
        // Handle cases where the user is not authorized to create a product
        res.status(403).send('You are not authorized to create a product.');
    }
};

// Display the product update form// Display the product update form
exports.getUpdateProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('products/update', { product, imageFileName: product.imageData });
        //console.log("Product data:", product);
        //console.log("Image file name:", product.imageData);
        //console.log("ID parameter:", req.params.id);


    } catch (error) {
        console.error('Error fetching product for update:', error);
        res.status(500).send('Server error');
    }
};


// Display the product deletion form
exports.getDeleteProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('products/delete-product', { product });

    } catch (error) {
        console.error('Error displaying delete form:', error);
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
      // Store the image file name in the request object for later use
      req.body.imageFileName = imageFileName;
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
        // Assuming you want to find products with a price close to the input
        // Adjust the range as necessary
        const range = 5; // Example range
        query.price = {
            $gte: Number(req.query.price) - range,
            $lte: Number(req.query.price) + range
        };
    }
    
    const products = await Product.find(query);
    res.render('products/index', { products,query: req.query, username: req.session.username, isAdmin: req.session.isAdmin });
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
      // Get item id from parameters
      const itemId = req.params.itemId;
      
      // Get cart from session or database
      let cart = req.session.cart || [];
  
      // Filter out the item with the provided id
      cart = cart.filter(item => item._id.toString() !== itemId);
  
      // Update session or database with new cart
      req.session.cart = cart;
  
      // Redirect back to the cart page
      res.redirect('/cart');
    } catch (error) {
      console.error(error);
      res.redirect('/error');  // Or handle error accordingly
    }
};

  

async function convertCurrency() {
    try {
        const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
        const rates = response.data.rates;
        const usdToIls = rates.ILS;
        return usdToIls;  // return the rate
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return undefined; // Return undefined in case of error
    }
}




exports.ensureAdmin = (req, res, next) => {
    console.log('Session:', req.session);
    if (!req.session || !req.session.isAdmin) {
        return res.status(403).send('Hey, Access denied');
    }
    next();
};

