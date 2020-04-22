var express = require('express');
var router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

var Grid = require('gridfs-stream');
var fs = require('fs');
const tj = require('templatesjs');

const conn = mongoose.createConnection(uri);
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

const PartyRoom = require('../models/partyRoom.model');

router.get('/', function (req, res) {
  var id = req.query.id;
  PartyRoom.findOne({ party_room_id: id }, (err, room) => {
    if (err) {
      console.log(err);
      res.status(400).send("Some Error Occurs...");
    }
    else if (room == null) res.status(404).send("Sorry, cannot find that");
    else {
      console.log("Room!!!!");
      console.log(room);
      fs.readFile("./website/room_info.html", (err, data) => {
        if (err) throw err;
        tj.set(data, (err, data) => {
          if (err) throw err;

          var list = {
            partyRoomName: room.party_room_name,
            address: room.address,
            district: room.district,
            // description: room.description,
            // partyRoomNumber: room.party_room_number,
            capacity: room.quotaMin + " - " + room.quotaMax,
            // price_setting: room.price_setting,
            // facilities: room.facilities,
            carouselContent: createCarouselContent(room)
          };

          tj.renderAll(list, (err, data) => {
            if (err) throw err;
            res.write(data);
            res.end()
          })
        })
      });
    }
  });
});

function createCarouselContent(room) {
  var indicators = "<ol class='carousel-indicators'>";
  var inner = "<div class='carousel-inner'>";

  for (let i = 0; i < room.photos.length; i++) {
    let image = "";
    gfs.files.findOne({ _id: room.photos[i] }, (err, file) => {
      if (!file || file.length === 0) console.log("Impossible: " + i);
      else {
        const readstream = gfs.createReadStream(file.filename);
        readstream.on('data', (chunk) => {
          image += chunk.toString('base64');
        });
        readstream.on('end', () => {
          if (!i) {
            indicators += "<li data-target='#carouselExampleControls' data-slide-to='" + i + "' class='active'></li>";
            inner += "<div class='carousel-item active'>" + createSlide(image, i) + "</div>";
          }
          else {
            indicators += "<li data-target='#carouselExampleControls' data-slide-to='" + i + "'></li>";
            inner += "<div class='carousel-item'>" + createSlide(image, i) + "</div>";
          }
        });
      }
    });
  }

  indicators += "</ol>";
  inner += "</div>";
  console.log(indicators + inner);
  return indicators + inner;
}

function createSlide(image, i) {
  return "<img class='d-block w-100' src='data:image/png;base64," + image + "' alt='" + i + "'></img>";
}

module.exports = router;
