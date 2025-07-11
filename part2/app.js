const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    secret: 'superSecretSession',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false // If set to true, it will not work
    }
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const dogServiceRoutes = require('../part1/routes/dog_service');

app.use('/api/dogs', dogServiceRoutes);
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;