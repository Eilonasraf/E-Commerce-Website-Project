// userController.js

const User = require('../model/User');
const bcrypt = require('bcryptjs');  

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    // Set session variables
    req.session.username = user.username;
    req.session.userId = user._id; 
    req.session.isAdmin = user.isAdmin; 

    res.redirect('/');
};

exports.logout = async (req, res) => {
    req.session.username = null;
    req.session.isAdmin = false;
    res.redirect('/');
};

exports.signup = async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });

  try {
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error });
  }
};

exports.checkAdmin = async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  if (user.isAdmin) {
      res.status(200).json({ message: 'User is an admin' });
  } else {
      res.status(403).json({ message: 'User is not an admin' });
  }
};


// Operations of Admin
exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(user);
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
};
