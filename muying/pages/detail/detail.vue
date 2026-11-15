<template>
  <view class="page-container" v-if="product">
    
    <!-- ================= 页面主体内容 ================= -->
    <scroll-view scroll-y class="scroll-content">
      
      <!-- 1. 商品主图轮播 -->
      <swiper class="main-swiper" circular autoplay indicator-dots indicator-active-color="#ff4d4f">
        <swiper-item v-for="(url, index) in product.pic_urls" :key="index" @click="previewImages(product.pic_urls, index)">
          <image class="swiper-img" :src="url" mode="aspectFill"></image>
        </swiper-item>
      </swiper>

      <!-- 2. 价格与标题区 -->
      <view class="info-section box-card">
        <view class="price-row">
          <text class="symbol">¥</text>
          <text class="price">{{ product.jia_ge }}</text>
          <text class="stock">库存: {{ product.total_stock }}</text>
        </view>
        <view class="title"><text class="tag">自营</text>{{ product.name }}</view>
        <view class="sub-info">
          <text>品牌: {{ product.pin_pai || '无' }}</text>
          <text>保质期: {{ product.bao_zhi_qi || '未设置' }}</text>
        </view>
      </view>

      <!-- 3. 评价外漏区 -->
      <view class="review-section box-card">
        <view class="review-header" @click="goToReview">
          <text class="review-title">买家评价 ({{ product.reviews?.length || 0 }})</text>
          <view class="review-more">
            好评度 <text class="highlight">{{ goodRate }}%</text> 
            <text class="arrow">></text>
          </view>
        </view>
        
        <!-- 评价列表外漏 -->
        <view class="review-list" v-if="product.reviews && product.reviews.length > 0">
          <view class="review-item" v-for="(item, index) in product.reviews.slice(0, 2)" :key="item.id">
            <view class="user-info">
              <image class="avatar" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" mode="aspectFill"></image>
              <text class="name">{{ item.customer_name }}</text>
              <text class="stars">⭐ {{ item.star }}.0</text>
            </view>
            <view class="content">{{ item.content }}</view>
          </view>
        </view>
        <view v-else class="empty-review">暂无评价，快来抢沙发吧~</view>
        
        <view class="view-all-btn" v-if="product.reviews && product.reviews.length > 0" @click="goToReview">查看全部评价</view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>


    <!-- ================= 底部吸底操作栏 ================= -->
    <view class="bottom-action-bar">
      <view class="icon-btn" @click="goHome">
        <text class="icon">🏠</text><text class="icon-text">首页</text>
      </view>
      <view class="icon-btn" @click="goCart">
        <text class="icon">🛒</text><text class="icon-text">购物车</text>
      </view>
      <view class="btn-group">
        <view class="btn add-cart" @click="openSkuPopup('cart')">加入购物车</view>
        <view class="btn buy-now" @click="openSkuPopup('buy')">立即购买</view>
      </view>
    </view>


    <!-- ================= ✨ 史诗级：淘宝同款半屏 SKU 弹窗 ✨ ================= -->
    <view class="sku-mask" v-if="showSkuPopup" @click="closeSkuPopup">
      <view class="sku-content" @click.stop :class="{ 'show': showSkuPopup }">
        
        <view class="close-icon" @click="closeSkuPopup">✕</view>

        <view class="service-tags">
          <text class="tag-item">大促价保</text> · 
          <text class="tag-item">退货宝</text> · 
          <text class="tag-item">假一赔四</text>
        </view>

        <!-- ✨ 核心：地址选择区 (仅立即购买时显示) ✨ -->
        <view class="address-box" v-if="popupType === 'buy'" @click="chooseAddress">
          <view class="addr-left">
            <text class="icon">📍</text>
            <view class="addr-info">
              <view class="addr-detail truncate">{{ currentAddress?.di_zhi_xiang_qing || '请点击选择收货地址' }}</view>
              <view class="addr-user" v-if="currentAddress">{{ currentAddress.shou_jian_ren }} {{ currentAddress.dian_hua }}</view>
            </view>
          </view>
          <text class="arrow">></text>
        </view>

        <!-- 商品核心信息摘要 -->
        <view class="sku-header">
          <image class="sku-img" :src="product.pic_urls?.[0] || '/static/default.png'" mode="aspectFill" @click="previewImages(product.pic_urls, 0)"></image>
          <view class="sku-info">
            <view class="sku-price-row">
              <text class="price-label">实付</text>
              <text class="symbol">¥</text>
              <text class="price-num">{{ (product.jia_ge * buyCount).toFixed(2) }}</text>
            </view>
            <view class="sku-stock">库存 {{ product.total_stock }} 件</view>
            <view class="sku-chosen">已选：{{ buyCount }}件</view>
          </view>
        </view>

        <scroll-view scroll-y class="sku-scroll-area">
          <view class="spec-section">
            <view class="spec-title">颜色分类 (1)</view>
            <view class="spec-list">
              <view class="spec-item active">
                <image class="spec-img" :src="product.pic_urls?.[0] || '/static/default.png'" mode="aspectFill"></image>
                <text class="spec-text">{{ product.name }}</text>
              </view>
            </view>
          </view>

          <view class="buy-count-row">
            <text class="count-label">购买数量</text>
            <view class="num-ctrl">
              <view class="btn" :class="{ disabled: buyCount <= 1 }" @click="buyCount > 1 && buyCount--">-</view>
              <input class="num-input" type="number" v-model="buyCount" @blur="checkBuyCount" />
              <view class="btn" :class="{ disabled: buyCount >= product.total_stock }" @click="buyCount < product.total_stock && buyCount++">+</view>
            </view>
          </view>
          
          <view class="pay-method-box" v-if="popupType === 'buy'">
            <text class="label">支付方式</text>
            <view class="method-selector">
              <text class="wechat-icon">🟢</text>
              <text>微信支付</text>
              <text class="arrow">v</text>
            </view>
          </view>
        </scroll-view>

        <view class="sku-bottom-action">
          <view 
            class="big-submit-btn" 
            :class="{ 'buy-btn': popupType === 'buy', 'cart-btn': popupType === 'cart' }" 
            @click="confirmSkuAction"
          >
            {{ popupType === 'cart' ? '加入购物车' : `立即支付 ¥${(product.jia_ge * buyCount).toFixed(2)}` }}
          </view>
        </view>

      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const product = ref(null)
