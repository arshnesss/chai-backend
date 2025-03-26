import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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
                user: loggedIn , accessToken, refreshToken
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
    
const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    //neeche try catch mein daal diya altho itna zaroori nhi hai
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        //matching the 2 refresh tokens
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        // abb sab check hogya hai abb naya generate krke dedo
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    //req.user ke andar user hai
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    //abb validate hogya hai ki passowrd sahi tha purana abb naya password set krna hai

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//agar user logged in hai toh usko current user dena
const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    //neeche user ko update krdiya
    const User = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                 fullName, //isko neeeche email jaise bhi likh skte
                email: email // isko upar fullName jaise bhi likh skte
            }
        },
        {new: true}
    ).select("-password") //password field nhi chahiye

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details are successfully updated"))
})


const updateUserAvatar = asyncHandler(async(req, res) =>
{
    const avatarLocalPath = req.file?.path //ek hi hai isliye file

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user,"Avatar updated successfully")
        )
})


const updateUserCoverImage = asyncHandler(async(req, res) =>
    {
        const coverImageLocalPath = req.file?.path //ek hi hai isliye file
    
        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover image file is missing")
        }
    
        const coverImage = await uploadOnCloudinary(avatarLocalPath)
    
        if(!coverImage.url){
            throw new ApiError(400, "Error while uploading on cover image")
    
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200, user,"Cover image updated successfully")
        )
    })



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}


// => generateAccessAndRefreshTokens

// *If we didn't update the refresh token, an old refresh token would still be valid
// *user.refreshToken = refreshToken;
// This updates the local JavaScript object, but the change is not yet saved to the database, hence the save line saves the value of the refresh token to the database

// => registerUser

// *line 44 ; some(field => field?.trim() === "") checks if any field is empty.some() is an array method that checks if at least one element in the array meets a condition. trim() removes any leading/trailing spaces.
// * $or: [{ username }, { email }] in this or is a mongodb operator that chekcs if wither of these condiitons is true, and here username and email are actual values, not fields
// * we write the things in line 64 because what is the thing inside isnt an array and what if its an empty array, so these things are prevented wiht doing this and we checking for avatar but not for coverImge hence we can employ an if condition istead of optional chaining
// *User is a Mongoose model that represents the users collection in the MongoDB database.

// => logoutUser

// *Purpose: Logs out the user by clearing refresh tokens from DB and cookies.
// *when do we need to use secure cookie options-
//     -If you store accessToken or refreshToken in cookies, you must use secure options to prevent security vulnerabilities.
//     -When a user logs out, you should clear the cookies securely.
// * Why Can’t We Clear Cookies Outside of res?
// Cookies exist on the client side (browser), not the server.The server can only instruct the browser to delete cookies via res.clearCookie() or by setting an expired cookie.   
// *In most cases where there is an exchange of tokens, you should use secure cookie options 
// *new: true makes sure that the function returns the updated document instead.
// *$set is a MongoDB update operator used to update specific fields.

// => changeCurrentPassword
// *req.user._id is used when
//  Source: Extracted from an authenticated user’s token (usually from JWT)
// ✅ Use Case: Used when the user is already logged in and making a request
// and 
// req.body._id is used when the frontend sends a payload







