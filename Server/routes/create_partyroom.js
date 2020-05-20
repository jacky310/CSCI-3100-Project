// MongoDB & mongoose:
const router = require('express').Router();
const mongoose = require('mongoose');
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
mongoose.connect(uri);
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Other packages:
const PartyRoom = require('../models/partyRoom.model');
const RoomOwnership = require('../models/roomOwnership.model');
const uploadController = require("./uploadPhoto");

// send the html of party room create page
router.get('/', function (req, res) {
  res.sendFile('partyroom_create.html', { 'root': "./website" });
});

// handle the party room photo upload
router.post('/uploadPhoto', uploadController.uploadPhoto);

// save the new party room data to db
router.post('/create', function (req, res) {
  PartyRoom.find({}, 'party_room_id').sort({ party_room_id: -1 }).limit(1).exec(function (err, maxIdRoom) {
    if (err) res.send(err);
    else {
      maxId = (maxIdRoom.length == 1) ? maxIdRoom[0].party_room_id : 0;
      client.connect(err => {
        const collection = client.db("PartyRoomBooking").collection("photos.files");
        // Each party room will have a specific name:
        photoName1 = req.body.party_room_name + "_photo0";
        photoName2 = req.body.party_room_name + "_photo1";
        photoName3 = req.body.party_room_name + "_photo2";
        //Search for those photo object id
        collection.find({ $or: [{ filename: photoName1 }, { filename: photoName2 }, { filename: photoName3 }] }).toArray((err, p) => {
          // Create a party room object
          var partyroom = {
            party_room_id: maxId + 1,
            party_room_name: req.body.party_room_name,
            party_room_number: req.body.party_room_number,
            address: req.body.address,
            district: req.body.district,
            description: req.body.description,
            quotaMin: req.body.quotaMin,
            quotaMax: req.body.quotaMax,
            price_setting: [],
            facilities: [],
            photos: []
          };

          // Make those array string to array
          var day = req.body.day.replace(/'/g, '"');
          day = JSON.parse(day);

          var startTime = req.body.startTime.replace(/'/g, '"');
          startTime = JSON.parse(startTime);

          var endTime = req.body.endTime.replace(/'/g, '"');
          endTime = JSON.parse(endTime);

          var price = req.body.price.replace(/'/g, '"');
          price = JSON.parse(price);

          var facilities = req.body.facilities.replace(/'/g, '"');
          facilities = JSON.parse(facilities);

          // push "day", "starttime", "endtime" and "price" to the price setting of that object
          for (var i = 0; i < day.length; i++)
            partyroom.price_setting.push({
              day: day[i],
              startTime: parseInt(startTime[i]),
              endTime: parseInt(endTime[i]),
              price: parseInt(price[i])
            });
          
          // push facilities to the facilities of that object
          for (var i = 0; i < facilities.length; i++)
            partyroom.facilities.push(facilities[i]);
          
          // push those party room photo object id to the photo of that object
          for (var i = 0; i < p.length; i++)
            partyroom.photos.push(p[i]._id);

          var room = new PartyRoom(partyroom);
          // save the party room data to the party room db
          room.save()
            .then(() => {
              var ownership = {
                owner_userName: req.session.user,
                party_room_id: partyroom.party_room_id
              };
              var insertData = new RoomOwnership(ownership);
              insertData.save()
                .then(() => res.send('Success'))
                .catch(err => res.send('Fail'));
            })
            .catch(err => res.send('Fail'));
        });
      });
    }
  });
});

module.exports = router;
