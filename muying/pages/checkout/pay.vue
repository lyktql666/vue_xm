<template>
  <view class="pay-container">
    
    <!-- 1. 收货地址选择区 (可点击跳转修改) -->
    <view class="address-section" @click="chooseAddress">
      <view class="addr-left">
        <text class="icon">📍</text>
        <view class="addr-info" v-if="currentAddress">
          <view class="addr-detail">{{ currentAddress.di_zhi_xiang_qing }}</view>
          <view class="addr-user">{{ currentAddress.shou_jian_ren }} {{ currentAddress.dian_hua }}</view>
        </view>
        <view class="addr-info empty" v-else>
          请点击选择收货地址
        </view>
      </view>
      <text class="arrow">></text>
      <!-- 底部的彩色信封条纹 -->
      <view class="address-border"></view>
    </view>

    <!-- 2. 商品核对区 -->
    <view class="goods-section box-card">
      <view class="title">商品明细</view>
      <scroll-view scroll-y class="goods-list">
        <view class="goods-item" v-for="(item, index) in checkoutItems" :key="index">
          <image class="pic" :src="item.pic_url || item.pic_urls?.[0] || '/static/default.png'" mode="aspectFill"></image>
          <view class="info">
            <view class="name">{{ item.name }}</view>
            <view class="price-row">
              <text class="price"><text class="symbol">¥</text>{{ item.jia_ge }}</text>
              <text class="count">x {{ item.shu_liang || item.buyCount || 1 }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3. 模拟支付方式选择 -->
    <view class="pay-method-section box-card">
      <view class="title">支付方式</view>
      <view class="method-item" @click="payType = 'wechat'">
        <view class="left"><text class="icon wechat">🟢</text><text class="name">微信支付</text></view>
        <view class="radio" :class="{ active: payType === 'wechat' }"></view>
      </view>
      <view class="method-item" @click="payType = 'alipay'">
        <view class="left"><text class="icon alipay">🔵</text><text class="name">支付宝</text></view>
        <view class="radio" :class="{ active: payType === 'alipay' }"></view>
      </view>
    </view>

    <!-- 4. 底部吸底支付栏 -->
    <view class="bottom-action">
      <view class="total-info">
        <text class="label">共 {{ totalCount }} 件，合计:</text>
        <text class="total-price"><text class="symbol">¥</text>{{ totalPrice }}</text>
      </view>
      <view class="pay-btn" :class="{ 'is-loading': isPaying }" @click="handlePay">
        {{ isPaying ? '处理中...' : '确认支付' }}
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const checkoutItems = ref([])
const currentAddress = ref(null)
const payType = ref('wechat')
const isPaying = ref(false)

// === 页面显示时，接住缓存数据 ===
onShow(() => {
  // 1. 接住从购物车传来的商品数组
  const items = uni.getStorageSync('checkoutItems')
  if (items) checkoutItems.value = items

  // 2. 接住从地址簿选回来的新地址
  const selected = uni.getStorageSync('selectedAddress')
  if (selected) {
    currentAddress.value = selected 
    uni.removeStorageSync('selectedAddress') // 阅后即焚
  } else if (!currentAddress.value) {
    fetchDefaultAddress() // 如果没选，去后台拉取默认地址
  }
})

// === 获取默认地址 ===
const fetchDefaultAddress = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  try {
    const res = await request.get('/address/list', { ke_hu_id: currentCustomerId })
    if (res.code === 200 && res.data.length > 0) {
      currentAddress.value = res.data.find(a => a.is_default == 1 || a.is_default === true) || res.data[0]
    }
  } catch (e) {}
}

// === 跳转修改地址 ===
const chooseAddress = () => {
  uni.setStorageSync('addressMode', 'select') 
  uni.navigateTo({ url: '/pages/address/list' })
}

// === 算账 ===
const totalCount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (item.shu_liang || 1), 0)
})

const totalPrice = computed(() => {
  let total = checkoutItems.value.reduce((sum, item) => sum + item.jia_ge * (item.shu_liang || 1), 0)
  return total.toFixed(2)
})

