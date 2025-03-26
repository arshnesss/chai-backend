import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

//this will verify is user exists or not 
export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        req.cookies?.accessToken || req.header("Authorisation")?.replace("Bearer", "")
        //upar ya toh cookie se token nikal lo ya fir || lagake authorization header se token nikal lo
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        //decoding the information and matching it
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        //user model mein generate accesToken wale mein dekho id ko aise hi name kiya hai
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next() // ye jo next likha hai ye agle parameter pe jump krne mein help krta hai jab call kiya gaya ho tab jaise ki routes wale mein logoutUser
    } catch (error) {
        throw new ApiError(401, error.message || "Inavlid Access Token")
    }
})