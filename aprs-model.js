import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

let schema = new Schema({
    callsign: {type: String, required: true},
    date: { type: Date, default: Date.now },
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    altitude: {type: Number, required: true},
    speed: {type: Number}
})

export default model('Aprs', schema);