// === 🚀 核心：点击确认支付，一气呵成连调3个接口！ ===
const handlePay = async () => {
  if (!currentAddress.value) return uni.showToast({ title: '请先选择收货地址', icon: 'none' })
  if (isPaying.value) return
  
  const currentCustomerId = uni.getStorageSync('customerId')
  isPaying.value = true
  uni.showLoading({ title: '支付处理中...' })

  try {
    // 组装下单需要的格式
    const orderItems = checkoutItems.value.map(item => ({
      shang_pin_id: item.shang_pin_id || item.id, // 兼容购物车和详情页直接购买
      shu_liang: item.shu_liang || 1,
      price: item.jia_ge
    }))

    // 1. 创单接口 (生成订单，包含选好的地址)
    const createRes = await request.post('/ding_dan/create', {
      ke_hu_id: currentCustomerId,
      address_id: currentAddress.value.id,
      items: orderItems
    })

    if (createRes.code === 200) {
      
      // 2. 支付接口 (改状态为 1 待发货)
      const payRes = await request.post('/ding_dan/pay_success', { order_id: createRes.data.order_id })
      
      if (payRes.code === 200) {
        // 3. 销毁购物车接口 (提取购物车ID去删掉)
        const cartIds = checkoutItems.value.filter(i => i.cart_id).map(i => i.cart_id)
        if (cartIds.length > 0) {
          await request.post('/cart/delete_batch', { cart_ids: cartIds })
        }

        uni.hideLoading()
        uni.showToast({ title: '支付成功！', icon: 'success' })
    
        uni.removeStorageSync('checkoutItems')
        setTimeout(() => { uni.switchTab({ url: '/pages/cart/cart' }) }, 1500)
      }
    } else {
      uni.hideLoading()
      uni.showToast({ title: createRes.message || '下单失败', icon: 'none' })
      isPaying.value = false
    }
  } catch (error) {
    uni.hideLoading()
    isPaying.value = false
  }
}
</script>

<style scoped>
.pay-container { background: #f5f5f5; min-height: 100vh; padding-bottom: 80px; }
.box-card { background: #fff; margin: 12px; border-radius: 12px; padding: 15px; }
.title { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #f9f9f9; padding-bottom: 10px;}

/* 地址条 */
.address-section { background: #fff; margin: 12px; border-radius: 12px; padding: 20px 15px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }
.addr-left { display: flex; align-items: flex-start; flex: 1; }
.icon { font-size: 18px; margin-right: 8px; margin-top: 2px;}
.addr-info { flex: 1; }
.addr-info.empty { color: #ff4d4f; font-weight: bold; font-size: 15px; line-height: 24px;}
.addr-detail { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 6px; }
.addr-user { font-size: 13px; color: #666; }
.arrow { color: #ccc; font-weight: bold; font-size: 16px; margin-left: 10px;}
.address-border { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: repeating-linear-gradient(-45deg, #ff4d4f 0, #ff4d4f 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%); background-size: 80px; }

/* 商品列表 */
.goods-list { max-height: 300px; }
.goods-item { display: flex; margin-bottom: 15px; }
.goods-item:last-child { margin-bottom: 0; }
.pic { width: 70px; height: 70px; border-radius: 6px; margin-right: 12px; background: #f9f9f9;}
.info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.name { font-size: 13px; color: #333; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.price { color: #ff4d4f; font-weight: bold; font-size: 16px;}
.symbol { font-size: 12px; margin-right: 2px; }
.count { font-size: 13px; color: #999; }

/* 支付方式 */
.method-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
.method-item:last-child { border-bottom: none; padding-bottom: 0;}
.left { display: flex; align-items: center; }
.wechat { color: #07c160; }
.alipay { color: #1677ff; }
.name { font-size: 15px; color: #333; }
.radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ddd; transition: all 0.2s; }
.radio.active { border-color: #ff4d4f; border-width: 6px; }

/* 底部操作栏 */
.bottom-action { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 15px; padding-bottom: calc(10px + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; z-index: 100;}
.total-info { display: flex; align-items: baseline; }
.label { font-size: 13px; color: #666; margin-right: 8px; }
.total-price { font-size: 22px; font-weight: bold; color: #ff4d4f; }
.total-price .symbol { font-size: 14px; margin-right: 2px;}
.pay-btn { background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; height: 40px; line-height: 40px; padding: 0 30px; border-radius: 20px; font-size: 15px; font-weight: bold; transition: opacity 0.3s; }
.pay-btn.is-loading { opacity: 0.6; pointer-events: none;}
</style>