const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("gou_wu_che", {
        // 加购数量
        shu_liang: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }
    }, {
        tableName: 'tb_gou_wu_che',
        freezeTableName: true,
    });
}