const currentAddress = ref(null) // 用户选中的地址

const showSkuPopup = ref(false)
const popupType = ref('cart')
const buyCount = ref(1)

// ================= 生命周期 =================
onLoad((options) => {
  const data = uni.getStorageSync('currentProduct')
  if (data) product.value = data
})

onShow(() => {
  fetchLatestData()
  
  // ✨ 核心：检查是不是刚从地址簿选完地址回来？✨
  const selected = uni.getStorageSync('selectedAddress')
  if (selected) {
    currentAddress.value = selected 
    uni.removeStorageSync('selectedAddress') // 阅后即焚
  } else if (!currentAddress.value) {
    // 如果没有刚选的地址，并且当前地址为空，去后台拉取默认地址
    fetchDefaultAddress()
  }
})

// ================= 数据获取 =================
const fetchLatestData = async () => {
  if (!product.value || !product.value.id) return;
  const currentCustomerId = uni.getStorageSync('customerId') || ''; 
  try {
    const res = await request.get('/sp_lie_biao', { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId })
    if (res.code === 200) {
      const latestData = res.data.lists.find(item => item.id === product.value.id)
      if (latestData) {
        product.value = latestData 
        uni.setStorageSync('currentProduct', latestData) 
      }
    }
  } catch (e) {}
}

const fetchDefaultAddress = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  if(!currentCustomerId) return;
  try {
    // 请求我们之前在后端 address.js 写好的列表接口
    const res = await request.get('/address/list', { ke_hu_id: currentCustomerId })
    if (res.code === 200 && res.data.length > 0) {
      // is_default 是布尔值或数字1，用双等号宽容匹配
      currentAddress.value = res.data.find(a => a.is_default == 1 || a.is_default === true) || res.data[0]
    }
  } catch (e) {}
}

// ================= 计算属性与功能 =================
const goodRate = computed(() => {
  if (!product.value?.reviews || product.value.reviews.length === 0) return 100
  const goodReviews = product.value.reviews.filter(r => r.star >= 3)
  return Math.round((goodReviews.length / product.value.reviews.length) * 100)
})

const previewImages = (urls, current) => {
  if (!urls || urls.length === 0) return;
  const cleanUrls = urls.map(url => url.startsWith('http') ? url : 'http://' + url).map(url => url.replace('localhost', '127.0.0.1'));
  uni.previewImage({ urls: cleanUrls, current: cleanUrls[current] })
}

const checkBuyCount = () => {
  let val = parseInt(buyCount.value)
  if (isNaN(val) || val < 1) buyCount.value = 1
  if (val > product.value.total_stock) buyCount.value = product.value.total_stock
}

