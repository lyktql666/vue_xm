const { where } = require("sequelize");
const db = require("./mysqlmuying");
const fs = require('fs').promises;
const { constants } = require('fs');
const path = require('path');

const shang_pin = db.shang_pin; // 这里仍然保留老名称，但它现在指向 SKU
const spu = db.spu;
const lei_bie = db.lei_bie;
const SP_tu_pian = db.SP_tu_pian;
const ping_jia = db.ping_jia;
const ke_hu = db.ke_hu;
const shang_pin_pi_ci = db.shang_pin_pi_ci;
const ping_jia_hui_fu = db.ping_jia_hui_fu;
const dian_zan = db.dian_zan;

function userdal() {
    
    // ================= 1. 新增商品（含多图）=================
     this.createSP = async function(model) {
        let spuRecord = null;
        if (model.spu_id) {
            spuRecord = await spu.findByPk(model.spu_id);
        }

        if (!spuRecord) {
            spuRecord = await spu.create({
                name: model.name,
                pin_pai: model.pin_pai,
                bao_zhi_qi: model.bao_zhi_qi,
                lei_xing_id: model.lei_xing_id
            });
        }

        const newSku = await shang_pin.create({
            jia_ge: model.jia_ge,
            zhuang_tai: model.zhuang_tai === undefined ? true : model.zhuang_tai,
            spu_id: spuRecord.id,
            dian_pu_id: model.dian_pu_id
        });

        // ✨✨ 核心修复：自动生成初始库存批次 ✨✨
        if (model.ku_cun && model.ku_cun > 0) {
            // 算出一个 3 年后的日期作为默认保质期
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 3);

            // 往批次表里插入前端填写的初始库存！
            await shang_pin_pi_ci.create({
                dao_qi_shi_jian: futureDate,
                pi_ci_ku_cun: model.ku_cun,
                shang_pin_id: newSku.id // 绑定刚生成的商品 ID
            });
        }

        if (model.pic_urls && model.pic_urls.length > 0) {
            const imgRecords = model.pic_urls.map(url => {
                return {
                    spu_id: spuRecord.id,
                    pic_url: url
                }
            });
            await SP_tu_pian.bulkCreate(imgRecords);
        }
        return newSku;
    };

    // ================= 2. 获取商品列表（✨带回复的终极增强版✨）=================
    this.getALL = async function (page) {
        const curPage = parseInt(page.currentPage) || 1;
        const pageSize = parseInt(page.pageSize) || 10;
        const offset = (curPage - 1) * pageSize;

        const { count, rows } = await shang_pin.findAndCountAll({
            include: [
                {
                    model: spu,
                    as: "spu_info",
                    include: [
                        { model: lei_bie, attributes: ["id", "name"] },
                        { model: SP_tu_pian, as: "spu_images", attributes: ["pic_url"] }
                    ]
                },
                { model: shang_pin_pi_ci, as: "batches", attributes: ["id", "dao_qi_shi_jian", "pi_ci_ku_cun"] },
                {
                    model: ping_jia,
                    as: "reviews",
                    include: [
                        { model: ke_hu, attributes: ["xing_ming"] },
                        {
                            model: ping_jia_hui_fu,
                            as: "replies",
                            include: [{ model: ke_hu, attributes: ["xing_ming"] }]
                        }
                    ]
                }
            ],
            offset: offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']], 
            distinct: true 
        });

        const formattedLists = await Promise.all(rows.map(async (item) => {
            let totalStock = 0;
            let batchList = [];
            if (item.batches && item.batches.length > 0) {
                item.batches.forEach(batch => {
                    totalStock += batch.pi_ci_ku_cun;
                    batchList.push({ id: batch.id, dao_qi_shi_jian: batch.dao_qi_shi_jian, pi_ci_ku_cun: batch.pi_ci_ku_cun });
                });
            }

            let avgStar = 0;
            let reviewList = [];
            if (item.reviews && item.reviews.length > 0) {
                let totalStar = 0;
                for (let r of item.reviews) {
                    totalStar += r.star;
                    const reviewLikeCount = await db.dian_zan.count({
                        where: { target_type: 'review', target_id: r.id }
                    });

                    let isReviewLiked = false;
                    if (page.ke_hu_id) {
                        const existReviewLike = await db.dian_zan.findOne({
                            where: { target_type: 'review', target_id: r.id, ke_hu_id: page.ke_hu_id }
                        });
                        if (existReviewLike) isReviewLiked = true;
                    }

                    let replyList = [];
                    if (r.replies && r.replies.length > 0) {
                        for (let reply of r.replies) {
                            const replyLikeCount = await db.dian_zan.count({
                                where: { target_type: 'reply', target_id: reply.id }
                            });

                            let isReplyLiked = false;
                            if (page.ke_hu_id) {
                                const existReplyLike = await db.dian_zan.findOne({
                                    where: { target_type: 'reply', target_id: reply.id, ke_hu_id: page.ke_hu_id }
                                });
                                if (existReplyLike) isReplyLiked = true;
                            }

                            replyList.push({
                                id: reply.id,
                                content: reply.content,
                                time: reply.createdAt,
                                customer_name: reply.ke_hu ? reply.ke_hu.xing_ming : "某热心网友",
                                reply_to_name: reply.reply_to_name,
                                likeCount: replyLikeCount,
                                isLiked: isReplyLiked
                            });
                        }
                    }

                    reviewList.push({
                        id: r.id,
                        content: r.content,
                        star: r.star,
                        time: r.createdAt,
                        customer_name: r.ke_hu ? r.ke_hu.xing_ming : "匿名用户",
                        isExpanded: false,
                        replies: replyList,
                        likeCount: reviewLikeCount,
                        isLiked: isReviewLiked
                    });
                }
                avgStar = Number((totalStar / item.reviews.length).toFixed(1));
            }

            const spuInfo = item.spu_info || {};

            return {
                id: item.id,
                name: spuInfo.name || "未知商品",
                jia_ge: item.jia_ge,
                zhuang_tai: item.zhuang_tai,
                pin_pai: spuInfo.pin_pai || '未知品牌',
                bao_zhi_qi: spuInfo.bao_zhi_qi || '未设置',
                lei_xing_id: spuInfo.lei_xing_id,
                lei_xing: spuInfo.lei_bie ? spuInfo.lei_bie.name : "未分类",
                pic_urls: spuInfo.spu_images ? spuInfo.spu_images.map(img => img.pic_url) : [],
                total_stock: totalStock,
                batches: batchList,
                avg_star: avgStar,
                reviews: reviewList
            };
        }));

        return { lists: formattedLists, total: count };
    };

    // ================= 3. 获取分类列表 =================
    this.getAllLeiBie = async function () {
        var lists = await lei_bie.findAll({
            where: { isActive: true },
            attributes: ["id", "name"]
        });
        return lists;
    };

    // ================= 4. 获取单个商品 =================
    this.getSP = async function (id) {
        var tea = await shang_pin.findOne({
            where: { id: id },
            include: [
                {
                    model: spu,
                    as: "spu_info",
                    include: [
                        { model: SP_tu_pian, as: "spu_images", attributes: ["pic_url"] }
                    ]
                },
                { model: shang_pin_pi_ci, as: "batches", attributes: ["id", "dao_qi_shi_jian", "pi_ci_ku_cun"] }
            ]
        });
        return tea;
    };

    // ================= 5. 更新商品（含多图）=================
    this.updateSP = async function(model) {
        const skuRecord = await shang_pin.findByPk(model.id);
        if (!skuRecord) {
            throw new Error('SKU not found');
        }

        // 更新 SPU (公共信息)
        const spuPayload = {};
        if (model.name !== undefined) spuPayload.name = model.name;
        if (model.pin_pai !== undefined) spuPayload.pin_pai = model.pin_pai;
        if (model.bao_zhi_qi !== undefined) spuPayload.bao_zhi_qi = model.bao_zhi_qi;
        if (model.lei_xing_id !== undefined) spuPayload.lei_xing_id = model.lei_xing_id;

        if (Object.keys(spuPayload).length > 0) {
            await spu.update(spuPayload, { where: { id: skuRecord.spu_id } });
        }

        // 更新 SKU (价格、状态、店铺)
        const skuPayload = {};
        if (model.jia_ge !== undefined) skuPayload.jia_ge = model.jia_ge;
        if (model.zhuang_tai !== undefined) skuPayload.zhuang_tai = model.zhuang_tai;
        if (model.dian_pu_id !== undefined) skuPayload.dian_pu_id = model.dian_pu_id;

        let ireturn = await shang_pin.update(skuPayload, { where: { id: model.id } });

        // ✨✨ 核心修复：处理前端编辑表单传过来的 ku_cun ✨✨
        if (model.ku_cun !== undefined && model.ku_cun >= 0) {
            // 找一下这件商品有没有历史批次记录
            const existBatch = await shang_pin_pi_ci.findOne({ where: { shang_pin_id: model.id } });
            
            if (existBatch) {
                // 如果有，就直接更新数量
                await existBatch.update({ pi_ci_ku_cun: model.ku_cun });
            } else {
                // 如果没有，就帮他新建一个 3年过期的批次
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 3);
                await shang_pin_pi_ci.create({
                    dao_qi_shi_jian: futureDate,
                    pi_ci_ku_cun: model.ku_cun,
                    shang_pin_id: model.id
                });
            }
        }

        // 更新图片
        if (model.pic_urls !== undefined) {
            const oldImages = await SP_tu_pian.findAll({ where: { spu_id: skuRecord.spu_id } });
            oldImages.forEach(img => {
                if (!model.pic_urls.includes(img.pic_url)) {
                    deletePhysicalFile(img.pic_url);
                }
            });
            await SP_tu_pian.destroy({ where: { spu_id: skuRecord.spu_id } });
            if (model.pic_urls.length > 0) {
                const imgRecords = model.pic_urls.map(url => ({ spu_id: skuRecord.spu_id, pic_url: url }));
                await SP_tu_pian.bulkCreate(imgRecords);
            }
        }
        return ireturn;
    };

    // ================= 6. 删除商品（含多图 + 物理清理）=================
    this.deleteSP = async function(id) {
        const skuRecord = await shang_pin.findByPk(id);
        if (!skuRecord) return;

        const images = await SP_tu_pian.findAll({ where: { spu_id: skuRecord.spu_id } });
        images.forEach(img => {
            deletePhysicalFile(img.pic_url);
        });

        await SP_tu_pian.destroy({ where: { spu_id: skuRecord.spu_id } });
        await shang_pin_pi_ci.destroy({ where: { shang_pin_id: id } });
        await shang_pin.destroy({ where: { id: id } });
    }

}

// 专门负责去硬盘里删图片的工具函数
async function deletePhysicalFile(pic_url) {
    if (!pic_url) return;
    try {
        const filename = pic_url.substring(pic_url.lastIndexOf('/') + 1);
        if (!filename) return;

        const filePath = path.join(process.cwd(), 'public', 'tupian', filename);
        try {
             await fs.access(filePath, constants.F_OK);
        } catch(e) {
             console.log("文件不存在，跳过删除");
             return;
        }

        await fs.unlink(filePath);
        console.log("垃圾清理成功!");
    } catch (error) {
        console.error("异步删除物理文件报错:", error.message);
    }
}

module.exports = userdal;