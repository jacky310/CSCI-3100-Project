const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const router = express.Router();

app.use(express.static('website'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('/', (req,res) => {
//   res.sendFile(path.join(__dirname + 'hello-react-app/public/index.html'));
// });

// app.get('/info' , (req,res) => {
//   client.connect(err => {
//     const collection = client.db("sample_airbnb").collection("listingsAndReviews");
//     collection.findOne({}, function(err, result) {
//       if (err) throw err;
//       res.json(result);
//     });
//   });
//   //client.close();
// });
//
// app.post('/search' , (req, res) => {
//   let data = req.body;
//   console.log(data);
//   client.connect(err => {
//     const collection = client.db("sample_airbnb").collection("listingsAndReviews");
//     collection.findOne({name: (req.body.name)}, function(err, result) {
//       if (err) throw err;
//       res.json(result);
//     });
//   });
// });

app.use(cors());
app.use(express.json());

router.get('/', function (req, res) {
  res.sendFile('index.html', { 'root': "./website" });
});

// router.get('/login', function (req, res) {
//   res.sendFile('login.html', { 'root': "./website" });
// });

app.get('/search', (req, res) => {
  var data = req.query;
  console.log(data);
  client.connect(err => {
    // const collection = client.db("PartyRoomBooking").collection("customer");
    // collection.insertOne(data, (err) => {
    //   if (err) throw err;
    //   console.log("Customer Signup Success!!!");
    //   res.send("SignupSuccess");
    // });
    // return res.redirect('/');
    console.log("Search Success!!!");
    res.send("SearchSuccess");
  });
});

app.post('/login', (req, res) => {
  var data = req.body;
  console.log(data);
  client.connect(err => {
    console.log(data.userType, data.username, "Login Success!!!");
    if (data.userType == "customer")
      res.send("CustomerLoginSuccess");
    else if (data.userType == "owner")
      res.send("OwnerLoginSuccess");
  });
});

app.post('/customerSignUp', (req, res) => {
  var data = req.body;
  console.log(data);
  const saltRounds = 10;
  bcrypt.hash(data.password, saltRounds).then(function (hash) {
    data.password = hash;
    client.connect(err => {
      const collection = client.db("PartyRoomBooking").collection("customer");
      collection.insertOne(data, (err) => {
        if (err) throw err;
        console.log("Customer Signup Success!!!");
        res.send("SignupSuccess");
      });
      // return res.redirect('/');
    });
  });
});

app.post('/ownerSignUp', (req, res) => {
  var data = req.body;
  console.log(data);
  const saltRounds = 10;
  bcrypt.hash(data.password, saltRounds).then(function (hash) {
    data.password = hash;
    client.connect(err => {
      const collection = client.db("PartyRoomBooking").collection("owner");
      collection.insertOne(data, (err) => {
        if (err) throw err;
        console.log("Owner Signup Success!!!");
        res.send("SignupSuccess");
      });
      // return res.redirect('/');
    });
  });
});

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB connection established');
});
const owner_route = require('./routes/owner');

app.use('/owners', owner_route);
app.use('/', router);

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
