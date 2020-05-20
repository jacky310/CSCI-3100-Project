// MongoDB & mongoose:
const router = require('express').Router();
const mongoose = require('mongoose');
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const conn = mongoose.createConnection(uri);

// Other packages:
const Owner = require('../models/owner.model');
const PartyRoom = require('../models/partyRoom.model');
const RoomOwnership = require('../models/roomOwnership.model');
const BookingRecord = require('../models/bookingRecord.model');
const bcrypt = require('bcrypt');
const Grid = require('gridfs-stream');
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

// send owner signup page
router.get('/', (req, res) => {
  res.sendFile('ownerSignup.html', { 'root': "./website" });
});

// send info of owner
router.post("/info", function (req, res) {
  Owner.findOne({ username: req.body.username }, (err, owner) => {
    if (err) throw err;
    else if (owner == null) res.send("notFound");
    else {
      res.send({
        companyName: owner.companyName,
        username: owner.username,
        email: owner.email,
        phone: owner.phone
      });
    }
  })
});

// Find all owner's party room 
router.post("/room", function (req, res) {
  RoomOwnership.find({ owner_userName: req.body.username }, (err, rooms) => {
    var result = [];
    if (err) throw err;
    else if (rooms.length == 0) res.send({ result: result });
    else {
      rooms.forEach(room => {
        PartyRoom.findOne({ party_room_id: room.party_room_id }, (err, r) => {
          if (err) throw err;
          else if (r != null) {
            var priceMax = -Infinity, priceMin = Infinity;
            r.price_setting.forEach(item => {
              if (item.price < priceMin) priceMin = item.price;
              if (item.price > priceMax) priceMax = item.price;
            });
            let image = "";
            // Find those party room photo
            gfs.files.findOne({ _id: r.photos[0] }, (err, file) => {
              if (!file || file.length === 0) {
                result.push({
                  id: r.party_room_id,
                  img: null,
                  title: r.party_room_name,
                  description: r.description,
                  capacity: r.quotaMin + " - " + r.quotaMax,
                  location: r.district,
                  price: priceMin + " ~ " + priceMax
                });
                if (result.length == rooms.length)
                  res.send({ result: result });
              }
              else {
                const readstream = gfs.createReadStream(file.filename);
                // Get the chunk of image and tran it to base64 for sending
                readstream.on('data', (chunk) => {
                  image += chunk.toString('base64');
                });
                // When all chunk of image have been got, send the searching those party room info as a result
                readstream.on('end', () => {
                  result.push({
                    id: r.party_room_id,
                    img: image,
                    title: r.party_room_name,
                    description: r.description,
                    capacity: r.quotaMin + " - " + r.quotaMax,
                    location: r.district,
                    price: priceMin + " ~ " + priceMax
                  });
                  if (result.length == rooms.length)
                    res.send({ result: result });
                });
              }
            });
          }
        })
      });
    }
  })
});

// Find all booking of owner's party room
router.post("/booking", function (req, res) {
  BookingRecord.find({ owner_userName: req.body.username }, (err, bookings) => {
    var result = [];
    if (err) throw err;
    else if (bookings.length == 0) res.send({ result: result });
    else {
      bookings.forEach(booking => {
        PartyRoom.findOne({ party_room_id: booking.party_room_id }, (err, room) => {
          if (err) throw err;
          else {
            result.push({
              room_id: room.party_room_id,
              room: (room == null) ? "unknown" : room.party_room_name,
              customer: booking.customer_userName,
              start: new Date(booking.time[0].bookingStart).toUTCString(),
              end: new Date(booking.time[0].bookingEnd).toUTCString(),
              num: booking.numPeople
            })
            if (result.length == bookings.length)
              res.send({ result: result });
          }
        });
      });
    }
  })
});

// Sign up: save the party room owner info
router.post('/add', (req, res) => {
  const companyName = req.body.companyName;
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const phone = req.body.phone;

  const new_owner = new Owner({
    companyName,
    name,
    username,
    email,
    password,
    phone,
  });

  new_owner.save()
    .then(() => res.redirect('/signupSuccess.html'))
    .catch(err => res.redirect('/ownerFail.html'));
});

module.exports = router;