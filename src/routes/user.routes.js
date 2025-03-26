import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
   
    upload.fields([
        {
            name: "avatar",
            maxCount: 1 // number of files you want to accept
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    
    registerUser
)
router.route("/login").post(loginUser)

//secured routes
//secured route means user should be logged in
//yahan verifyJWT middleware hamnein inject krdiya beech mein, yahan pehle isko run krega but fir ye kaun batayega ki iske agla run krna hai, ye batayega verifyJWT ke last mein likha hua next()
router.route("/logout").post(verifyJWT, logoutUser)

//yahan neeche sara ka sara decode krne ka kaam controller mein kr rkha hai isliye yahan jwt ki zaroorat nhi padegi
router.route("/refresh-token").post(refreshAccessToken)

export default router

// => tips
// *When a user logs out, we use verifyJWT in the logout route to ensure that only an authenticated user can log out.