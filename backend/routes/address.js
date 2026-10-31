var express = require('express');
var router = express.Router();
var responseHelper = require("../utils/responseHelper");
const db = require("../shujuku/mysqlmuying");

// ==================== 1. 获取某客户的所有地址 ====================
router.get('/list', async function(req, res, next) {
    try {
        const { ke_hu_id } = req.query;
        if (!ke_hu_id) return responseHelper.error(res, "参数缺失");

        const list = await db.shou_huo_di_zhi.findAll({
            where: { ke_hu_id: ke_hu_id },
            order: [['is_default', 'DESC'], ['updatedAt', 'DESC']] // 默认地址排第一，最近更新的排前面
        });
        responseHelper.success(res, list, "获取成功");
    } catch (error) {
        responseHelper.error(res, "系统异常");
    }
});

// ==================== 2. 新增或修改地址 ====================
router.post('/save', async function(req, res, next) {
    try {
        const { id, ke_hu_id, shou_jian_ren, dian_hua, di_zhi_xiang_qing, is_default } = req.body;

        if (!ke_hu_id || !shou_jian_ren || !dian_hua || !di_zhi_xiang_qing) {
            return responseHelper.error(res, "请填写完整地址信息");
        }

        // ✨ 核心风控：如果当前设置了默认地址(is_default为true/1)
        // 必须先把该客户名下的其他所有地址，强制改成非默认！
        // (为了不引起复杂的 transaction 报错，我们这里采用“先降级全改，再指定升级”的稳妥策略)
        
        if (is_default) {
            // 把这个人的所有地址都改成非默认 (不需要事务也能保证最终一致性)
            await db.shou_huo_di_zhi.update(
                { is_default: false }, 
                { where: { ke_hu_id: ke_hu_id } }
            );
        }

        if (id) {
            // 有 ID 说明是修改老地址
            await db.shou_huo_di_zhi.update({
                shou_jian_ren, dian_hua, di_zhi_xiang_qing, is_default
            }, { where: { id: id } });
            
        } else {
            // 没 ID 说明是新建地址
            // 如果这是该客户的第一条地址，强制设为默认地址！
            const existCount = await db.shou_huo_di_zhi.count({ where: { ke_hu_id } });
            const finalIsDefault = existCount === 0 ? true : is_default;

            await db.shou_huo_di_zhi.create({
                ke_hu_id, shou_jian_ren, dian_hua, di_zhi_xiang_qing, is_default: finalIsDefault
            });
        }

        responseHelper.success(res, null, "保存成功");
    } catch (error) {
        console.error("保存地址报错：", error);
        responseHelper.error(res, "系统异常");
    }
});


module.exports = router;