var express = require('express');
var router = express.Router();
var DDdal=require("../shujuku/ding_dan_dal")
var responseHelper=require("../utils/responseHelper")
const ding_dan=new DDdal();


router.get('/', async function(req, res, next) {
  // 1. 获取前端传过来的分页参数
  // 如果前端没传，默认就是第 1 页，每页 10 条
  let page = {
    currentPage: parseInt(req.query.currentPage) || 1,
    pageSize: parseInt(req.query.pageSize) || 10,
    status: req.query.status ,
     ke_hu_id: req.query.ke_hu_id 
  };

  // 2. 把 page 对象传给 getALL 方法
  let result = await ding_dan.getALL(page);
  
  // 3. 返回给前端
  responseHelper.success(res, result, "获取数据成功");
})

router.post('/xiugai',async function(req,res,next){
  try {
    // 1. 接收前端传过来的完整的修改数据包 (里面包含 id，以及要改的 price/stock 等)
    let model = req.body; 
    
    // 2. 严谨一点：确保前端至少传了 id 过来，否则数据库不知道改哪一行
    if (!model.id) {
        return responseHelper.error(res, "修改失败，缺少订单ID");
    }

    // 3. 将数据包传给你图1写的 updateUser 方法
    let u = await ding_dan.updateStatus(model);
    
    // 4. 返回成功
    responseHelper.success(res, u, "修改成功");
  } catch (error) {
    console.error("修改订单报错：", error); // 留个日志方便排错
    responseHelper.error(res, "修改失败");
  }
})

router.post('/shanchu',async function(req,res,next){
  try {
    await ding_dan.deleteDD(req.body.id);
    responseHelper.success(res, null, "删除成功");
  } catch (error) {
    console.error("删除订单报错：", error); // 留个日志方便排错
    responseHelper.error(res, "删除失败");
  }
})

router.get('/detail', async function(req, res, next) {
    try {
        const { id } = req.query;
        // 真实查询订单表
        const order = await db.ding_dan.findByPk(id);
        if (!order) return responseHelper.error(res, "订单不存在");
        
        responseHelper.success(res, order, "查询成功");
    } catch (error) {
        responseHelper.error(res, "系统异常");
    }
});

router.post('/create', async function(req, res, next) {
    try {
        const { ke_hu_id, address_id, items } = req.body;

        // 基础参数拦截
        if (!ke_hu_id || !address_id || !items || items.length === 0) {
            return responseHelper.error(res, "参数错误，无法生成订单");
        }

        // ✨ 核心：直接召唤 DAL 层的 createOrder 方法！✨
        const newOrder = await ding_dan.createOrder(req.body);

        console.log("✅ 订单生成成功！订单号：", newOrder.id);
        responseHelper.success(res, { order_id: newOrder.id }, "订单创建成功");

    } catch (error) {
        console.error("🚨 路由层-生成订单崩溃：", error);
        responseHelper.error(res, "系统异常");
    }
});


// ==================== 2. 路由：支付成功 ====================
router.post('/pay_success', async function(req, res, next) {
    try {
        const { order_id } = req.body;
        
        if (!order_id) {
            return responseHelper.error(res, "缺少订单ID");
        }

        // ✨ 核心：召唤 DAL 层修改状态！✨
        await ding_dan.payOrder(order_id);
        
        console.log("💰 订单支付成功，状态已变为待发货！");
        responseHelper.success(res, null, "支付成功");

    } catch (error) {
        console.error("🚨 路由层-支付报错：", error);
        // 如果是我们在 DAL 里 throw new Error 的话，这里可以直接捕捉并弹给前端
        responseHelper.error(res, error.message || "系统异常");
    }
});

router.post('/cancel', async function(req, res, next) {
    try {
        const { order_id } = req.body;
        
        if (!order_id) return responseHelper.error(res, "缺少订单ID");

        // 去数据库查这个订单
        const order = await db.ding_dan.findByPk(order_id);
        if (!order) return responseHelper.error(res, "订单不存在");

        // 安全校验：只有待付款（0）的订单才能直接取消
        if (order.zhuang_tai !== 0) {
            return responseHelper.error(res, "只能取消待付款的订单");
        }

        // 直接把状态改成 -1 (已关闭/已取消)
        await order.update({ zhuang_tai: -1 });
        
        console.log(`🚫 订单 [${order.ding_dan_hao}] 已被客户取消！`);
        responseHelper.success(res, null, "订单取消成功");

    } catch (error) {
        console.error("取消订单报错：", error);
        responseHelper.error(res, "系统异常");
    }
});


module.exports = router;