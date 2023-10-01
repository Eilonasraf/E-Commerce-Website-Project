/*
const Product = require('./model/Product');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Store', {useNewUrlParser: true, useUnifiedTopology: true});


const productsData = [
    {
      name: "STYLE GUIDE",
      category: "Guides",
      price: 9.99,
      imageData: "https://via.placeholder.com/150"
    },
    {
      name: "COFFEE POT",
      category: "Kitchenware",
      price: 88.50,
      imageData: "https://via.placeholder.com/150"
    },
    {
        name: "Wine",
        category: "Kitchenware",
        price: 100,
        imageData: "https://via.placeholder.com/150"
      },
      {
        name: "COFFEE",
        category: "Kitchenware",
        price: 30,
        imageData: "https://via.placeholder.com/150"
      },
  ];
  
// Function to add products to the database
const addProducts = async () => {
    try {
      for (let product of productsData) {
        const newProduct = new Product(product);
        await newProduct.save();
      }
      console.log('Products added successfully!');
      mongoose.connection.close();  // Close the database connection
    } catch (error) {
      console.error('Error adding products:', error);
    }
  }
  
  // Call the function
  addProducts(); */