const userModel = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiErrors')

let getAllUsers = async (req , res)=>{
  try {
    let users = await userModel.find()
  
    res.status(200).json({data:users})
    
  } catch (error) {
    next(new ApiError(404 , error.message))
  }

}

let saveUser = async (req , res)=>{
   try {
    const user = req.body

    let newUser = await userModel.create(user)

    res.status(201).json({message: 'success' , data: newUser })
   } catch (err) {
    next(new ApiError(400 , err.message))
   }
}

let login = async (req , res)=>{
  try {

    let {email , password } =  req.body
    
    if(!email || !password){
      return  res.status(400).json({message: "you must provide email and password"}) 
    }
    
    let user = await userModel.findOne({email:email})
    
    if(!user){
      return res.status(404).json({message: "invalid email or password"})
    }
    
    let isValid = await bcrypt.compare(password , user.password)
    
    if(!isValid){
      return  res.status(401).json({message: "invalid email or password"})
    }
    
    let token  = jwt.sign({id:user._id , email:user.email , role: user.role } , process.env.SECRET )
    
    res.status(200).json({ token : token })
  } catch (error) {
    next(new ApiError(400 , error.message))
  }

}


let updatePassword = async function (req , res){
 try {

   let {currentPassword , newPassword} = req.body

   if(!currentPassword || !newPassword){
       
     return res.status(400).json({status:"error" , message: 'you must provide current and new password'})
   }

   let user = await userModel.findById(req.id)

   if (!user) {
   
     return res.status(404).json({status: "fail", message: "User not found"});
   
   }

   let isValid = await bcrypt.compare(currentPassword , user.password)

   if(!isValid){
     
     return res.status(401).json({status: "fail" , message:"incorrect password"})

   }

   if (currentPassword === newPassword) {
     return res.status(400).json({
         status: "fail",
         message: "New password must be different from current password."
     });
   
   }

   user.password = newPassword

   await user.save()

   let token  = jwt.sign({id:user._id , email:user.email , role: user.role } , process.env.SECRET , {expiresIn : '1h'} )

   res.status(200).json({ token : token })
 }catch (error) {
   
  next(new ApiError(400 , error.message))
 
  }
}

module.exports={getAllUsers , saveUser , login , updatePassword}

