const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("ke_hu",{
        xing_ming:{
            type:Sequelize.STRING(50)
        },
        dian_hua:{
            type:Sequelize.STRING(50)
        },
        mi_ma:{
            type:Sequelize.STRING(50)
        }

        

    },
    {
        tableName:'tb_ke_hu',
        freezeTableName:true,
    });
    return model;
}