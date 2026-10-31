const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("ding_dan",{
        ding_dan_hao:{
            type:Sequelize.STRING(50)
        },
        fu_kuan_jing_e:{
            type:Sequelize.INTEGER(50)
        },
        zhuang_tai:{
            type:Sequelize.INTEGER(50)
        },
        shou_jian_ren: { 
            type: Sequelize.STRING(50) 
        }, 
        shou_huo_dian_hua: { 
            type: Sequelize.STRING(20) 
        },
        

    },
    {
        tableName:'tb_ding_dan',
        freezeTableName:true,
    });
    return model;
}