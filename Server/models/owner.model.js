const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const owner_schema = new Schema({
    owner_name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
    },
    party_room_name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 5,
    }
}, {
    timestamps: true,
});

const Owner = mongoose.model('Owner', owner_schema);

module.exports = Owner;