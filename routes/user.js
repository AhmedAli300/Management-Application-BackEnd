
const express = require('express')

let router = express.Router()

let {getAllUsers , saveUser , login , updatePassword} = require('../controllers/users')

let {auth} = require('../mddilewares/auth')

router.get('/' , getAllUsers)
router.post('/', saveUser )
router.post('/login' , login)
router.patch('/updateMyPassword' , auth , updatePassword)

module.exports = router