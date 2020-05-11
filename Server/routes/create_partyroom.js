const multer = require('multer');
var express = require('express');
let PartyRoom = require('../models/partyRoom.model');
var RoomOwnership = require('../models/roomOwnership.model');
let Owner = require('../models/owner.model');

const uploadController = require("./uploadPhoto");
var router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const mongoose = require('mongoose');
mongoose.connect(uri);

const upload = multer({
  dest: 'uploads/',
  storage: multer.memoryStorage(),
});

router.get('/', function (req, res) {
  res.sendFile('partyroom_create.html', { 'root': "./website" });
});

router.post('/uploadPhoto', uploadController.uploadPhoto);

router.post('/create', function (req, res) {
  console.log(req.body);
  PartyRoom.find({}, 'party_room_id').sort({ party_room_id: -1 }).limit(1).exec(function (err, maxIdRoom) {
    if (err) res.send(err);
    if (maxIdRoom.length == 1) {
      maxId = maxIdRoom[0].party_room_id;
    }
    else {
      maxId = 0;
    }
    client.connect(err => {
      const collection = client.db("PartyRoomBooking").collection("photos.files");
      photoName1 = req.body.party_room_name + "_photo0";
      photoName2 = req.body.party_room_name + "_photo1";
      photoName3 = req.body.party_room_name + "_photo2";
      collection.find({ $or: [ { filename:  photoName1},  { filename:  photoName2}, { filename:  photoName3}] }).toArray((err, p) => {
        console.log(p);

        var partyroom = {
          party_room_id: maxId + 1,
          party_room_name: req.body.party_room_name,
          party_room_number: req.body.party_room_number,
          address: req.body.address,
          district: req.body.district,
          description: req.body.description,
          quotaMin: req.body.quotaMin,
          quotaMax: req.body.quotaMax,
          price_setting: [],
          facilities: [],
          photos: []
        };

        var day = req.body.day.replace(/'/g, '"');
        day = JSON.parse(day);

        var startTime = req.body.startTime.replace(/'/g, '"');
        startTime = JSON.parse(startTime);

        var endTime = req.body.endTime.replace(/'/g, '"');
        endTime = JSON.parse(endTime);

        var price = req.body.price.replace(/'/g, '"');
        price = JSON.parse(price);

        var facilities = req.body.facilities.replace(/'/g, '"');
        facilities = JSON.parse(facilities);

        for (var i = 0; i < day.length; i++) {
          partyroom.price_setting.push({
            day: day[i],
            startTime: parseInt(startTime[i]),
            endTime: parseInt(endTime[i]),
            price: parseInt(price[i])
          });
        }

        for (var i = 0; i < facilities.length; i++) {
          partyroom.facilities.push(facilities[i]);
        }

        for (var i = 0; i < p.length; i++) {
          partyroom.photos.push(p[i]._id);
        }

        console.log(partyroom);

        var r = new PartyRoom(partyroom);

        r.save(function (err) {
          if (err) res.send(err);
          else {
            var ownership = {
              owner_userName: req.session.user,
              party_room_id: partyroom.party_room_id
            };
            insertData = new RoomOwnership(ownership);
            insertData.save((err)=>{
              if(err) res.send(err);
              else {
                res.send("done");
              }
            });
          }
        });
      });
    });
  });
});

module.exports = router;
