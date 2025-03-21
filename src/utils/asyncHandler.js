//creating a method
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
//If next(error) is called with an error, Express skips all normal middleware and jumps directly to error-handling middleware.

export { asyncHandler }




// const asyncHandler  = () => {}
// const asyncHandler  = (func) => {() => {}}
// const asyncHandler  = (func) => aync () => {} 


// Tips:
// In most of the cases the below try-catch approach will be used for the wrapper fucntion but sometimes promises can also be used like it is shown in the above space


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await func(req, res, next) 

//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// } 