const router = require('express').Router();
const bcrypt = require('bcrypt');
let Owner = require('../models/owner.model');

router.get('/', (req, res) => {
  res.sendFile('ownerSignup.html', { 'root': "./website" });
});

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
});

router.post('/add', (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
  });
  const companyName = req.body.companyName;
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const phone = req.body.phone;

  const new_owner = new Owner({
    companyName,
    name,
    username,
    email,
    password,
    phone,
  });

  new_owner.save()
    .then(() => res.redirect('/signupSuccess.html'))
    .catch(err => res.redirect('/ownerFail.html'));
});

module.exports = router;