const Sequelize =require("sequelize");
const user=require("./deng_lu_sj");
const lei_bie=require("./lei_bie_sj");
const tu_pian=require("./SP_tu_pian");
const ding_dan=require("./ding_dan_sj");
const ke_hu=require("./ke_hu_sj");
const DD_XQ=require("./ding_dan_xiang_qing_sj");
const ping_jia = require("./ping_jia_sj"); 
const shou_huo_di_zhi = require("./shou_huo_di_zhi_sj");
const shang_pin_pi_ci = require("./shang_pin_pi_ci");
const ping_jia_hui_fu = require("./ping_jia_hui_fu_sj");
const dian_zan = require("./dian_zan_sj");
const dian_pu = require("./dian_pu_sj");
const spu = require("./spu_sj");
const sku = require("./sku_sj");
const gou_wu_che = require("./gou_wu_che_sj");
const seq =new Sequelize("db_muying","root","Lyk20050819",{
    host:"localhost",
    dialect:"mysql"
});
const deng_lu_sj=user(seq);
const lei_bie_sj=lei_bie(seq);
const SP_tu_pian_sj=tu_pian(seq);
const ding_dan_sj=ding_dan(seq);
const ke_hu_sj=ke_hu(seq);
const DD_XQ_sj=DD_XQ(seq);
const ping_jia_sj = ping_jia(seq);
const shou_huo_di_zhi_sj = shou_huo_di_zhi(seq);
const shang_pin_pi_ci_sj = shang_pin_pi_ci(seq);
const ping_jia_hui_fu_sj = ping_jia_hui_fu(seq);
const dian_zan_sj = dian_zan(seq);
const dian_pu_sj = dian_pu(seq);
const spu_sj = spu(seq);
const sku_sj = sku(seq);
const gou_wu_che_sj = gou_wu_che(seq);



spu_sj.belongsTo(lei_bie_sj,{foreignKey:"lei_xing_id"});
lei_bie_sj.hasMany(spu_sj,{foreignKey:"lei_xing_id"});
spu_sj.hasMany(SP_tu_pian_sj,{foreignKey:"spu_id",as: "spu_images"});
SP_tu_pian_sj.belongsTo(spu_sj,{foreignKey:"spu_id"});

sku_sj.belongsTo(spu_sj, { foreignKey: "spu_id", as: "spu_info" });
spu_sj.hasMany(sku_sj, { foreignKey: "spu_id", as: "skus" });

sku_sj.hasMany(SP_tu_pian_sj, { sourceKey: "spu_id", foreignKey: "spu_id", as: "images" });

sku_sj.belongsTo(dian_pu_sj, { foreignKey: "dian_pu_id", as: "shop" });
dian_pu_sj.hasMany(sku_sj, { foreignKey: "dian_pu_id", as: "products" });

sku_sj.hasMany(shang_pin_pi_ci_sj, { foreignKey: "shang_pin_id", as: "batches" });
shang_pin_pi_ci_sj.belongsTo(sku_sj, { foreignKey: "shang_pin_id" });

ding_dan_sj.belongsTo(ke_hu_sj,{foreignKey:"ke_hu_id"});
ke_hu_sj.hasMany(ding_dan_sj,{foreignKey:"ke_hu_id"});

ding_dan_sj.belongsToMany(sku_sj,{through:DD_XQ_sj,foreignKey:"ding_dan_id",otherKey:"shang_pin_id_2"});
sku_sj.belongsToMany(ding_dan_sj,{through:DD_XQ_sj,foreignKey:"shang_pin_id_2",otherKey:"ding_dan_id"});

sku_sj.hasMany(ping_jia_sj, { foreignKey: "shang_pin_id", as: "reviews" });
ping_jia_sj.belongsTo(sku_sj, { foreignKey: "shang_pin_id" });

// 2. 客户和评价 (1 对 多) - 为了知道是谁评价的
ke_hu_sj.hasMany(ping_jia_sj, { foreignKey: "ke_hu_id" });
ping_jia_sj.belongsTo(ke_hu_sj, { foreignKey: "ke_hu_id" });

ke_hu_sj.hasMany(shou_huo_di_zhi_sj, { foreignKey: "ke_hu_id", as: "addresses" });
shou_huo_di_zhi_sj.belongsTo(ke_hu_sj, { foreignKey: "ke_hu_id" });

ding_dan_sj.belongsTo(shou_huo_di_zhi_sj, { foreignKey: "shou_huo_di_zhi_id", as: "delivery_address" });

ping_jia_sj.hasMany(ping_jia_hui_fu_sj, { foreignKey: "ping_jia_id", as: "replies" });
ping_jia_hui_fu_sj.belongsTo(ping_jia_sj, { foreignKey: "ping_jia_id" });

ke_hu_sj.hasMany(ping_jia_hui_fu_sj, { foreignKey: "ke_hu_id" });
ping_jia_hui_fu_sj.belongsTo(ke_hu_sj, { foreignKey: "ke_hu_id" });

ding_dan_sj.hasMany(DD_XQ_sj, { foreignKey: "ding_dan_id" });
DD_XQ_sj.belongsTo(ding_dan_sj, { foreignKey: "ding_dan_id" });

ke_hu_sj.hasMany(dian_zan_sj, { foreignKey: "ke_hu_id" });
dian_zan_sj.belongsTo(ke_hu_sj, { foreignKey: "ke_hu_id" });

ke_hu_sj.hasMany(gou_wu_che_sj, { foreignKey: "ke_hu_id", as: "cartItems" });
gou_wu_che_sj.belongsTo(ke_hu_sj, { foreignKey: "ke_hu_id" });

// 商品(SKU)与购物车 (1对多，同一个商品可以被多个人加购物车)
sku_sj.hasMany(gou_wu_che_sj, { foreignKey: "shang_pin_id" });
gou_wu_che_sj.belongsTo(sku_sj, { foreignKey: "shang_pin_id", as: "sku_info" });

seq.sync({alter:true});//与数据库同步                                                                                                                                                                                                                                                                            
module.exports.users=deng_lu_sj;
module.exports.shang_pin=sku_sj;
module.exports.spu=spu_sj;
module.exports.sku=sku_sj;
module.exports.lei_bie=lei_bie_sj;
module.exports.SP_tu_pian=SP_tu_pian_sj;
module.exports.ding_dan=ding_dan_sj;
module.exports.ke_hu=ke_hu_sj;
module.exports.DD_XQ=DD_XQ_sj;
module.exports.ping_jia = ping_jia_sj;
module.exports.shou_huo_di_zhi = shou_huo_di_zhi_sj;
module.exports.shang_pin_pi_ci = shang_pin_pi_ci_sj;
module.exports.ping_jia_hui_fu = ping_jia_hui_fu_sj;
module.exports.dian_zan = dian_zan_sj;
module.exports.dian_pu = dian_pu_sj;
module.exports.gou_wu_che = gou_wu_che_sj;
module.exports.sequelize = seq;




