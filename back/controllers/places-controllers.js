// TIPS:
// 1. Error handling:
//    - If function is async, to throw error use this method:
//    const error = new HttpError('Error message', 500);
//    return next(error);
//    - If function is sync, to throw error use this method:
//    throw new HttpError('Error message', 404)
// 2. Data normalization:
//    - To make normal JS object from mongoDB record and normalize _id to id use following return:
//    res.json({place: place.toObject({getters: true})});
//    .toObject converts to normal JS object, getters: true converts _id to id

const {validationResult} = require('express-validator');
const mongoose = require("mongoose");

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

/**
 * Get single place by given ID
 */
const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    } else {
        res.json({place: place.toObject({getters: true})});
    }
}

/**
 * Get places by user id
 */
const getPlacesByUserId = async (req, res, next) => {
    // Method: 2
    const userId = req.params.uid;
    let userWithPlaces;

    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.length === 0) {
        return next(new HttpError('Could not find places for the provided user id', 404))
    } else {
        res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true}))});
    }

    // Method: 1
    // const userId = req.params.uid;
    // let places;
    //
    // try {
    //     places = await Place.find({creator: userId});
    // } catch (err) {
    //     const error = new HttpError('Something went wrong, could not find a place', 500);
    //     return next(error);
    // }
    //
    // if (!places || places.length === 0) {
    //     return next(new HttpError('Could not find places for the provided user id', 404))
    // } else {
    //     res.json({places: places.map(place => place.toObject({getters: true}))});
    // }
}

/**
 * Create single place.
 */
const createPlace = async (req, res, next) => {
    // Look for check function in route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const {title, description, address, creator} = req.body;
    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg',
        creator
    });

    let user;

    // Check user
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided ID', 404);
        return next(error);
    }

    try {
        // start session to create place and update user object, if one of process fail we need to undo everything
        // so we need session to handle this.
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();

    } catch (err) {
        const error = new HttpError('Creating place failed. please try again.', 500);
        return next(error);
    }

    res.status(201).json({place: createdPlace});
}

/**
 * Update single place by ID
 */
const updatePlace = async (req, res, next) => {
    // Look for check function in route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data', 422);
        return next(error);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});
};

/**
 * Delete single place by ID
 */
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    // Find place
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id', 404);
        return next(error);
    }

    // Delete place
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    res.status(200).json({message: 'Deleted place.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;