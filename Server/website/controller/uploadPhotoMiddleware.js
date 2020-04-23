// const util = require("util");
// const multer = require("multer");
// const GridFsStorage = require("multer-gridfs-storage");
//
// var storage = new GridFsStorage({
//   url: "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority",
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   file: (req, file) => {
//     const match = ["image/png", "image/jpg"];
//
//     if (match.indexOf(file.mimetype) === -1) {
//       const photeName = `123-${file.originalname}`;
//       return photoName;
//     }
//
//     return {
//       bucketName: "photos",
//       filename: `123-${file.originalname}`
//     };
//   }
// });
//
// var uploadPhoto = multer({ storage: storage }).single('photo1');
// var uploadPhotoMiddleware = util.promisify(uploadPhoto);
//
// module.exports = uploadPhotoMiddleware;

const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

var storage = new GridFsStorage({
  url: "mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const photeName = `${file.originalname}`;
      return photoName;
    }

    return {
      bucketName: "photos",
      filename: `${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).array("file", 3);
var uploadFilesMiddleware = util.promisify(uploadFile);

module.exports = uploadFilesMiddleware;
