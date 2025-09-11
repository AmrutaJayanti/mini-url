const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000;
const mongoURI = process.env.MONGODB_URI;


//Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

// Apply the rate limiting middleware to all requests
app.use(limiter);


// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

//Routes
app.use('/api', require('./routes/url'));

//Health Check
app.get('/', (req, res) => {
    res.send('URL Shortener Service is running');
});

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected')
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.log(err));    