const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const router = express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use(express.json());

const PartyRoom = require('./models/partyRoom.model');

// For Login
app.use(session({
  secret: 'csci3100',
  store: new MongoStore({ url: 'mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/sessiondb?retryWrites=true&w=majority' }),
  cookie: { maxAge: 60 * 10000 },
  saveUninitialized: false,
  resave: false
}));

// Check MongoDB Connection
// mongoose.connect("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking");
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB connection established');
});

// For Index page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/website/index.html'));
});
app.use(express.static('website'));

app.post('/checkLogin', (req, res) => {
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

app.post('/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      res.send("Logout Fail");
    }
    res.redirect('/');
  });
});

var Grid = require('gridfs-stream');
var fs = require('fs');

const conn = mongoose.createConnection(uri);
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
});

app.get('/search', (req, res) => {
  var d = new Date(req.query.date);
  console.log(d.getDay());
  var query = { party_room_name: req.query.partyRoomName,
    district: req.query.district,
    quotaMin: {$lte: req.query.numPeople},
    quotaMax: {$gte: req.query.numPeople}
  };
  console.log(req.query);
  if (req.query.partyRoomName == '') delete query.party_room_name;
  if (req.query.district == '') delete query.district;
  console.log(query);
  var result = [];
  PartyRoom.find(query , (err, r)=>{
    if (err) return res.send(err);
    else {
      console.log(r);
      for (let i = 0; i < r.length; i++){
        let image = "";
        gfs.files.findOne({_id: r[i].photos[0]}, (err, file) => {
          if (!file || file.length === 0) {
            return res.status(404).json({
              err: 'No  images'
            });
          }
          const readstream = gfs.createReadStream(file.filename);
          readstream.on('data', (chunk) => {
            image += chunk.toString('base64');
          });
          readstream.on('end', () => {
            result.push({
              img: image,
              title: r[i].party_room_name,
              description: r[i].description,
              capacity: "min: "+r[i].quotaMin+" max: "+r[i].quotaMax,
              location: r[i].district,
              price: "See More"
            });
            if(result.length == r.length){
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

// app.get('/search', (req, res) => {
//   PartyRoom.find({}, async (err, r)=>{
//     console.log(r);
//     console.log("Search Success!!!");
//     var result = [];
//     for (let i = 0; i < r.length; i++){
//       let image = "";
//       gfs.files.findOne({_id: r[i].photos[0]}, (err, file) => {
//         if (!file || file.length === 0) {
//           return res.status(404).json({
//             err: 'No files exist'
//           });
//         }
//         const readstream = gfs.createReadStream(file.filename);
//         readstream.on('data', (chunk) => {
//           image += chunk.toString('base64');
//         });
//         readstream.on('end', () => {
//           result.push({
//             img: image,
//             title: r[i].party_room_name,
//             description: r[i].description,
//             capacity: "min: "+r[i].quotaMin+" max: "+r[i].quotaMax,
//             location: r[i].district,
//             price: "See More"
//           });
//         })
//       });
//     }
//     setTimeout(() => {
//       res.send({
//         hasResult: r.length, result: result
//       });
//     }, 500);
//   });
// });

app.post('/addPartyTest', function(req,res){
    PartyRoom.find({}, 'party_room_id').sort({party_room_id: -1}).limit(1).exec(function(err, maxIdRoom) {
      if (err) res.send(err);
      if (maxIdRoom.length == 1) {
        maxId = maxIdRoom[0].party_room_id;
      }
      else {
        maxId = 0;
      }
      client.connect(err => {
        const collection = client.db("PartyRoomBooking").collection("photos.files");
        collection.findOne({ filename: "456_test3.jpg"}, (err, p) => {
          var r = new PartyRoom({
            party_room_id: maxId+1,
            party_room_name: "CUHK3",
            party_room_number: "12345678",
            address: "CUHK",
            district: "Kwun Tong",
            description: "香港中文大學，簡稱中文大學、中大、港中文，是一所坐落於香港沙田馬料水的公立研究型大學，也是香港第一所研究型大學。香港中文大學由新亞書院、崇基學院及聯合書院於1963年合併而成，現已發展成為轄九大書院的書院制大學。香港中文大學起源於清朝中期至民國初年在大陸地區成立的教會大學和私人大學，是香港歷史源流最久遠的高等學府。",
            quotaMin: 2,
            quotaMax: 20,
            price_setting: [{
              day: "Monday to Thursday",
              startTime: "08:00:00",
              endTime: "12:00:00",
              price: 100
            },{
              day: "Friday",
              startTime: "08:00:00",
              endTime: "12:00:00",
              price: 100
            }],
            facilities: ["VR","Switch"],
            photos: [p._id]
          });

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

// For Login page
const loginSignup = require('./routes/loginSignup');
app.use('/loginSignup', loginSignup);

// For Customer Signup page
const customerSignup = require('./routes/customerSignup');
app.use('/customerSignup', customerSignup);

// For Owner Signup page
const ownerSignup = require('./routes/ownerSignup');
app.use('/ownerSignup', ownerSignup);

const customer_info = require('./routes/customer_info');
app.use('/customer', customer_info);

const owner_info = require('./routes/owner_info');
app.use('/owner', owner_info);

const room_info = require('./routes/room_info');
app.use('/partyRoom', room_info);

const createPartyRoom = require('./routes/create_partyroom');
app.use('/create_partyroom', createPartyRoom);

const owner_route = require('./routes/owner');
app.use('/owners', owner_route);

const customer_route = require('./routes/customer');
app.use('/customers', customer_route);

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
