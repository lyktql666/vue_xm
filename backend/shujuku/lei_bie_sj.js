const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("lei_bie",{
        name:{
            type:Sequelize.STRING(50)
        },
        shu_liang:{
            type:Sequelize.INTEGER(50)
        },
        isActive:{
            type:Sequelize.BOOLEAN(50),
            allowNull:false,
        },
        age_tag: { 
            type: Sequelize.STRING(50), 
            allowNull: true,
        } 

    },
    {
        tableName:'tb_lei_bi',
        freezeTableName:true,
    });
    return model;
}