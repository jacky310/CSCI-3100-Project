const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");
const Schema = mongoose.Schema;

const owner_schema = new Schema({
    companyName: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,

    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const owner = conn.model('owner', owner_schema);
module.exports = owner;
