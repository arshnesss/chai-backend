import { Router } from "express";
import { 
     loginUser,
     registerUser,
     logoutUser,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails, 
     updateUserAvatar, 
     updateUserCoverImage, 
     getUserChannelProfile, 
     getWatchHistory 
    } from "../controllers/user.controller.js";
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

//SECURED ROUTES BELOW
//secured route means user should be logged in
//yahan verifyJWT middleware hamnein inject krdiya beech mein, yahan pehle isko run krega but fir ye kaun batayega ki iske agla run krna hai, ye batayega verifyJWT ke last mein likha hua next()
router.route("/logout").post(verifyJWT, logoutUser)

//yahan neeche sara ka sara decode krne ka kaam controller mein kr rkha hai isliye yahan jwt ki zaroorat nhi padegi
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)// yahan patch hi rakhna
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)// single file hi aayegi
router.route("/cover-Image").patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)

// colon is imp below
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router

// => tips
// *When a user logs out, we use verifyJWT in the logout route to ensure that only an authenticated user can log out.