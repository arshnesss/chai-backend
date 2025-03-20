// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"; 
dotenv.config({ path: "./.env" });  // Ensure this is at the very top

import connectDB from "./db/index.js";

console.log("MongoDB URI:", process.env.MONGODB_URI);

connectDB();





 









/*
import express from "express"
const app = express()

//below is an example of IIFE function(Immediately Invoked, basically they are immediately called after being declared)
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error          
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()
//so basically in an asynchronous program, await pauses the execution of a function it is in and waits for a promise to get resolved

*/
