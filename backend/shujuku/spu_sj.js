const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("spu", {
        // 这就是原来商品表里的基础信息
        name: { type: Sequelize.STRING(100), allowNull: false }, // "飞鹤星飞帆1段奶粉"
        pin_pai: { type: Sequelize.STRING(50) },                 // "飞鹤"
        bao_zhi_qi: { type: Sequelize.STRING(50) }               // "12个月"
        
        // 注意：没有价格！没有库存！没有店铺ID！
    }, {
        tableName: 'tb_spu',
        freezeTableName: true,
    });
}