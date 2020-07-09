const fs = require('fs');
const multer = require('multer')
const dir = './imgUploads';
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            console.log(file);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            callback(null, dir);
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(/*res.end('Only images are allowed')*/ null, false);
        }
        callback(null, true);
    }
});