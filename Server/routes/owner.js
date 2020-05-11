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

//!!!!!!!!!!!!!Below is the code from /routes/original ownerSignup.js

// const PartyRoom = require("../models/partyRoom.model");
// const uploadController = require("./uploadPhoto");
// var Grid = require('gridfs-stream');
// var fs = require('fs');

// const conn = mongoose.createConnection(uri);
// let gfs;

// conn.once('open', () => {
//   // Init stream
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection('photos');
// });

// router.post('/uploadPhoto', uploadController.uploadPhoto);

// router.post('/downloadPhoto', (req, res) => {
//   // client.connect(err => {
//   gfs.files.find().toArray((err, files) => {
//     // Check if files
//     if (!files || files.length === 0) {
//       return res.status(404).json({
//         err: 'No files exist'
//       });
//     }

//     files.forEach((file, i) => {
//       if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//         // Read output to browser
//         const readstream = gfs.createReadStream(file.filename);
//         readstream.pipe(res);
//         console.log(res);
//       } else {
//         res.status(404).json({
//           err: 'Not an image'
//         });
//       }
//     });

//     // Files exist
//     // return res.json(files);
//   });
//   // });
// });

// // gfs.files.find({}).toArray(function (err, files) {
// //   if (err) {
// //     res.json(err);
// //   }
// //   if (files.length > 0) {
// //     var mime = files[0].contentType;
// //     var filename = files[0].filename;
// //     res.set('Content-Type', mime);
// //     res.set('Content-Disposition', "inline; filename=" + filename);
// //     var read_stream = gfs.createReadStream({_id: file_id});
// //     read_stream.pipe(res);
// //   } else {
// //     res.json('File Not Found');
// //   }
// // });
// // });