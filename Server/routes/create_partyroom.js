const multer = require('multer');
var express = require('express');
let PartyRoom = require('../models/partyroom.model');
let Ownership = require('../models/roomOwnership.model');
let Owner = require('../models/owner.model');
const uploadController = require("../website/controller/upload");
var router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
mongoose.connect(uri);


const upload = multer({
    dest: 'uploads/',
    storage: multer.memoryStorage(),
});

router.get('/', function (req, res) {
    res.sendFile('partyroom_create.html', { 'root': "./website" });
});


router.post('/create',upload.array('photos', 3),function(req, res, next) {
        PartyRoom.count({}, function( err, count){
            const party_room_id = count + 1;
            const party_room_name = req.body.party_room_name;
            const party_room_number = req.body.party_room_number;
            const address = req.body.address;
            const district = req.body.district;
            const description = req.body.description;
            const quotaMin = req.body.quotaMin;
            const quotaMax = req.body.quotaMax;
            const facilities = req.body.facilities;
            const photos =mongoose.mongo.ObjectID(req.body.photos._id);

            const new_room = new PartyRoom({
                party_room_id,
                party_room_name,
                party_room_number,
                address,
                district,
                description,
                quotaMin,
                quotaMax,
                facilities,
                photos

            });


            new_room.save()
                .then(()=>PartyRoom.findOneAndUpdate(
                    {"party_room_id": count +1 },
                    {
                        "$push": {
                            "price_setting": [{
                                day: req.body.day,
                                startTime: req.body.startTime,
                                endTime: req.body.endTime,
                                price: req.body.price
                            }]
                        }
                    },
                    { "upsert": true },
                    function(err, doc){ /* <callback> */
                        if(err)
                            res.redirect("/createFail.html");
                        else{
                            Owner.findOne({"phone": party_room_number}, function (err, data) {
                                if(err){
                                    return res.json(err);
                                }else{
                                    const username = data.username;
                                    const new_ownership = new Ownership({
                                        owner_userName: username,
                                        party_room_id: party_room_id,
                                    });
                                    new_ownership.save()
                                        .then(()=>console.log(new_ownership));
                                }
                                res.redirect("/createSuccess.html");
                            })

                        }

                    }
                ))
                .catch(err=>res.redirect("/createFail.html"));
    });




});

module.exports = router;
