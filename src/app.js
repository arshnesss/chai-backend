import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes.js'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
 //yahan chahe extended na bhi likhen , nested objects ke liye hota objects create kr skte

app.use(express.static("public")) 
//public assets like images fevicons

app.use(cookieParser())
//for using and modifying users browsers cookies


//routes import 
// import userRouter from './routes/user.routes.js'

//routes declaration 
app.use("/api/v1/users", userRouter)
// sirf users bhi chalega but good practise hai api aur v1 likhne ki(version1)
//koi bhi jab /users type krega toh ham usko control de denge userRouter pe, abb wahan jo bhi hoga /register ya /login uss hisaab se wahan redirect krdega

// url- http://localhost:8000/users/register

export { app }
