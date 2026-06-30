// portfolioRoutes.js
const express = require('express');
const router = express.Router();
const { createPortfolio, getPortfolio, updatePortfolio,checkPortfolioExists ,getPublicPortfolio,getPdfById} = require('../controllers/portfolioController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, upload.single('pdf'), createPortfolio);
router.put('/', authMiddleware, upload.single('pdf'), updatePortfolio);
router.get('/download/:id', getPdfById);
router.get('/', authMiddleware, getPortfolio);
router.get('/exists', authMiddleware, checkPortfolioExists); // New endpoint for checking portfolio existence
router.get('/public/:userId', getPublicPortfolio); // New endpoint for public portfolio

module.exports = router;
