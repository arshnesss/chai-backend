import { Router } from "express";
// const express=require("express");
// const router=express.Router();
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router