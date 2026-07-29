
const jwt = require('jsonwebtoken')
const util = require('util')
const ApiError = require('../utils/ApiErrors')

async function auth(req , res , next){

    let { authorization } = req.headers
    
    if(!authorization){
        next(new ApiError(401 ,  "you must be login first"))
    }

    try {
        
        let decoded = await util.promisify(jwt.verify)(authorization , process.env.SECRET)
        
        req.id = decoded.id
        req.role = decoded.role
        next()
    } catch (err) {
        next(new ApiError(401 , err.message))
    }
}



module.exports = {auth }