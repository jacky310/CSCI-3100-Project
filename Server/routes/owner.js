const router = require('express').Router();
const bcrypt = require('bcrypt');
let Owner = require('../models/owner.model');
let PartyRoom = require('../models/partyRoom.model');
let RoomOwnership = require('../models/roomOwnership.model');

const mongoose = require('mongoose');
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const conn = mongoose.createConnection(uri);
var Grid = require('gridfs-stream');
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

router.get('/', (req, res) => {
  res.sendFile('ownerSignup.html', { 'root': "./website" });
});

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

router.post("/room", function (req, res) {
  RoomOwnership.find({ owner_userName: req.body.username }, (err, rooms) => {
    if (err) throw err;
    else if (rooms == null) res.send("notFound");
    else {
      var result = [];
      rooms.forEach(room => {
        PartyRoom.findOne({ party_room_id: room.party_room_id }, (err, r) => {
          if (err) throw err;
          else if (r != null) {
            let image = "";
            gfs.files.findOne({ _id: r.photos[0] }, (err, file) => {
              var priceMax = -Infinity, priceMin = Infinity;
              r.price_setting.forEach(item => {
                if (item.price < priceMin) priceMin = item.price;
                if (item.price > priceMax) priceMax = item.price;
              });
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
                readstream.on('data', (chunk) => {
                  image += chunk.toString('base64');
                });
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

router.post('/add', (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
  });
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