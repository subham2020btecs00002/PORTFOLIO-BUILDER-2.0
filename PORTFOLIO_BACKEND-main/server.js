const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
connectDB();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // To parse JSON bodies with increased limit

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api', require('./routes/contactRoutes')); // Add this line

app.get("/",(req,res)=>{
    res.json("Hello world from Subham");
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
