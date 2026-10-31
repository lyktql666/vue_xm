const Sequelize = require("sequelize");
module.exports = (seq) => {
    return seq.define("shang_pin_pi_ci", {
        // 这批货的具体到期时间
        dao_qi_shi_jian: { type: Sequelize.DATEONLY, allowNull: false }, 
        // 这批货的库存数量
        pi_ci_ku_cun: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        // 这批库存仍然使用老字段名 shang_pin_id，但它现在指向 SKU
        shang_pin_id: { type: Sequelize.INTEGER, allowNull: false }
    }, {
        tableName: 'tb_shang_pin_pi_ci',
        freezeTableName: true,
    });
}