const express = require('express');
const router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

var Grid = require('gridfs-stream');

const conn = mongoose.createConnection(uri);
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

const PartyRoom = require('../models/partyRoom.model');

router.get("/", function (req, res) {
  if (Object.keys(req.query).length == 0 || req.query.id == undefined)
    res.sendFile("404.html", { "root": "./website" });
  else
    res.sendFile("room_info.html", { "root": "./website" });
});

router.post("/", function (req, res) {
  PartyRoom.findOne({ party_room_id: req.body.id }, (err, room) => {
    if (err) throw err;
<<<<<<< HEAD
    else if (room == null) res.status(404).send("404 not found");
    else res.send(room);
  });
});

router.post("/photos", function (req, res) {
  // console.log(req.body);
  gfs.files.findOne({ _id: req.body.id }, (err, file) => {
    if (err) throw err;
    if (!file || file.length === 0) console.log("Impossible");
=======
    else if (room == null) res.send("notFound");
>>>>>>> c7d3416002fc72b5e29a64ed6ad567a8d83263eb
    else {
      let photos = [];
      for (let i = 0; i < room.photos.length; i++) {
        gfs.files.findOne({ _id: room.photos[i] }, (err, file) => {
          if (err) throw err;
          if (!file || file.length === 0) console.log("Impossible");
          else {
            let image = "";
            const readstream = gfs.createReadStream(file.filename);
            readstream.on('data', chunk => {
              image += chunk.toString('base64');
            });
            readstream.on('end', () => {
              photos.push(image);
              if (i == room.photos.length - 1)
                res.send({ room: room, photos: photos });
            });
          }
        });
      }
    }
  });
});

module.exports = router;
