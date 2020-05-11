const router = require('express').Router();
const bcrypt = require('bcrypt');
let Customer = require('../models/customer.model');
let PartyRoom = require('../models/partyRoom.model');
let BookingRecord = require('../models/bookingRecord.model');

router.get('/', (req, res) => {
  res.sendFile('customerSignup.html', { 'root': "./website" });
});

router.post("/info", function (req, res) {
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
});

router.post("/booking", function (req, res) {
  BookingRecord.find({ customer_userName: req.body.username }, (err, bookings) => {
    var result = [];
    if (err) throw err;
    else if (bookings == null) res.send({ result: result });
    else {
      bookings.forEach(booking => {
        PartyRoom.findOne({ party_room_id: booking.party_room_id }, (err, room) => {
          if (err) throw err;
          else {
            result.push({
              room_id: room.party_room_id,
              room: (room == null) ? "unknown" : room.party_room_name,
              owner: booking.owner_userName,
              start: new Date(booking.time[0].bookingStart).toUTCString(),
              end: new Date(booking.time[0].bookingEnd).toUTCString(),
              num: booking.numPeople
            })
            if (result.length == bookings.length)
              res.send({ result: result });
          }
        });
      });
    }
  })
});

router.post('/add', (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
  });
  const username = req.body.username;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const phone = req.body.phone;

  const new_customer = new Customer({
    username,
    email,
    password,
    phone,
  });

  new_customer.save()
    .then(() => res.redirect('/signupSuccess.html'))
    .catch(err => res.redirect('/customerFail.html'));
});

module.exports = router;