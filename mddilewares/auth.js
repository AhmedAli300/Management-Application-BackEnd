
const jwt = require('jsonwebtoken')
const util = require('util')

async function auth(req , res , next){

    let { authorization } = req.headers
    
    if(!authorization){
        return res.status(401).json({message: "you must be login first"})
    }

    try {
        
        let decoded = await util.promisify(jwt.verify)(authorization , process.env.SECRET)
        // console.log(decoded);
        
        req.id = decoded.id
        req.role = decoded.role
        next()
    } catch (err) {
        res.status(401).json({message: "you are not authenticated try again"})
    }
}



module.exports = {auth }