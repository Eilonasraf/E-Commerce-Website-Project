const Order = require('../model/Order');
const mongoose = require('mongoose');


  exports.createOrder = async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  };
  
  // Get all orders
  exports.getOrders = async (req, res) => {
    const orders = await Order.find();
    res.status(200).json(orders);
  };
  
  exports.getOrder = async (req, res) => {
    const orderId = req.params.id;

    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).send('Invalid ObjectId');
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).send('Server Error');
    }
  };
  
  exports.updateOrder = async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(updatedOrder);
  };
  
  
  exports.deleteOrder = async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.status(204).send();
  };

  exports.checkout = async (req, res) => {
    if (!req.session.userId || !req.session.cart || req.session.cart.length === 0) {
        console.log('Error: No User ID or Cart is empty');
        return res.redirect('/error'); 
    }
  
    const userId = req.session.userId;
    const products = req.session.cart.map(product => product._id);
  
    const newOrder = new Order({
        userId: userId,
        products: products,
        status: 'pending',
    });
    
    try {
      await newOrder.save();
      
      // After saving the order, find it again in the DB and populate the products
      const populatedOrder = await Order.findById(newOrder._id).populate('products');
      
      if(!populatedOrder) {
        console.error('Order not found after creation');
        return res.redirect('/error');
      }
  
      req.session.cart = [];
      res.render('checkout', { orderId: populatedOrder._id.toString(), products: populatedOrder.products }); // Passing populated products
  
    } catch (error) {
      res.redirect('/error'); 
    }
  };
  
  exports.getUserOrders = async (req, res) => {
      try {
        if (!req.session || !req.session.userId) {
          return res.redirect('/error'); 
        }
        
        const userId = req.session.userId;
        const orders = await Order.find({ userId: userId }).populate('products');
        
        if (!orders) {
          return res.render('history', { orders: [] });
        }
    
        res.render('history', { orders: orders });
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.redirect('/error');
      }
  };
  

  exports.confirmation = async (req, res) => {
    try {
        const orderId = req.params.orderId; // assuming i have the order ID from somewhere, like a URL parameter
        const order = await Order.findById(orderId).populate('products');
        
        const products = order.products; // assuming products are populated and available on the order
        
        res.render('checkout', { orderId: orderId, products: products });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Error fetching order');
    }
  };

  exports.getAllOrdersGroupedByUser = async (req, res) => {
    try {
      if (!req.session || !req.session.isAdmin) {
        return res.redirect('/error'); 
      }

      const orders = await Order.find().populate({
        path: 'products',
        model: 'Product'
      }).populate({
        path: 'userId',
        model: 'User' 
      });
      

      if (!orders) {
        return res.render('adminOrderHistory', { ordersByUser: {} });
      }

      // Group orders by username
      const ordersByUser = {};
      orders.forEach((order) => {
        const username = order.userId.username;
        if (!ordersByUser[username]) {
          ordersByUser[username] = [];
        }
        ordersByUser[username].push(order);
      });

      // Render the HTML template with the data
      res.render('adminOrderHistory', { ordersByUser: ordersByUser });
    } catch (error) {
      res.redirect('/error'); 
    }
  };
