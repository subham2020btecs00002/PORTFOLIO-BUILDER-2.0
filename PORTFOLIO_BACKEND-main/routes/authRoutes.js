// authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', authMiddleware, getUser);

module.exports = router;
