const {DataTypes} =require('sequelize');
const sequelize=require('../database/db')


// Dinh nghia model User anh xa voi bang User

const User=sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate:{
            isEmail:true
        }

    },
    password:{
        type:'users',
        allowNull: false
    },
     
},
{
    tableName: 'Users',
    timestamps: true  
}
    
);
module.exports=User;