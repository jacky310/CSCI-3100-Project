const router = require('express').Router();
const bcrypt = require('bcrypt');
let Customer = require('../models/customer.model');

router.get('/', (req, res) => {
  res.sendFile('customerSignup.html', { 'root': "./website" });
});

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