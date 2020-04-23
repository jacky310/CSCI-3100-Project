<<<<<<< HEAD
const upload = require("./uploadPhotoMiddleware");

const uploadFile = async (req, res) => {
    try {
        await upload(req, res);

        console.log(req.file);
        if (req.file === undefined) {
            return res.send(`You must select a file.`);
        }

        return res.send(`File has been uploaded.`);
    } catch (error) {
        console.log(error);
        return res.send(`Error when trying upload image: ${error}`);
    }
};

module.exports = {
    uploadFile: uploadFile
};
=======
const upload = require("./uploadPhotoMiddleware");

const uploadFile = async (req, res) => {
    try {
        await upload(req, res);

        console.log(req.file);
        if (req.file === undefined) {
            return res.send(`You must select a file.`);
        }

        return res.send(`File has been uploaded.`);
    } catch (error) {
        console.log(error);
        return res.send(`Error when trying upload image: ${error}`);
    }
};

module.exports = {
    uploadFile: uploadFile
};
>>>>>>> 5f5296113ae93e1908b81f0ae5d84f88a8b7ca4a
