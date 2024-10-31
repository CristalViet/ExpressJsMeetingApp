const Room =require('../models/Room');
const User = require('../models/User');
const friendController = require('./friendController');


const roomController= {
    //Gui yeu cau ket ban

    createRoomRequest:async(req,res)=>{
        try {
            const {room_code,name,create_by}=req.body
            console.log('Received roomcode',room_code)
            console.log('Received name of room',name)
            console.log('Received name of creator',create_by)
            
        } catch (error) {
            
        }
    }
};
module.exports=friendController