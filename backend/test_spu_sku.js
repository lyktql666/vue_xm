// 测试 SPU/SKU 拆分的脚本
const db = require('./shujuku/mysqlmuying');

async function testSPUSKU() {
    try {
        console.log('开始测试 SPU/SKU 拆分...');

        // 确保测试分类存在
        const [category] = await db.lei_bie.findOrCreate({
            where: { name: '测试分类' },
            defaults: { isActive: true }
        });

        // 测试创建 SPU
        const spu = await db.spu.create({
            name: '测试商品',
            pin_pai: '测试品牌',
            bao_zhi_qi: '2025-12-31',
            lei_xing_id: category.id
        });
        console.log('✅ SPU 创建成功:', spu.id);

        // 确保测试店铺存在
        const [shop] = await db.dian_pu.findOrCreate({
            where: { name: '测试店铺' },
            defaults: { logo: null, description: '用于 SPU/SKU 测试' }
        });

        // 测试创建 SKU
        const sku = await db.sku.create({
            jia_ge: 99.99,
            zhuang_tai: 1,
            spu_id: spu.id,
            dian_pu_id: shop.id
        });
        console.log('✅ SKU 创建成功:', sku.id);

        // 测试关联查询
        const skuWithSPU = await db.sku.findOne({
            where: { id: sku.id },
            include: [{ model: db.spu, as: 'spu_info' }]
        });
        console.log('✅ SKU 关联查询成功:', skuWithSPU.spu_info.name);

        // 测试通过别名查询
        const skuViaAlias = await db.shang_pin.findOne({
            where: { id: sku.id },
            include: [{ model: db.spu, as: 'spu_info' }]
        });
        console.log('✅ 通过别名查询成功:', skuViaAlias.spu_info.name);

        console.log('🎉 所有测试通过！SPU/SKU 拆分成功！');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    } finally {
        process.exit();
    }
}

testSPUSKU();