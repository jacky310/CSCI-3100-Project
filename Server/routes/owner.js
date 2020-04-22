const router = require('express').Router();
const bcrypt = require('bcrypt');
let Owner = require('../models/owner.model');

router.route('/').get((req, res) => {
    Owner.find()
        .then(owners => res.json(owners))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
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
        .catch(err => res.redirect('/signupFail.html'));
});

module.exports = router;