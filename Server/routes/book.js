const express = require('express');
const router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');
const conn = mongoose.createConnection(uri);

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const RoomOwnership = require('../models/roomOwnership.model');
const BookingRecord = require('../models/bookingRecord.model');
const Owner = require('../models/owner.model');
const PartRoom = require('../models/partyRoom.model');

router.post('/', (req, res) => {
  console.log(req.body);
  RoomOwnership.findOne({party_room_id: parseInt(req.body.partyRoomId)})
  .exec((err, ownership)=>{
    record = new BookingRecord({
      party_room_id: parseInt(req.body.partyRoomId),
      owner_userName: ownership.owner_userName,
      customer_userName: req.body.booker,
      bookingStart: req.body.start,
      bookingEnd: req.body.end,
      numPeople: parseInt(req.body.numPeople)
    });
    record.save((err)=>{
      if(err) res.send(err);
      else {
        res.send("done");
      }
    });
  });
});

router.post('/addOwnership', (req, res)=>{
  ownership = {
    owner_userName: "owner3",
    party_room_id: 2
  };
  insertData = new RoomOwnership(ownership);
  insertData.save((err)=>{
    if(err) res.send(err);
    else {
      res.send("done");
    }
  });
});

module.exports = router;
