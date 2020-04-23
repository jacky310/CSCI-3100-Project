var express = require('express');
//let PartyRoom = require('../models/partyroom.model');
var router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
mongoose.connect(uri);

const PartyRoom = require("../models/partyRoom.model");

// var PartyRoomSchema = mongoose.Schema({
//   party_room_id: {type: Number, required: true, unique: true},
//   party_room_name: {type: String, required: true, unique: true},
//   party_room_number: {type: String, required: true},
//   address: {type: String, required: true},
//   district: {type: String, required: true},
//   description: {type: String},
//   quotaMic: {type: Number, required: true},
//   quotaMax: {type: Number, required: true},
//   price_setting: [{
//     day: String,
//     startTime: String,
//     endTime: String,
//     price: Number
//   }],
//   facilities: [String],
//   photos: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'photos.files'
//   }]
// });

router.get('/', function (req, res) {
    res.sendFile('partyroom_create.html', { 'root': "./website" });
});

router.route('/create').post((req, res) => {
    var data = req.body;
    console.log(data);
    client.connect(err => {
        PartyRoom.insertOne(data, (err) => {
            if (err) throw err;
            console.log("PartyRoom create Success!!!");
            res.send("CreateSuccess");
            res.redirect('/');
        });
         //return res.redirect('/');
    });
});

module.exports = router;
