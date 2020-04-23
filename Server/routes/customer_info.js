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

const Customer = require('../models/customer.model');

router.post("/", function (req, res) {
  Customer.findOne({ username: req.body.username }, (err, customer) => {
    if (err) throw err;
    else if (customer == null) res.send("notFound");
    else {
      res.send({
        username: customer.username,
        email: customer.email,
        phone: customer.phone
      });
    }
  })
})

module.exports = router;
