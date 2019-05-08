const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    callsign: {type: String, required: true},
    date: { type: Date, default: Date.now },
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    altitude: {type: Number, required: true},
    speed: {type: Number}
})

module.exports = mongoose.model('Aprs', schema);