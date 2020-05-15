// MongoDB & mongoose:
const router = require('express').Router();

// Other packages:
const Customer = require('../models/customer.model');
const PartyRoom = require('../models/partyRoom.model');
const BookingRecord = require('../models/bookingRecord.model');
const bcrypt = require('bcrypt');

// Send the html of customer sign up page
router.get('/', (req, res) => {
  res.sendFile('customerSignup.html', { 'root': "./website" });
});

// Send info of the customer 
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

// send the booking have done by the customer
router.post("/booking", function (req, res) {
  BookingRecord.find({ customer_userName: req.body.username }, (err, bookings) => {
    var result = [];
    if (err) throw err;
    else if (bookings.length == 0) res.send({ result: result });
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

// Signup: add customer booking data to db
router.post('/add', (req, res) => {
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