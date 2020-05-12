
// MongoDB & mongoose:
const router = require('express').Router();
const mongoose = require('mongoose');
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const conn = mongoose.createConnection(uri);

// Other packages:
const PartyRoom = require('../models/partyRoom.model');
const ObjectID = require('mongodb').ObjectID;
const Grid = require('gridfs-stream');
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});


router.get("/", function (req, res) {
  if (Object.keys(req.query).length == 0 || req.query.id == undefined)
    res.sendFile("404.html", { "root": "./website" });
  else
    res.sendFile("room_info.html", { "root": "./website" });
});

router.post("/", function (req, res) {
  PartyRoom.findOne({ party_room_id: req.body.id }, (err, room) => {
    if (err) throw err;
    else if (room == null) res.send("notFound");
    else {
      let photos = [];
      for (let i = 0; i < room.photos.length; i++) {
        gfs.files.findOne({ _id: ObjectID(room.photos[i]) }, (err, file) => {
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
