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

const PartyRoom = require('../models/partyRoom.model');

router.post('/checkLogin', (req, res) => {
  var user = '';
  var isLogined = false;
  var userType = 'guest';
  if (!(req.session.user == undefined)) {
    user = req.session.user;
    isLogined = true;
    userType = req.session.userType
  }
  res.send({ user: user, isLogined: isLogined, userType: userType });
});

router.post('/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      res.send("Logout Fail");
    }
    res.redirect('/');
  });
});

var Grid = require('gridfs-stream');
var fs = require('fs');
const conn = mongoose.createConnection(uri);
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

function timeTran(s){
  var parts = s.match(/(\d+)\:(\d+)/),
  hours = parseInt(parts[1], 10)*60,
  minutes = parseInt(parts[2], 10)+hours;
  return minutes;
}

router.get('/search', (req, res) => {
  // console.log(req.query.starttime);
  var query = {
    "party_room_name": req.query.partyRoomName,
    "district": req.query.district,
    "quotaMin": { $lte: req.query.numPeople },
    "quotaMax": { $gte: req.query.numPeople },
    "price_setting.price": { $lte: req.query.price },
    "price_setting.startTime": { $lte: timeTran(req.query.starttime)},
    "price_setting.endTime": { $gte: timeTran(req.query.endtime)}
  }

  var d = new Date(req.query.date);
  day = d.getDay();
  if (day == 1 || day == 2 || day == 3 | day == 4) {
    query["price_setting.day"] = "Monday to Thursday";
  }
  else if (day == 5) {
    query["price_setting.day"] = "Friday";
  }
  else if (day == 6) {
    query["price_setting.day"] = "Saturday";
  }
  else {
    query["price_setting.day"] = "Sunday";
  }

  console.log(req.query);
  if (req.query.partyRoomName == '') delete query.party_room_name;
  if (req.query.district == '') delete query.district;
  console.log(query);
  var result = [];
  PartyRoom.find(query, (err, r) => {
    if (err) res.send(err);
    else {
      console.log(r);
      if (r.length == 0) {
        res.send({
          hasResult: r.length, result: result
        });
      }
      for (let i = 0; i < r.length; i++) {
        let image = "";
        gfs.files.findOne({ _id: r[i].photos[0] }, (err, file) => {
          if (!file || file.length === 0) {
            return res.status(404).json({
              err: 'No images'
            });
          }
          const readstream = gfs.createReadStream(file.filename);
          readstream.on('data', (chunk) => {
            image += chunk.toString('base64');
          });
          readstream.on('end', () => {
            result.push({
              id: r[i].party_room_id,
              img: image,
              title: r[i].party_room_name,
              description: r[i].description,
              capacity: "min: " + r[i].quotaMin + " max: " + r[i].quotaMax,
              location: r[i].district,
              price: "See More"
            });
            if (result.length == r.length) {
              return res.send({
                hasResult: r.length, result: result
              });
            }
          });
        });
      }
    }
  });
});

router.post('/addPartyTest', function (req, res) {
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
      collection.findOne({ filename: "456_test1.jpg" }, (err, p) => {

        var r = new PartyRoom({
          party_room_id: maxId + 1,
          party_room_name: "CUHK2",
          party_room_number: "12345678",
          address: "CUHK",
          district: "Kwun Tong",
          description: "香港中文大學，簡稱中文大學、中大、港中文，是一所坐落於香港沙田馬料水的公立研究型大學，也是香港第一所研究型大學。香港中文大學由新亞書院、崇基學院及聯合書院於1963年合併而成，現已發展成為轄九大書院的書院制大學。香港中文大學起源於清朝中期至民國初年在大陸地區成立的教會大學和私人大學，是香港歷史源流最久遠的高等學府。",
          quotaMin: 2,
          quotaMax: 20,
          price_setting: [{
            day: "Monday to Thursday",
            startTime: timeTran("08:00:00"),
            endTime: timeTran("12:00:00"),
            price: 50
          }, {
            day: "Friday",
            startTime: timeTran("14:00:00"),
            endTime: timeTran("20:00:00"),
            price: 50
          }],
          facilities: ["VR", "Switch"],
          photos: [p._id]
        });

        r.save(function (err) {
          if (err) res.send(err);
          else {
            res.send("done");
          }
        });
      });
    });
  });
});

module.exports = router;
