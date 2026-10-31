var express = require('express');
var router = express.Router();
var responseHelper = require("../utils/responseHelper");
const db = require("../shujuku/mysqlmuying");

// ==================== 1. 加入购物车 ====================
router.post('/add', async function(req, res, next) {
    try {
        const { ke_hu_id, shang_pin_id, shu_liang } = req.body;

        if (!ke_hu_id || !shang_pin_id) return responseHelper.error(res, "参数缺失");

        // 核心：查一下这个人的购物车里，是不是已经有这个商品了？
        let cartItem = await db.gou_wu_che.findOne({
            where: { ke_hu_id, shang_pin_id }
        });

        if (cartItem) {
            // 如果有了，数量直接相加
            await cartItem.update({ shu_liang: cartItem.shu_liang + (shu_liang || 1) });
        } else {
            // 如果没有，新增一条记录
            await db.gou_wu_che.create({ ke_hu_id, shang_pin_id, shu_liang: shu_liang || 1 });
        }

        responseHelper.success(res, null, "加入购物车成功");
    } catch (error) {
        console.error("加购报错：", error);
        responseHelper.error(res, "系统异常");
    }
});

// ==================== 2. 获取购物车列表 (真实连表查价格和图片) ====================
router.get('/list', async function(req, res, next) {
    try {
        const { ke_hu_id } = req.query;
        if (!ke_hu_id) return responseHelper.error(res, "请先登录");

        // 连表神技：购物车 -> 查出对应的商品(SKU) -> 查出商品所属的SPU -> 查出SPU图片
        const cartList = await db.gou_wu_che.findAll({
            where: { ke_hu_id },
            include: [{
                model: db.shang_pin, // SKU表
                as: "sku_info",
                attributes: ["id", "jia_ge", "zhuang_tai"],
                include: [{
                    model: db.spu, // SPU表
                    as: "spu_info",
                    attributes: ["name", "pin_pai"],
                    include: [{ model: db.SP_tu_pian, as: "spu_images", attributes: ["pic_url"] }]
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        // 扁平化清洗给前端
        const formattedList = cartList.map(item => {
            const sku = item.sku_info || {};
            const spu = sku.spu_info || {};
            return {
                cart_id: item.id,
                shang_pin_id: item.shang_pin_id,
                shu_liang: item.shu_liang,
                // 提取商品的真实价格和图片
                name: spu.name || "失效商品",
                jia_ge: sku.jia_ge || 0,
                zhuang_tai: sku.zhuang_tai, // 如果=0说明商家下架了
                pic_url: (spu.spu_images && spu.spu_images.length > 0) ? spu.spu_images[0].pic_url : '/static/default.png'
            };
        });

        responseHelper.success(res, formattedList, "获取成功");
    } catch (error) {
        console.error("查询购物车报错：", error);
        responseHelper.error(res, "系统异常");
    }
});

router.post('/delete_batch', async function(req, res, next) {
    try {
        // 接收前端传来的购物车 ID 数组 (比如: [1, 2, 5])
        const { cart_ids } = req.body;
        
        if (!cart_ids || cart_ids.length === 0) {
            return responseHelper.error(res, "参数缺失，无需清理");
        }

        // 调用 Sequelize 批量销毁这些购物车记录！
        await db.gou_wu_che.destroy({
            where: { 
                id: cart_ids // Sequelize 会自动转成 SQL 的 WHERE id IN (1, 2, 5)
            }
        });

        console.log("🛒 购物车清理成功！已删除记录ID：", cart_ids);
        responseHelper.success(res, null, "清理成功");

    } catch (error) {
        console.error("清理购物车报错：", error);
        responseHelper.error(res, "系统异常");
    }
});

module.exports = router;