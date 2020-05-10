const upload = require("./uploadPhotoMiddleware");

const uploadPhoto = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);
    if (req.files == undefined)
      return res.send("You must select a file.");
    else return res.send("File has been uploaded.");
  } catch (error) {
    console.log(error);
    res.send(`Error when trying upload image: ${error}`);
  }
};

module.exports = {
  uploadPhoto: uploadPhoto
};
