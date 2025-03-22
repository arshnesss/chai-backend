import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async(req ,res) => {
    // Steps:
    // get user details from frontend(here postman)
     // validation - not empty
     // check if user already exists: username, email
     // (file check)check for images, check for avatar
     // upload them to cloudinary, avatar
     // create user object - create entry in db
     // remove password and refresh token field from response
     // check for user creation
     // return response


     //extracting and destructing the data like name,email etc
     const {fullName, email, username, password} = req.body
     console.log("email: ", email);

     // abb validation wala code bhi likhna hai, ya toh ham saari fields pe if statement laga skte hain, aur ya toh ham ek hi if statement mein check kr skte hain
     if (
        [fullName, email, username, password].some((field) => field?.trim() ==="")
     ) {
        throw new ApiError(400, "All fields are required")
     }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })// ye first instance return krdega

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    // multer hamein files ka access de deta hai
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatar) {
        throw new ApiError(400, "Avatar is must")
    }

    //ham await wahan wahan lagate hain jahan hamein pata hai ki time lagega
    const avatar = await uploadOnCloudinary
    (avatarLocalPath)    
    const coverImage = await uploadOnCloudinary
    (coverImageLocalPathLocalPath)  
    
    if(!avatar){
        throw new ApiError(400, "Avatar is musttt")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url, 
        //since cloudinary wali file mein poora response bhejra hai
        coverImage: coverImage?.url || "",
        //since hamein upar avatar pe safety check lagaya hai ispe nhi
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    )
    // yahan likhte hain kya kya nhi chahiye kyunki bydefault sab selected hote hain

    if(!createdUser){
        throw new ApiError(500, "somethign went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully" )
    )

})

export {
    registerUser,
}