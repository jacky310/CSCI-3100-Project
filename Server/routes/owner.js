const router = require('express').Router();
let Owner = require('../models/owner.model');

router.route('/').get((req, res) => {
    Owner.find()
        .then(owners => res.json(owners))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const owner_name = req.body.owner_name;
    const username = req.body.username;
    const party_room_name = req.body.party_room_name;
    const email = req.body.email;
    const password = req.body.password;

    const new_owner = new Owner({
        owner_name,
        username,
        party_room_name,
        email,
        password,

    });

    new_owner.save()
        .then(() => res.json('Owner added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;