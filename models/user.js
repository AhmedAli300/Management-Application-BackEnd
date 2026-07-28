const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true,
        minLingth:2,
        maxlingth:10
    },
    email:{
        type:String,
        required: true,
        unique:true,
        validate:{
            validator:function (email){
                return /^[a-zA-Z]{4,20}[0-9]{0,4}(@)(gmail|yahoo)(.com)$/.test(email)
            },
            message: (prop)=> `${prop.value} is not correct `
        }
    },
    password:{
        type:String,
        required:true
    },

    role:{
        type: String ,
        enum:['admin' , 'member' ],
        default: 'member'
    }


},{Collection: 'User'})

userSchema.pre('save' , async function(next){
   try {
        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(this.password , salt)
        this.password = hashedPassword
        next()
   } catch (err) {
        console.log(err.message);
        
   }
})


const userModel =  mongoose.model('User' , userSchema)


module.exports = userModel