var express = require('express');
var router = express.Router();
var responseHelper = require("../utils/responseHelper");
const { Op } = require("sequelize");
const db = require("../shujuku/mysqlmuying");

router.post('/add_review', async function(req, res, next) {
    try {
        const { sku_id, shang_pin_id, ke_hu_id, content, star } = req.body;
        const targetSkuId = sku_id || shang_pin_id;
        console.log("👉 收到评价请求：", req.body);

        if (!targetSkuId || !ke_hu_id) {
            return responseHelper.error(res, "参数缺失，无法评价！");
        }

        if (!db.DD_XQ) {
            console.error("🚨 致命错误：db.ding_dan_xiang_qing 是 undefined！请检查 mysqlmuying.js 有没有把它 export 出来！");
            return responseHelper.error(res, "服务器配置错误");
        }

        // 1. 去中间表查购买记录
        const boughtRecord = await db.DD_XQ.findOne({
            where: { shang_pin_id_2: targetSkuId },
            include: [{
                model: db.ding_dan,
                where: { 
                    ke_hu_id: ke_hu_id,
                    zhuang_tai: { [Op.gte]: 2 }
                }
            }]
        });

        if (!boughtRecord) {
            return responseHelper.error(res, "抱歉，您未购买过该商品或未签收，无法评价！");
        }

        // 2. 写入评价
        await db.ping_jia.create({ shang_pin_id: targetSkuId, ke_hu_id, content, star });
        
        console.log("✅ 评价发布成功！");
        responseHelper.success(res, null, "评价发布成功！");

    } catch (error) {
        console.error("🚨 发表评价接口崩溃：", error);
        responseHelper.error(res, "系统异常");
    }
});

// 回复接口
router.post('/add_reply', async function(req, res, next) {
    try {
        // ✨ 增加接收 reply_to_name ✨
        const { ping_jia_id, ke_hu_id, content, reply_to_name } = req.body;
        
        await db.ping_jia_hui_fu.create({ 
            ping_jia_id, 
            ke_hu_id, 
            content,
            reply_to_name // 存入数据库
        });
        
        responseHelper.success(res, null, "回复成功！");
    } catch (error) {
        console.error("🚨 回复接口崩溃：", error);
        responseHelper.error(res, "系统异常");
    }
});

router.post('/toggle_like', async function(req, res, next) {
    try {
        const { target_type, target_id, ke_hu_id } = req.body;
        
        // 查一下之前有没有点过赞
        const existLike = await db.dian_zan.findOne({
            where: { target_type, target_id, ke_hu_id }
        });

        if (existLike) {
            // 点过赞了，就取消（删除）
            await existLike.destroy();
            return responseHelper.success(res, { isLiked: false }, "已取消点赞");
        } else {
            // 没点过赞，就加上（新建）
            await db.dian_zan.create({ target_type, target_id, ke_hu_id });
            return responseHelper.success(res, { isLiked: true }, "点赞成功");
        }
    } catch (error) {
        console.error("点赞接口崩溃：", error);
        responseHelper.error(res, "系统异常");
    }
});

module.exports = router;