const { where } = require("sequelize");
const db = require("./mysqlmuying");

// 引入需要联动的三大模型
const ding_dan = db.ding_dan;
const ke_hu = db.ke_hu;
const shang_pin = db.shang_pin;
const spu = db.spu;
const ding_dan_xiang_qing = db.DD_XQ;
const SP_tu_pian = db.SP_tu_pian; 
const shou_huo_di_zhi = db.shou_huo_di_zhi;


function dingdandal() {

    // ================= 1. 获取订单列表 (兼容B端全局查 & C端查自己) =================
   // ================= 1. 获取订单列表 (兼容B端全局查 & C端查自己) =================
    this.getALL = async function (page) {
        const curPage = parseInt(page.currentPage) || 1;
        const pageSize = parseInt(page.pageSize) || 10;
        const offset = (curPage - 1) * pageSize;

        const queryWhere = {};
        if (page.status !== undefined && page.status !== '') {
            queryWhere.zhuang_tai = parseInt(page.status);
        }
        if (page.ke_hu_id) {
            queryWhere.ke_hu_id = page.ke_hu_id;
        }

        const { count, rows } = await ding_dan.findAndCountAll({
            where: queryWhere,
            include: [
                { model: ke_hu, attributes: ["xing_ming", "dian_hua"] },
                { 
                    model: shou_huo_di_zhi, 
                    as: "delivery_address",
                    attributes: ["shou_jian_ren", "dian_hua", "di_zhi_xiang_qing"] 
                },
                {
                    model: shang_pin, // 底层其实是 SKU 表
                    attributes: ["id"], 
                    through: { attributes: ["shu_liang", "mai_ru_jia"] },
                    include: [
                        {
                            model: spu,
                            as: "spu_info",
                            attributes: ["name"],
                            include: [
                                // ✨ 核心修复 1：把 as 改成你在底层定义的 "spu_images" ✨
                                { model: SP_tu_pian, as: "spu_images", attributes: ["pic_url"] }
                            ]
                        }
                    ]
                }
            ],
            offset: offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
            distinct: true 
        });

        const formattedLists = rows.map((item) => {
            
            const productsArray = item.skus || item.shang_pins || [];

            return {
                id: item.id,
                ding_dan_hao: item.ding_dan_hao,
                fu_kuan_jing_e: item.fu_kuan_jing_e,
                zhuang_tai: item.zhuang_tai,
                createdAt: item.createdAt,
                ke_hu_name: item.ke_hu ? item.ke_hu.xing_ming : "未知客户",
                
                shou_jian_ren: item.delivery_address ? item.delivery_address.shou_jian_ren : "未填写",
                shou_huo_dian_hua: item.delivery_address ? item.delivery_address.dian_hua : "未填写",
                shou_huo_di_zhi: item.delivery_address ? item.delivery_address.di_zhi_xiang_qing : "地址信息丢失",
                
                // 遍历商品明细
                goods_list: productsArray.map(good => {
                    const spuInfo = good.spu_info || {}; 
                    
                    return {
                        shang_pin_id: good.id,
                        shang_pin_name: spuInfo.name || "未知商品",
                        buy_count: good.ding_dan_xiang_qing ? good.ding_dan_xiang_qing.shu_liang : 1,
                        buy_price: good.ding_dan_xiang_qing ? good.ding_dan_xiang_qing.mai_ru_jia : 0,
                        // ✨ 核心修复 2：提取数据时，也必须用 spu_images 这个名字来拿 ✨
                        pic_urls: spuInfo.spu_images ? spuInfo.spu_images.map(img => img.pic_url) : []
                    }
                })
            };
        });

        return {
            lists: formattedLists,
            total: count
        };
    };
    // ================= 2. 修改订单状态（比如发货） =================
    this.updateStatus = async function (model) {
        // 比如把状态从 1(待发货) 改成 2(已发货)
        let result = await ding_dan.update(
            { zhuang_tai: model.zhuang_tai }, 
            { where: { id: model.id } }
        );
        return result;
    };

    this.deleteDD = async function(id) {
    // 删主表前，先把它的多对多关联中间表数据清空
    await ding_dan_xiang_qing.destroy({ where: { ding_dan_id: id } });
    
    // 扫清障碍后，才能安心删除订单主表
    await ding_dan.destroy({ where: { id: id } });
};

this.createOrder = async function(orderData) {
        // 开启轻量级事务，保证主表和详情表同时成功或同时失败
        const transaction = await db.sequelize.transaction();
        
        try {
            // 1. 计算总金额
            let totalAmount = 0;
            for (let item of orderData.items) {
                totalAmount += item.price * item.shu_liang;
            }

            // 2. 生成订单主表 (状态 0 = 待付款)
            const newOrder = await ding_dan.create({
                ding_dan_hao: "DD" + Date.now() + Math.floor(Math.random() * 1000), 
                ke_hu_id: orderData.ke_hu_id,
                fu_kuan_jing_e: totalAmount,
                shou_huo_di_zhi_id: orderData.address_id,
                zhuang_tai: 0 
            }, { transaction });

            // 3. 生成详情快照数组
            const detailRecords = orderData.items.map(item => {
                return {
                    ding_dan_id: newOrder.id,
                    
                   
                    shang_pin_id_2: item.shang_pin_id, 
                    
                    shu_liang: item.shu_liang,
                    mai_ru_jia: item.price
                }
            });
            
            // 4. 批量插入详情表
            await ding_dan_xiang_qing.bulkCreate(detailRecords, { transaction });

            // 提交事务
            await transaction.commit();
            
            return newOrder; // 把生成的订单返回给路由
            
        } catch (error) {
            await transaction.rollback();
            throw error; // 把错误抛给路由
        }
    };


    // ================= 模拟支付成功（改变状态） =================
    this.payOrder = async function(orderId) {
        // 去数据库查这个订单
        const order = await ding_dan.findByPk(orderId);
        
        if (!order) {
            throw new Error("订单不存在");
        }
        if (order.zhuang_tai !== 0) {
            throw new Error("该订单不可支付或已支付");
        }

        // 修改状态为 1 (待发货)
        await order.update({ zhuang_tai: 1 });
        return order;
    };


}

module.exports = dingdandal;