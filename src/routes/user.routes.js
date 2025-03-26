import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
//yahan verifyJWT middleware hamnein inject krdiya beech mein, yahan pehle isko run krega but fir ye kaun batayega ki iske agla run krna hai, ye batayega verifyJWT ke last mein likha hua next()
router.route("/logout").post(verifyJWT, logoutUser)


export default router