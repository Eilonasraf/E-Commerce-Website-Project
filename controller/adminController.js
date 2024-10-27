const Product = require('../model/Product');
const User = require('../model/User');
const Order = require('../model/Order');
const axios = require('axios');

exports.renderGraphsPage = async (req, res) => {
    try {
        const userData = await fetchUserData();
        const productData = await fetchProductData();
        res.render('Graphs', {
            userData: userData,
            productData: productData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

async function fetchUserData() {
  try {
    const ordersPerUser = await Order.aggregate([
      { $group: { _id: '$userId', orderCount: { $sum: 1 } } }
    ]);
    if (!ordersPerUser) throw new Error('No orders per user data retrieved');

    const userData = await User.find().lean();
    if (!userData) throw new Error('No user data retrieved');

    return userData.map(user => {
      const userOrders = ordersPerUser.find(o => o._id.equals(user._id));
      return {
        name: user.username,
        ordersCount: userOrders ? userOrders.orderCount : 0
      };
    });
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    throw error;
  }
}

async function fetchProductData() {
    try {
      const productCount = await Product.aggregate([
        {
          $group: {
            _id: { $cond: [{ $gt: ['$price', 10] }, 'above10', 'below10'] },
            count: { $sum: 1 }
          }
        }
      ]);
      return productCount.map(group => ({ price: group._id, count: group.count }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  