const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("users",{
        zhang_hao:{
            type:Sequelize.STRING(50)
        },
        mi_ma:{
            type:Sequelize.STRING(50)
        },
        you_xiang:{
            type:Sequelize.STRING(50)
        },
        yong_hu_ming:{
            type:Sequelize.STRING(50)
        },
        isactive:{
            type:Sequelize.BOOLEAN(50),
            allowNull:false,
            defaultValue: true
        }

    },
    {
        tableName:'tb_users',
        freezeTableName:true,
    });
    return model;
}