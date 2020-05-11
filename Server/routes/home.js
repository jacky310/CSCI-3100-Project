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
const BookingRecord = require('../models/bookingRecord.model');

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

router.get("/account", (req, res) => {
  if (!(req.session.user == undefined)) {
    if (req.session.userType == "customer")
      res.sendFile('customer_info.html', { 'root': "./website" });
    else if (req.session.userType == "owner")
      res.sendFile("owner_info.html", { 'root': "./website" });
  }
  else res.sendFile("404.html", { 'root': "./website" });
});

var Grid = require('gridfs-stream');
var fs = require('fs');
const conn = mongoose.createConnection(uri);
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

function timeTranString(t) {
  var hours = Math.floor(t / 60),
    minutes = t % 60
  return { hours: hours, minutes: minutes };
}

function stringTranTime(s) {
  var parts = s.match(/(\d+)\:(\d+)/),
    hours = parseInt(parts[1], 10) * 60,
    minutes = parseInt(parts[2], 10) + hours;
  return minutes;
}

function getDayofDate(day) {
  if (day > 6) day = day % 6 - 1;
  if (day == 1 || day == 2 || day == 3 | day == 4) return "Monday to Thursday";
  else if (day == 5) return "Friday";
  else if (day == 6) return "Saturday";
  else return "Sunday";
}

router.get('/search', (req, res) => {
  var query = [
    { $match: { "party_room_name": req.query.partyRoomName } },
    { $match: { "district": req.query.district } },
    { $match: { "quotaMin": { $lte: parseInt(req.query.numPeople) } } },
    { $match: { "quotaMax": { $gte: parseInt(req.query.numPeople) } } },
  ];

  var d = new Date(req.query.date);
  day = d.getDay();
  var startDay = getDayofDate(day);
  var startTime = stringTranTime(req.query.starttime);
  query.push({ $match: { price_setting: { $elemMatch: { day: startDay } } } });
  query[4].$match.price_setting.$elemMatch["startTime"] = { $lte: startTime };
  query[4].$match.price_setting.$elemMatch["price"] = { $lte: parseInt(req.query.price) };

  var nextDay = false;
  var realEndTime = stringTranTime(req.query.endtime);
  if (req.query.endtime <= req.query.starttime) {
    realEndTime = stringTranTime(req.query.endtime) + 60 * 24;
    day++;
    nextDay = true;
  }
  var endDay = getDayofDate(day);
  var endTime = stringTranTime(req.query.endtime);

  query.push({ $match: { price_setting: { $elemMatch: { day: endDay } } } });
  query[5].$match.price_setting.$elemMatch["endTime"] = { $gte: endTime };
  if (nextDay) query[5].$match.price_setting.$elemMatch["startTime"] = { $eq: 0 };

  console.log(req.query);
  if (req.query.partyRoomName == '') query.splice(0, 1);
  if (req.query.district == '') query.splice(0, 1);
  require('util').inspect.defaultOptions.depth = null
  console.log(query);
  var result = [];
  PartyRoom.aggregate(query, (err, r) => {
    if (err) res.send(err);
    else {
      var deleteResult = [];
      for (var i = 0; i < r.length; i++) {
        var buf = null;
        var found = r[i].price_setting.filter(item => item.day === startDay).filter(item => item.startTime <= startTime);
        buf = found[0].endTime;
        var overNightChecker = false;
        var dayChecker = startDay;
        if (buf < realEndTime) {
          while (buf != null) {
            var found = r[i].price_setting.filter(item => item.day === dayChecker).filter(item => item.startTime == buf);
            if (!overNightChecker && found.length == 0 && buf >= realEndTime) {
              break;
            }
            else if (overNightChecker && found.length == 0 && (buf + 60 * 24) >= realEndTime) {
              break;
            }
            else if (found.length == 0) {
              deleteResult.push(i);
              break;
            }
            else {
              buf = found[0].endTime;
              if (buf == stringTranTime("23:59") && realEndTime > buf) {
                overNightChecker = true;
                dayChecker = endDay;
                buf = 0;
              }
            }
            console.log(buf);
          }
        }
        console.log("------");
      }
      for (var i = deleteResult.length - 1; i >= 0; i--)
        r.splice(i, 1);

      console.log(r);
      if (r.length == 0) {
        res.send({
          hasResult: r.length, result: result
        });
      }
      for (let i = 0; i < r.length; i++) {
        let image = "";
        gfs.files.findOne({ _id: r[i].photos[0] }, (err, file) => {
          var priceMax = -Infinity, priceMin = Infinity;
          r[i].price_setting.forEach(item => {
            if (item.price < priceMin) priceMin = item.price;
            if (item.price > priceMax) priceMax = item.price;
          });
          if (!file || file.length === 0) {
            result.push({
              id: r[i].party_room_id,
              img: null,
              title: r[i].party_room_name,
              description: r[i].description,
              capacity: r[i].quotaMin + " - " + r[i].quotaMax,
              location: r[i].district,
              price: priceMin + " ~ " + priceMax
            });
            if (result.length == r.length) {
              return res.send({
                hasResult: r.length, result: result
              });
            }
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
              capacity: r[i].quotaMin + " - " + r[i].quotaMax,
              location: r[i].district,
              price: priceMin + " ~ " + priceMax
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
      collection.findOne({ filename: "456_test2.jpg" }, (err, p) => {
        var a = {
          party_room_id: maxId + 1,
          party_room_name: "CUHK123",
          party_room_number: "12345678",
          address: "CUHK",
          district: "Kwun Tong",
          description: "香港中文大學，簡稱中文大學、中大、港中文，是一所坐落於香港沙田馬料水的公立研究型大學，也是香港第一所研究型大學。香港中文大學由新亞書院、崇基學院及聯合書院於1963年合併而成，現已發展成為轄九大書院的書院制大學。香港中文大學起源於清朝中期至民國初年在大陸地區成立的教會大學和私人大學，是香港歷史源流最久遠的高等學府。",
          quotaMin: 2,
          quotaMax: 20,
          price_setting: [{
            day: "Monday to Thursday",
            startTime: stringTranTime("08:00"),
            endTime: stringTranTime("12:00"),
            price: 50
          }, {
            day: "Monday to Thursday",
            startTime: stringTranTime("13:00"),
            endTime: stringTranTime("23:59"),
            price: 50
          },
          {
            day: "Friday",
            startTime: stringTranTime("00:00"),
            endTime: stringTranTime("07:00:"),
            price: 50
          }],
          facilities: ["VR", "Switch"],
          photos: []
        };
        a.photos.push(p._id);
        var r = new PartyRoom(a);

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