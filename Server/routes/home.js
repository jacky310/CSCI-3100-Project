// MongoDB & mongoose:
const router = require('express').Router();
const mongoose = require('mongoose');
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const conn = mongoose.createConnection(uri);

// Other packages:
const PartyRoom = require('../models/partyRoom.model');
const Grid = require('gridfs-stream');
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

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
    if (err) res.send("Logout Fail");
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

  // Check the whether the end time is on the next day
  if (req.query.endtime <= req.query.starttime) {
    realEndTime = stringTranTime(req.query.endtime) + (60 * 24);
    day++;
    nextDay = true;
  }

  console.log(realEndTime);
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
            else if (overNightChecker && found.length == 0 && (buf + (60 * 24)) >= realEndTime) {
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
});;

module.exports = router;
