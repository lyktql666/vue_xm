const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("sku", {
        jia_ge: { type: Sequelize.DECIMAL(10,2), allowNull: false }, 
        zhuang_tai: { type: Sequelize.BOOLEAN, defaultValue: true }, 
        
        // ✨ 加上这个字段：作为总库存的缓存，方便前端秒读！ ✨
        ku_cun: { type: Sequelize.INTEGER, defaultValue: 0 },

        spu_id: { type: Sequelize.INTEGER, allowNull: false },
        dian_pu_id: { type: Sequelize.INTEGER, allowNull: false }
    }, {
        tableName: 'tb_sku',
        freezeTableName: true,
    });
}