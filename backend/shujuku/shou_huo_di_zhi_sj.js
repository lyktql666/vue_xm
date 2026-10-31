// shujuku/shou_huo_di_zhi_sj.js
const Sequelize = require("sequelize");

module.exports = (seq) => {
    return seq.define("shou_huo_di_zhi", {
        di_zhi_xiang_qing: { 
            type: Sequelize.STRING(255), 
            allowNull: false 
        },
        shou_jian_ren:{
            type: Sequelize.STRING(50),
            allowNull: false
        },
        dian_hua:{
            type: Sequelize.STRING(20),
            allowNull: false
        },
        is_default: { 
            type: Sequelize.BOOLEAN, 
            defaultValue: false 
        } 
    }, {
        tableName: 'tb_shou_huo_di_zhi',
        freezeTableName: true,
    });
}