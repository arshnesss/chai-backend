import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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

export { app }
