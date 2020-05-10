var express = require('express');
var router = express.Router();

const uploadController = require("./uploadPhoto");

// MongoDB & mongoose:
const mongo = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

const conn = mongoose.createConnection(uri);
let gfs;

const Owner = require("../models/owner.model");
const PartyRoom = require("../models/partyRoom.model");

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

router.post("/ownerValidate", (req, res) => {
  var data = req.body;
  //console.log(data);
  client.connect(err => {
    Owner.findOne({ username: data.username }, (err, owner) => {
      if (owner != null)
        res.send("usernameUsed");
      else {
        Owner.findOne({ email: data.email }, (err, owner) => {
          if (owner != null)
            res.send("emailRegistered");
          else res.send("pass");
        });
      }
    });
  });
});

router.post("/partyroomValidate", (req, res) => {
  var data = req.body;
  //console.log(data);
  client.connect(err => {
    PartyRoom.findOne({ party_room_name: data.partyRoomName }, (err, owner) => {
      if (owner != null)
        res.send("partyroomRegistered");
      else res.send("pass");
    });
  });
});

//signup not done
//cannot parse data
router.post('/signup', (req, res) => {
  var data = JSON.parse(req.body);
  var owner = data[0];
  var partyroom = data[1];
  console.log(req.body);
  console.log(data);
  console.log(owner);
  console.log(partyroom);

  const saltRounds = 10;
  bcrypt.hash(owner.password, saltRounds).then(function (hash) {
    data.password = hash;
    client.connect(err => {
      Owner.insertOne(owner, (err) => {
        if (err) throw err;
        console.log("Owner [" + owner.username + "] added");
      });
      PartyRoom.insertOne(partyroom, (err) => {
        if (err) throw err;
        console.log("Partyroom [" + partyroom.partyRoomName + "] added");
        res.send("SignupSuccess");
      });
      // return res.redirect('/');
    });
  });
});

router.post('/uploadPhoto', uploadController.uploadPhoto);

router.post('/partyRoomInfo', (req, res) => {
  var data = req.body;
  console.log(data);
  client.connect(err => {
    PartyRoom.insertOne(data, (err) => {
      if (err) throw err;
      console.log("PartyRoom create Success!!!");
      res.send("CreateSuccess");
      res.redirect('/');
    });
  });
});

router.post('/downloadPhoto', (req, res) => {
  // client.connect(err => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    files.forEach((file, i) => {
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        console.log(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });

    // Files exist
    // return res.json(files);
  });
  // });
});

// gfs.files.find({}).toArray(function (err, files) {
//   if (err) {
//     res.json(err);
//   }
//   if (files.length > 0) {
//     var mime = files[0].contentType;
//     var filename = files[0].filename;
//     res.set('Content-Type', mime);
//     res.set('Content-Disposition', "inline; filename=" + filename);
//     var read_stream = gfs.createReadStream({_id: file_id});
//     read_stream.pipe(res);
//   } else {
//     res.json('File Not Found');
//   }
// });
// });

module.exports = router;