// ================= 弹窗控制与跳转 =================
const openSkuPopup = (type) => {
  popupType.value = type
  showSkuPopup.value = true
}

const closeSkuPopup = () => {
  showSkuPopup.value = false
  setTimeout(() => { buyCount.value = 1 }, 300) 
}

// ✨ 跳转到独立的地址选择页 ✨
const chooseAddress = () => {
  uni.setStorageSync('addressMode', 'select') // 告诉地址页，我是来选地址的
  uni.navigateTo({ url: '/pages/address/list' })
}

const goToReview = () => { uni.navigateTo({ url: `/pages/detail/review` }) }
const goHome = () => { uni.switchTab({ url: '/pages/index/index' }) }
const goCart = () => { uni.switchTab({ url: '/pages/cart/cart' }) }


// ================= 核心业务：确认加入购物车/立即购买 =================
const confirmSkuAction = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  if (!currentCustomerId) return uni.showToast({ title: '请先去个人中心登录', icon: 'none' })
  
  if (product.value.total_stock < buyCount.value) {
    return uni.showToast({ title: '手慢了，库存不足', icon: 'error' })
  }

  // --- 情况 A：加入购物车 ---
  if (popupType.value === 'cart') {
    try {
      const res = await request.post('/cart/add', {
        ke_hu_id: currentCustomerId,
        shang_pin_id: product.value.id,
        shu_liang: buyCount.value
      })
      if (res.code === 200) {
        uni.showToast({ title: '已加入购物车', icon: 'success' })
        closeSkuPopup()
      } else {
        uni.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch (e) {}
    return;
  }

  // --- 情况 B：极速支付 (直接创单) ---
  if (!currentAddress.value) {
    return uni.showToast({ title: '请先选择收货地址', icon: 'none' })
  }

  uni.showLoading({ title: '正在锁定库存...' })
  
  try {
    const res = await request.post('/ding_dan/create', {
      ke_hu_id: currentCustomerId,
      address_id: currentAddress.value.id, // 传真实的地址 ID
      items: [{
        shang_pin_id: product.value.id,
        shu_liang: buyCount.value,
        price: product.value.jia_ge
      }]
    })
    
    if (res.code === 200) {
      const payRes = await request.post('/ding_dan/pay_success', { order_id: res.data.order_id })
      
      uni.hideLoading()
      if (payRes.code === 200) {
        uni.vibrateShort() 
        uni.showToast({ title: '支付成功！', icon: 'success' })
        closeSkuPopup()
      }
    } else {
      uni.hideLoading()
      uni.showToast({ title: res.message || '下单失败', icon: 'none', duration: 3000 })
    }
  } catch (e) {
    uni.hideLoading()
  }
}
</script>

<style scoped>
/* 这里的样式与你之前的一模一样，非常完美，直接复用即可 */
.page-container { background-color: #f4f4f4; height: 100vh; display: flex; flex-direction: column; position: relative;}
.scroll-content { flex: 1; overflow-y: auto; }
.box-card { background: #fff; margin: 10px; border-radius: 12px; padding: 15px; }
.main-swiper { height: 350px; background: #fff; }
.swiper-img { width: 100%; height: 100%; }
.price-row { color: #ff4d4f; margin-bottom: 10px; display: flex; align-items: baseline;}
.symbol { font-size: 16px; margin-right: 2px; }
.price { font-size: 28px; font-weight: bold; }
.stock { font-size: 12px; color: #999; margin-left: auto; }
.title { font-size: 16px; font-weight: bold; color: #333; line-height: 1.5; margin-bottom: 10px; }
.tag { background: #ff4d4f; color: #fff; font-size: 10px; padding: 2px 5px; border-radius: 4px; margin-right: 6px; vertical-align: middle; }
.sub-info { font-size: 12px; color: #666; display: flex; justify-content: space-between; }

.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; }
.review-more { font-size: 12px; color: #666; font-weight: normal; }
.highlight { color: #ff4d4f; font-weight: bold; }
.review-item { margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
.user-info { display: flex; align-items: center; margin-bottom: 8px; }
.avatar { width: 24px; height: 24px; border-radius: 50%; background: #eee; margin-right: 8px; }
.name { font-size: 13px; color: #333; flex: 1; }
.stars { font-size: 12px; color: #ff9900; }
.content { font-size: 14px; color: #333; line-height: 1.5; }
.view-all-btn { text-align: center; font-size: 13px; color: #333; border: 1px solid #ddd; border-radius: 15px; padding: 6px 0; width: 120px; margin: 10px auto 0; }
.empty-review { text-align: center; color: #999; font-size: 13px; padding: 20px 0; }
.bottom-space { height: 80px; }

.bottom-action-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 50px; background: #fff; display: flex; align-items: center; padding: 0 10px; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; }
.icon-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50px; font-size: 10px; color: #666; }
.icon { font-size: 20px; margin-bottom: 2px; }
.btn-group { flex: 1; display: flex; margin-left: 10px; border-radius: 20px; overflow: hidden; height: 40px; }
.btn { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #fff; }
.add-cart { background: linear-gradient(90deg, #ffcb00, #ff9402); }
.buy-now { background: linear-gradient(90deg, #ff6034, #ee0a24); }

.sku-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: flex-end; }
.sku-content { background: #fff; width: 100%; border-radius: 16px 16px 0 0; padding: 20px 15px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); position: relative; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.close-icon { position: absolute; top: 12px; right: 15px; font-size: 22px; color: #999; padding: 5px; z-index: 10; }

.service-tags { text-align: center; color: #ff4d4f; font-size: 12px; font-weight: bold; padding: 15px 0 10px; }
.tag-item { margin: 0 4px; }

.address-box { display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; padding: 12px 15px; margin: 0 15px 20px; border-radius: 8px; cursor: pointer;}
.addr-left { display: flex; align-items: flex-start; flex: 1; overflow: hidden; }
.addr-left .icon { font-size: 16px; margin-right: 6px; margin-top: 2px;}
.addr-info { flex: 1; overflow: hidden; }
.addr-detail { font-size: 13px; color: #333; font-weight: bold; margin-bottom: 4px; }
.addr-user { font-size: 11px; color: #999; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.arrow { color: #ccc; font-family: consolas; }

.sku-header { display: flex; padding: 0 15px; margin-bottom: 20px; }
.sku-img { width: 96px; height: 96px; border-radius: 8px; background: #f5f5f5; border: 1px solid #eee; margin-right: 15px; flex-shrink: 0;}
.sku-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.sku-price-row { color: #ff4d4f; display: flex; align-items: baseline; margin-bottom: 6px; }
.price-label { font-size: 12px; margin-right: 4px; font-weight: bold; }
.sku-price-row .symbol { font-size: 16px; }
.price-num { font-size: 26px; font-weight: bold; }
.sku-stock { font-size: 12px; color: #999; margin-bottom: 4px; }
.sku-chosen { font-size: 12px; color: #333; }

.sku-scroll-area { flex: 1; padding: 0 15px; }

.spec-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 12px; }
.spec-list { display: flex; flex-wrap: wrap; margin-bottom: 25px; }
.spec-item { display: flex; align-items: center; background: #f5f5f5; padding: 4px; padding-right: 12px; border-radius: 6px; border: 1px solid transparent; }
.spec-item.active { background: #fff0f0; border-color: #ff4d4f; color: #ff4d4f; font-weight: bold; }
.spec-img { width: 30px; height: 30px; border-radius: 4px; margin-right: 8px; }
.spec-text { font-size: 12px; }

.buy-count-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.count-label { font-size: 14px; font-weight: bold; color: #333; }
.num-ctrl { display: flex; align-items: center; background: #f5f5f5; border-radius: 6px; }
.num-ctrl .btn { width: 32px; height: 32px; line-height: 32px; text-align: center; font-size: 18px; color: #333; font-weight: bold; }
.num-ctrl .btn.disabled { color: #ccc; }
.num-input { width: 44px; height: 32px; text-align: center; font-size: 14px; font-weight: bold; background: #f5f5f5;}

.pay-method-box { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 30px;}
.pay-method-box .label { font-size: 14px; color: #333; }
.method-selector { display: flex; align-items: center; background: #f5f5f5; padding: 6px 12px; border-radius: 15px; font-size: 12px; color: #333;}
.wechat-icon { font-size: 14px; margin-right: 4px; }

.sku-bottom-action { padding: 10px 15px; padding-bottom: calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid #f9f9f9; }
.big-submit-btn { width: 100%; height: 44px; line-height: 44px; text-align: center; border-radius: 22px; font-size: 16px; font-weight: bold; color: #fff; transition: opacity 0.3s; }
.big-submit-btn:active { opacity: 0.8; }
.buy-btn { background: linear-gradient(90deg, #ff6034, #ee0a24); box-shadow: 0 4px 10px rgba(238,10,36,0.2); }
.cart-btn { background: linear-gradient(90deg, #ffcb00, #ff9402); }
</style>