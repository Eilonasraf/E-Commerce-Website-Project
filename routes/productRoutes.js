//productRoutes.js

const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const path = require('path');


const multer = require('multer');
const upload = multer({ dest: 'public/images' });


router.get('/product/:id', productController.getProductById);

router.get('/', productController.getProducts);

router.post('/create', productController.ensureAdmin, productController.createProduct);

router.put('/:id', productController.ensureAdmin, productController.updateProduct);

// Route for displaying the product creation form (GET request)
router.get('/products/create', productController.getCreateProductForm);

// Route for handling the product creation (POST request)
router.post('/products/create', productController.ensureAdmin, upload.single('image'), productController.createProduct);

// Delete a specific product by ID (GET request for the confirmation page)
router.get('/products/delete/:id', productController.ensureAdmin, productController.getDeleteProductForm);

// Delete a specific product by ID (POST request for actual deletion)
router.post('/products/delete/:id', productController.ensureAdmin, productController.deleteProduct);

router.get('/products/update/:id', productController.ensureAdmin, productController.getUpdateProductForm);

router.post('/products/update/:id', productController.ensureAdmin, upload.single('image'), productController.updateProduct);

router.get('/search', productController.searchProduct);

router.get('/add-to-cart/:id', productController.addToCart);

router.get('/cart', productController.getCart);

router.get('/cart/remove/:itemId', productController.removeItem);


module.exports = router;