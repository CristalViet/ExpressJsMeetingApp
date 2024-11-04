
const { User,Room } = require('../models'); // Đảm bảo import từ models/index.js
// const friendController = require('./friendController');

function generateRandomCode(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
      if (i % 3 === 2 && i < length - 1) {
        result += '-'; // Thêm dấu gạch nối sau mỗi 3 ký tự
      }
    }
    return result;
  }
const roomController= {
    //Gui yeu cau ket ban

    createRoomRequest:async(req,res)=>{
        try {
            const {createdBy} =req.body;
            const created_by=createdBy.userId 
            console.log("Tao boi ",created_by)
            // console.log('Received roomcode',room_code)
            const user=await User.findByPk(created_by)
            if(!user){
                return res.json({message:"Nguoi dung khong ton tai"})

            }
            
            let room_code;
            let isUnique=false;
            console.log('Received name of creator',createdBy)

            while(!isUnique){
                room_code=generateRandomCode(9)
                const existingRoom= await Room.findOne({where: {roomCode:room_code}})
                if(!existingRoom){
                    isUnique= true;
                }

            }

            //Tao phong moi 
            const newRoom=await Room.create({
                roomCode: room_code,
                createdBy: created_by,
            })

            res.status(201).json({ message: "Create Room Successfully", newRoom });

        } catch (error) {
            console.error("Lỗi khi tạo phòng:", error);
            res.status(500).json({ message: "Có lỗi xảy ra khi tạo phòng" });
        }
    },

    deleteRoomRequest:async(req,res)=>{
        try {
            const {room_code,name,create_by}=req.body
            console.log('Received roomcode',room_code)
            console.log('Received name of room',name)
            console.log('Received name of creator',create_by)
            
        } catch (error) {
            
        }
    },

};
module.exports=roomController