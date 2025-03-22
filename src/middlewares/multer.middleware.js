import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    }
})
//the above code uses multer to store files on our server

export const upload = multer({
    storage,
})

// cb is just a function provided by Multer.
// The cb function in Multer stands for "callback", and it's used to pass values back to Multer to control how files are stored.
// It must be called with (error, value).
// If there's no error, null is passed as the first argument.
// The second argument is the actual value (folder path or filename).