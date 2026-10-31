const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("ping_jia_hui_fu", {
        content: { type: Sequelize.STRING(500), allowNull: false },
        // ✨ 新增：记录这条回复是 "@" 谁的？如果是直接回复层主，这个字段就是空 ✨
        reply_to_name: { type: Sequelize.STRING(50), allowNull: true } 
    }, {
        tableName: 'tb_ping_jia_hui_fu',
        freezeTableName: true,
    });
}