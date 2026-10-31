const Sequelize =require("sequelize");
const { all } = require("../routes");
module.exports=(seq)=>{
    var model= seq.define("SP_tu_pian",{
        pic_url: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        // 这张图片对应哪个 SPU
        spu_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        // 排序号（决定哪张图排第一）
        sort_order: {
            type: Sequelize.INTEGER,
            defaultValue: 0 
        }

    },
    {
        tableName:'tb_SP_tu_pian',
        freezeTableName:true,
    });
    return model;
}