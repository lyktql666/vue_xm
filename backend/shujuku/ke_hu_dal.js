const { where } = require("sequelize");
const db = require("./mysqlmuying");

const ke_hu = db.ke_hu;
const ding_dan = db.ding_dan;
const shang_pin = db.shang_pin;
const spu = db.spu;
const lei_bie = db.lei_bie;
const shou_huo_di_zhi = db.shou_huo_di_zhi; // 引入地址表模型

function kehuDal() {
    this.getAllWithAnalysis = async function (page) {
        const curPage = parseInt(page.currentPage) || 1;
        const pageSize = parseInt(page.pageSize) || 10;
        const offset = (curPage - 1) * pageSize;

        const { count, rows } = await ke_hu.findAndCountAll({
            offset: offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
            distinct: true, 
            include: [
                {
                    model: shou_huo_di_zhi,
                    as: "addresses",
                    required: false
                },
                {
                    model: ding_dan,
                    attributes: ["id"], 
                    include: [
                        {
                            model: shang_pin,
                            attributes: ["id"],
                            include: [
                                {
                                    model: spu,
                                    as: "spu_info",
                                    attributes: ["name"],
                                    include: [{ model: lei_bie, attributes: ["age_tag", "name"] }]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        const formattedLists = rows.map((user) => {
            const ageTagCounter = {};
            let totalBuyCount = 0; 

            if (user.ding_dans && user.ding_dans.length > 0) {
                user.ding_dans.forEach(order => {
                    if (order.shang_pins) {
                        order.shang_pins.forEach(good => {
                            totalBuyCount++; 
                            const tag = (good.spu_info && good.spu_info.lei_bie && good.spu_info.lei_bie.age_tag) ? good.spu_info.lei_bie.age_tag : "孕期/通用";
                            if (ageTagCounter[tag]) ageTagCounter[tag]++;
                            else ageTagCounter[tag] = 1;
                        });
                    }
                });
            }

            let predictedStage = "暂无数据";
            let maxCount = 0;
            for (const tag in ageTagCounter) {
                if (ageTagCounter[tag] > maxCount) {
                    maxCount = ageTagCounter[tag];
                    predictedStage = tag; 
                }
            }

            // 把 user.addresses 这个对象数组，原封不动地传给前端去渲染
           const usedNames = new Set();
            const usedPhones = new Set();
            const usedAddresses = new Set();

            if (user.addresses && user.addresses.length > 0) {
                user.addresses.forEach(addr => {
                    // 把名字、电话、地址单独抽出来，丢进各自的池子里（Set 会自动过滤重复的）
                    if (addr.shou_jian_ren) usedNames.add(addr.shou_jian_ren);
                    if (addr.dian_hua) usedPhones.add(addr.dian_hua);
                    if (addr.di_zhi_xiang_qing) usedAddresses.add(addr.di_zhi_xiang_qing);
                });
            }

            return {
                id: user.id,
                xing_ming: user.xing_ming,
                dian_hua: user.dian_hua,
                createdAt: user.createdAt,
                
                // 把去重后的 Set 转换回普通数组，传给前端
                used_names: Array.from(usedNames),        
                used_phones: Array.from(usedPhones),      
                used_addresses: Array.from(usedAddresses),
                
                total_buy: totalBuyCount,                 
                predicted_stage: predictedStage,          
                stage_details: ageTagCounter              
            };
        });

        return { lists: formattedLists, total: count };
    };
    this.login = async function(model) {
        var u = await ke_hu.findOne({
                where: {
                
                dian_hua: model.dian_hua , 
                mi_ma:  model.mi_ma
            }
        });
        return u;
    };

    this.createUser = async function(model) {
        // 先检查手机号是否注册过，防止重复注册报错
        const existUser = await ke_hu.findOne({ where: { dian_hua: model.dian_hua } });
        if (existUser) {
            throw new Error("该手机号已被注册");
        }

        var u = await ke_hu.create(model);
        return u;
    };

}
module.exports = kehuDal;