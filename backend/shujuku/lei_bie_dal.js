const { where } = require("sequelize");
const db = require("./mysqlmuying");

const lei_bie = db.lei_bie;
const spu = db.spu;
const shang_pin = db.shang_pin; // SKU alias
const shang_pin_pi_ci = db.shang_pin_pi_ci;

function leibiedal() {
    
    // ================= 1. 获取类别列表（带动态统计统计）=================
    this.getALL = async function (page) {
        const curPage = parseInt(page.currentPage) || 1;
        const pageSize = parseInt(page.pageSize) || 10;
        const offset = (curPage - 1) * pageSize;

        // 1. 先把当前页的类别全部查出来
        const { count, rows } = await lei_bie.findAndCountAll({
            offset: offset,
            limit: pageSize,
            order: [['id', 'DESC']]
        });

        // 2. 遍历这些类别，去商品表里帮它们挨个算“商品数”和“总库存”
        const formattedLists = [];
        
        // 注意：因为里面有 await，所以必须用 for...of 循环，不能用 map
        for (let item of rows) {
            
            const sp_count = await spu.count({
                where: { lei_xing_id: item.id }
            });

            let total_stock = 0;
            const spus = await spu.findAll({
                where: { lei_xing_id: item.id },
                attributes: ['id']
            });
            const spuIds = spus.map(p => p.id);

            if (spuIds.length > 0) {
                const skus = await shang_pin.findAll({
                    where: { spu_id: spuIds },
                    attributes: ['id']
                });
                const skuIds = skus.map(k => k.id);

                if (skuIds.length > 0) {
                    const sumResult = await shang_pin_pi_ci.sum('pi_ci_ku_cun', {
                        where: { shang_pin_id: skuIds }
                    });
                    total_stock = sumResult || 0;
                }
            }

            formattedLists.push({
                id: item.id,
                name: item.name,
                isActive: item.isActive,
                sp_count: sp_count || 0,                 
                total_stock: total_stock // ✨ 把最新算出来的真实总库存传给前端 ✨
            });
        }

        return {
            lists: formattedLists,
            total: count           
        };
    };

    this.createSP=async function(model){
        var u= await lei_bie.create(model)
        return u;

    };
    this.getSP=async function (id) {
            var tea=await lei_bie.findOne({where:{id:id}});
            return tea;
            
    };
    this.updateSP=async function(model){
            let ireturn= await lei_bie.update(
               model,
            {where:{id:model.id}}
        )
        return ireturn;
    };
    this.deleteSP=async function(id){
            await lei_bie.destroy({where:{id:id}});
    }

    
}

module.exports = leibiedal;