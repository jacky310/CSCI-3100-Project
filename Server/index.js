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

const home = require('./routes/home');
app.use('/', home);

const loginSignup = require('./routes/loginSignup');
app.use('/loginSignup', loginSignup);

const customer_route = require('./routes/customer');
app.use('/customer', customer_route);

const owner_route = require('./routes/owner');
app.use('/owner', owner_route);

const room_info = require('./routes/room_info');
app.use('/partyRoom', room_info);

const createPartyRoom = require('./routes/create_partyroom');
app.use('/create_partyroom', createPartyRoom);

const book = require('./routes/book');
app.use('/book', book);

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
