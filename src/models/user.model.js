import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //kisi bhi field ko searchable banana hai optimised tareeke se
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password: {
            type: String, //pwd ko encrypt krke rakhna chahte hain
            required: [true, 'Password is required']// by default message
        },
        refreshToken: {
            type: String
        }
    }, 
    { 
        timestamps: true
    }
)

// yahan neeche arrow fxn se bohot dikkat aati hai kyunki context nhi pata hota aur yahan context pata hona bohot zaroori hai
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
// If this check wasn't there, every time a user updates their profile (e.g., changing email), their password would be hashed again, making them unable to log in since bcrypt hashes are one-way and hashing an already hashed password corrupts the stored value.

userSchema.methods.isPasswordCorrect = async function(password){
     return await bcrypt.compare(password, this.password)
}
// This is commonly used for login authentication when verifying a user's credentials. 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName

            //above entire thing is payload
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            // expiry time object mein jata hai
        }
    )
}
userSchema.methods.generateRefreshToken = function()
    {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
    
                //above entire thing is payload
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                // expiry time object mein jata hai
            }
        )    
    }

export const User = mongoose.model("User", userSchema)
// ye user directly database se baat kr skta hai since ye mongoose ke through bana hai 


// next() is called to move to the next middleware or save operation.

// .pre("save", async function (next)) means this function will execute before saving the user document to the database.

// 'this' refers to the instance of the model created which contains the userschema and and contains all the details and parametrs of the userschema

// return in ln 68 ensures that the token is returned as a string

//✅ JWT is manual → The client (frontend) must explicitly attach the token to the Authorization header in every request.Cookies are automatic → The browser automatically sends cookies with every request to the domain that set them. in short both help in authorization

//generateAccessToken() is defined on the schema's instance methods and must be called on a specific user document retrieved from the database.User is the data in database and user is the instance of the data

//user is an instance of the User model, which means it has access to all methods defined in the User schema.

// In Mongoose (MongoDB ODM), hooks (middleware) let you execute code before or after database operations like saving, updating, or deleting a document.

// Pre Hook (Before Saving Data)
// ✅ Runs before saving a document to the database.

// Post Hook (After Data is Saved)
// ✅ Runs after a document is saved.