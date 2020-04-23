var express = require('express');
var router = express.Router();

// MongoDB & mongoose:
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');

// Other packages:
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const Owner = require('../models/owner.model');

router.post("/", function (req, res) {
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
  })

module.exports = router;
