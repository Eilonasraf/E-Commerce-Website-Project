// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path'); 
const cors = require('cors');
const app = express();
const session = require('express-session');
const methodOverride = require('method-override');


const UserController = require('./controller/UserController');
const productController = require('./controller/productController');
const orderController = require('./controller/orderController');
const adminController = require('./controller/adminController')  


const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes'); 


app.use(methodOverride('_method'));

app.use(
  session({
    secret: 'Ri0505838397o',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB Connection
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));


// Set up EJS view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use('/user', express.static(path.join(__dirname, 'public/user')));

const multer = require('multer');
const upload = multer({ dest: 'public/images' }); // Set the destination directory

// Login and Signup routes
app.post('/login', UserController.login);
app.post('/signup', UserController.signup);

// Define a route to serve the login page
app.get('/login', (req, res) => {
  res.render('login'); 
});

app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.get('/logout', UserController.logout);

app.get('/error', (req, res) => {
  res.render('error');
});


app.use((req, res, next) => {
  console.log('New request:', req.method, req.url);
  res.locals.username = req.session.username; // Make username available in all views
  next();
});

app.use('/', productRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/', orderRoutes);
app.use('/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
