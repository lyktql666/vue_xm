const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("ping_jia",{
        content: { 
            type: Sequelize.STRING(500), 
            allowNull: false 
        }, // 评价内容
        star: { type: Sequelize.INTEGER, 
            allowNull: false
        },        // 星级 (1~5星)
    }, {
        tableName: 'tb_ping_jia',
        freezeTableName: true,
    });
    return model;
}