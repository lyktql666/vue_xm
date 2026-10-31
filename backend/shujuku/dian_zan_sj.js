const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("dian_zan", {
        // 记录这条点赞是属于“评价”的，还是属于“回复”的
        target_type: { type: Sequelize.STRING(20), allowNull: false }, // 'review' 或 'reply'
        target_id: { type: Sequelize.INTEGER, allowNull: false } // 评价的ID 或 回复的ID
    }, {
        tableName: 'tb_dian_zan',
        freezeTableName: true,
    });
}