import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// generating a method
const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // refreshToken database mein save krwa diya(below 2 lines)
        user.refreshToken = refreshToken,
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;


    // agar undefined ho toh ? bhi kya krega woh toh presnece ya absence ko batata hai, hamne neeche check lagaya hai but woh sirf avatar image ke liye toh isliye ye jo upar fancy way mein likha hai(jo abb comment kr diya) isko ham aise bhi likh skte hain normal tareeke se
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body ->data
    // username or email based
    // find the User
    // password check 
    // access and refresh token 
    // send cookie


    //jo bhi data chahiye lelo
    const {email, username, password} = req.body
    console.log(email);
    
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //ham ya toh findOne ke andar sirf username likh dte ya fir sirf email likh dete, but agar hamein dekhna hai ki ya toh ye match ho jaye ya toh woh match ho jaye toh ham or operator use krke likhte hain
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "{Password is wrong}")
    }

    //destructure krke le liya
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    // neeche wala step krne se cookies sirf server ke through modifiable rehti hai frontend se modify nhi ho pati
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedIn, accessToken, refreshToken
            },
            "User logged in successfully"
        ) 
    )
    // when we write res.cookie("accessToken", accessToken, options), are we only defining the things in response. The actual sending happens when you call .json()

})
const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{ 
                // deta hai kya kya update krna hai
                // refresh token db se gayab hogya
                refreshToken: undefined
            }
        },    
        {
            new: true
        }

    )


    const options = {
        httpOnly: true,
        secure: true
    }

    //cookies clear krni hain
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})
    


export {
    registerUser,
    loginUser,
    logoutUser
}