const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("ding_dan_xiang_qing", {
        shu_liang: { 
            type: Sequelize.INTEGER, 
            allowNull: false, 
            defaultValue: 1 
        }, // 买了几件
        mai_ru_jia: { type: Sequelize.INTEGER, 
            allowNull: false 
        } // 买的时候商品多少钱（价格快照）
    }, {
        tableName: 'tb_ding_dan_xiang_qing',
        freezeTableName: true,
    });
}