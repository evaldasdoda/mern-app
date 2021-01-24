const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

// Middlewares:

/**
 * Register body parser for sending json in body
 */
app.use(bodyParser.json());

/**
 * Routes registered
 */
app.use('/api/places', placesRoutes); // => /api/places/...
app.use('/api/users', userRoutes); // => /api/users/...

/**
 * Catch unsupported routes
 */
app.use(((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
}))

/**
 * Middleware function to handle global errors
 */
app.use(((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred'});
}))

// Connect to MongoDB
mongoose
    .connect('mongodb+srv://6GMTtk0fZrS5tIw2:6GMTtk0fZrS5tIw2@cluster0.5673o.mongodb.net/places?retryWrites=true&w=majority')
    .then(() => {
        // Basic configuration to listen to server
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err)
    });
