// TIPS
// 1. One place can have only one user so we use just object, go to user.js to see vice versa.
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Model/schema for single place
 */
const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    address: {type: String, required: true},
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}
})

module.exports = mongoose.model('Place', placeSchema);