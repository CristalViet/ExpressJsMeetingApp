const express =require('express');
const bcrypt =require('bcrypt');
const db=require('../database/db');

const router=express.Router()
const roomController=require('../controller/roomController');
const { route } = require('./auth');


//Tao phong moi
router.post('/create',roomController.createRoomRequest)



module.exports = router;