// MongoDB & mongoose:
const router = require('express').Router();

// Other packages:
const RoomOwnership = require('../models/roomOwnership.model');
const BookingRecord = require('../models/bookingRecord.model');
const PartyRoom = require('../models/partyRoom.model');

//Tran "08:30" to (8 * 60 + 30) mins
function stringTranTime(s) {
  var parts = s.match(/(\d+)\:(\d+)/),
    hours = parseInt(parts[1], 10) * 60,
    minutes = parseInt(parts[2], 10) + hours;
  return minutes;
}

//Get the day of the date
//day = "Monday to Thursday" or "Friday" or "Saturday" or "Sunday"
function getDayofDate(day) {
  if (day > 6) day = day % 6 - 1;
  if (day == 1 || day == 2 || day == 3 | day == 4) return "Monday to Thursday";
  else if (day == 5) return "Friday";
  else if (day == 6) return "Saturday";
  else return "Sunday";
}

//Handle the book party room req
router.post('/', (req, res) => {
  // set the query
  var query = [
    { $match: { "party_room_id": parseInt(req.body.partyRoomId) } },
  ];

  // add condition about starttime
  var d = new Date(req.body.start);
  day = d.getDay();
  var startDay = getDayofDate(day);
  var startTime = stringTranTime(req.body.starttime);
  query.push({ $match: { price_setting: { $elemMatch: { day: startDay } } } });
  query[1].$match.price_setting.$elemMatch["startTime"] = { $lte: startTime };

  // Check whether endtime is on the next day. If yes, endtime plus 24 hours
  var nextDay = false;
  var realEndTime = stringTranTime(req.body.endtime);
  if (req.body.endtime <= req.body.starttime) {
    realEndTime = stringTranTime(req.body.endtime) + 60 * 24;
    day++;
    nextDay = true;
  }
  // add condition about endtime
  var endDay = getDayofDate(day);
  var endTime = stringTranTime(req.body.endtime);
  query.push({ $match: { price_setting: { $elemMatch: { day: endDay } } } });
  query[2].$match.price_setting.$elemMatch["endTime"] = { $gte: endTime };
  if (nextDay) query[2].$match.price_setting.$elemMatch["startTime"] = { $eq: 0 };

  // Search from party room db, check whether the booking time is on the openning hours
  PartyRoom.aggregate(query, (err, r) => {
    if (err) res.send(err);
    else if (r.length == 0) res.send("not opening");
    else {
      var buf = null;
      var found = r[0].price_setting.filter(item => item.day === startDay).filter(item => item.startTime <= startTime);
      buf = found[0].endTime;
      var overNightChecker = false;
      var dayChecker = startDay;
      if (buf < realEndTime) {
        while (buf != null) {
          var found = r[i].price_setting.filter(item => item.day === dayChecker).filter(item => item.startTime == buf);
          if (!overNightChecker && found.length == 0 && buf >= realEndTime)
            break;
          else if (overNightChecker && found.length == 0 && (buf + 60 * 24) >= realEndTime)
            break;
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
        }
      }
      if (r.length == 0) res.send("not opening");
      else {
        // Check whether any other customer have booked in that time section
        BookingRecord.aggregate([
          { $match: { party_room_id: parseInt(req.body.partyRoomId) } },
          { $match: { time: { $elemMatch: { bookingStart: { $lte: new Date(req.body.start) }, bookingEnd: { $gte: new Date(req.body.end) } } } } },
          { $match: { time: { $elemMatch: { bookingStart: { $gte: new Date(req.body.start) }, bookingEnd: { $lte: new Date(req.body.end) } } } } },
          { $match: { time: { $elemMatch: { bookingStart: { $lte: new Date(req.body.start) }, bookingEnd: { $gte: new Date(req.body.start) } } } } },
          { $match: { time: { $elemMatch: { bookingStart: { $lte: new Date(req.body.end) }, bookingEnd: { $gte: new Date(req.body.end) } } } } }
        ], (err, rec) => {
          if (err) {
            res.send("occupied");
          }
          else {
            // if both seaching above is available, then save the booking on BookingRecord db
            if (rec.length == 0) {
              RoomOwnership.findOne({ party_room_id: parseInt(req.body.partyRoomId) })
                .exec((err, ownership) => {
                  if (err) res.send(err);
                  else {
                    record = new BookingRecord({
                      party_room_id: parseInt(req.body.partyRoomId),
                      owner_userName: ownership.owner_userName,
                      customer_userName: req.body.booker,
                      time: [{
                        bookingStart: req.body.start,
                        bookingEnd: req.body.end
                      }],
                      numPeople: parseInt(req.body.numPeople)
                    });
                    record.save(err => {
                      if (err) res.send(err);
                      else res.send("done");
                    });
                  }
                });
            }
            else res.send("occupied");
          }
        });
      }
    }
  });
});

module.exports = router;
