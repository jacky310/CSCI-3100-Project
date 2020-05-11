var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const bcrypt = require('bcrypt');

const Customer = require('../models/customer.model');
const Owner = require('../models/owner.model');

router.get('/', function (req, res) {
  res.sendFile('loginSignup.html', { 'root': "./website" });
});

router.post('/login', (req, res) => {
  var data = req.body;
  console.log(req.body);
  client.connect(err => {
    const collection = (data.userType == "customer") ? Customer : Owner;
    collection.findOne({ username: data.username }, { password: 1 }, (err, user) => {
      // Check whether the username exist
      if (user == null) res.send("Username Not Found");
      else {
        // Check whether the password correct
        bcrypt.compare(data.password, user.password, (err, result) => {
          if (result == true) {
            req.session.regenerate(function (err) {
              if (err) res.send("Login Fail");
              else {
                req.session.user = data.username;
                req.session.userType = data.userType;
                res.send(data.userType + "LoginSuccess");
              }
            });
          }
          else res.send("Password Not Correct");
        });
      }
    });
  });
});

module.exports = router;
