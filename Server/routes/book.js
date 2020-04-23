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
const PartyRoom = require('../models/partyRoom.model');

function timeTranString(t){
  var hours = Math.floor(t / 60),
  minutes =  t % 60
  return {hours: hours, minutes: minutes};
}

function stringTranTime(s){
  var parts = s.match(/(\d+)\:(\d+)/),
  hours = parseInt(parts[1], 10)*60,
  minutes = parseInt(parts[2], 10)+hours;
  return minutes;
}

function getDayofDate(day){
  if (day > 6) day = day % 6 - 1;
  if (day == 1 || day == 2 || day == 3 | day == 4) return "Monday to Thursday";
  else if (day == 5) return "Friday";
  else if (day == 6) return "Saturday";
  else return "Sunday";
}

router.post('/', (req, res) => {
  console.log(req.body);
  var query = [
    { $match: {"party_room_id": parseInt(req.body.partyRoomId)} },
  ];

  var d = new Date(req.body.start);
  day = d.getDay();
  var startDay = getDayofDate(day);
  var startTime = stringTranTime(req.body.starttime);
  query.push({ $match: {price_setting: {$elemMatch:  { day: startDay }}}});
  query[1].$match.price_setting.$elemMatch["startTime"] = { $lte: startTime};

  var nextDay = false;
  var realEndTime = stringTranTime(req.body.endtime);
  if(req.body.endtime < req.body.starttime) {
    realEndTime = stringTranTime(req.body.endtime) + 60*24;
    day++;
    nextDay = true;
  }
  var endDay = getDayofDate(day);
  var endTime = stringTranTime(req.body.endtime);
  query.push({ $match: {price_setting: {$elemMatch:  { day: endDay }}}});
  query[2].$match.price_setting.$elemMatch["endTime"] = { $gte: endTime};
  if (nextDay) query[2].$match.price_setting.$elemMatch["startTime"] = { $eq: 0};

  var result = [];
  PartyRoom.aggregate(query, (err, r) => {
    console.log("12");
    console.log(r);
    if (err) res.send(err);
    else if (r.length == 0) {
      res.send("try again");
    }
    else {
      var buf = null;
      var found = r[0].price_setting.filter(item=>item.day === startDay).filter(item=>item.startTime <= startTime);
      buf = found[0].endTime;
      var overNightChecker = false;
      var dayChecker = startDay;
      if (buf < realEndTime){
        while (buf != null) {
          var found = r[i].price_setting.filter(item=>item.day === dayChecker).filter(item=>item.startTime == buf);
          if(!overNightChecker && found.length == 0 && buf >= realEndTime) {
            break;
          }
          else if(overNightChecker && found.length == 0 && (buf + 60*24) >= realEndTime) {
            break;
          }
          else if (found.length == 0) {
            r.splice(0, 1);
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
      if (r.length == 0) {
        res.send("try againg");
      }
      else {
        BookingRecord.aggregate([
          { $match: {party_room_id: parseInt(req.body.partyRoomId)} },
          { $match: {time: {$elemMatch: {bookingStart: {$lte: new Date (req.body.start)}, bookingEnd: {$gte: new Date(req.body.end)} }}} },
          { $match: {time: {$elemMatch: {bookingStart: {$gte: new Date (req.body.start)}, bookingEnd: {$lte: new Date (req.body.end)} }}} },
          { $match: {time: {$elemMatch: {bookingStart: {$lte: new Date (req.body.start)}, bookingEnd: {$gte: new Date (req.body.start)} }}} },
          { $match: {time: {$elemMatch: {bookingStart: {$lte: new Date (req.body.end)}, bookingEnd: {$gte: new Date (req.body.end)} }}} }
        ],(err, rec)=>{
          if (err) {
            console.log(err);
            res.send("booking fail");
          }
          else{
            if (rec.length == 0){
              RoomOwnership.findOne({party_room_id: parseInt(req.body.partyRoomId)})
              .exec((err, ownership)=>{
                if (err) res.send(err);
                else {
                  record = new BookingRecord({
                    party_room_id: parseInt(req.body.partyRoomId),
                    owner_userName: ownership.owner_userName,
                    customer_userName: req.body.booker,
                    time: [{
                      bookingStart: req.body.start,
                      bookingEnd: req.body.end,
                    }],
                    numPeople: parseInt(req.body.numPeople)
                  });
                  record.save((err)=>{
                    if(err) res.send(err);
                    else {
                      res.send("done");
                    }
                  });
                }
              });
            }
            else {
              res.send("try again");
            }
          }
        });
      }
    }
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
