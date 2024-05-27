//userRoutes.js

const express = require('express');
const userController = require('../controller/UserController');

const router = express.Router();

router.post('/create', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/:username/checkadmin', userController.checkAdmin);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
