const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("dian_pu", {
        name: { type: Sequelize.STRING(50), allowNull: false }, // 店铺名
        logo: { type: Sequelize.STRING(255), allowNull: true }, // 店铺头像
        description: { type: Sequelize.STRING(255), allowNull: true } // 店铺简介
    }, {
        tableName: 'tb_dian_pu',
        freezeTableName: true,
    });
}