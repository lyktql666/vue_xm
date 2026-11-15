<template>
  <view class="order-page">
    
    <!-- 顶部状态切换 Tabs -->
    <view class="tabs-header">
      <view 
        class="tab-item" 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="{ active: currentStatus === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <view class="line" v-if="currentStatus === tab.value"></view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list" @scrolltolower="loadMore">
      
      <view class="order-card" v-for="order in orderList" :key="order.id">
        <!-- 订单头 -->
        <view class="card-header">
          <text class="shop-name">官方自营旗舰店 ></text>
          <text class="status-text" :class="getStatusClass(order.zhuang_tai)">
            {{ getStatusText(order.zhuang_tai) }}
          </text>
        </view>
        
        <!-- 商品快照明细 -->
        <view class="goods-item" v-for="good in order.goods_list" :key="good.shang_pin_id" @click="goToDetail(good.shang_pin_id)">
          <image class="pic" :src="good.pic_urls?.[0] || '/static/default.png'" mode="aspectFill"></image>
          <view class="info">
            <view class="name">{{ good.shang_pin_name }}</view>
            <view class="price-row">
              <text class="price">¥{{ good.buy_price }}</text>
              <text class="count">x{{ good.buy_count }}</text>
            </view>
          </view>
        </view>

        <!-- 价格统计 -->
        <view class="total-row">
          <text>共 {{ getTotalCount(order.goods_list) }} 件商品</text>
          <text class="amount-wrap">实付款 <text class="amount">¥{{ order.fu_kuan_jing_e }}</text></text>
        </view>

        <!-- 底部操作按钮 -->
        <view class="action-row">
          <!-- 待付款 -->
          <template v-if="order.zhuang_tai === 0">
                      <!-- ✨ 加上 @click="cancelOrder(order)" ✨ -->
                      <view class="btn plain" @click="cancelOrder(order)">取消订单</view>
                      <!-- 去支付的按钮之前已经绑定过了 -->
                      <view class="btn primary" @click="payNow(order)">去支付</view>
                    </template>
          
          <!-- 待发货 -->
          <template v-if="order.zhuang_tai === 1">
            <view class="btn plain">修改地址</view>
            <view class="btn plain">申请退款</view>
          </template>
          
          <!-- 待收货 (已发货) -->
          <template v-if="order.zhuang_tai === 2">
            <view class="btn plain">查看物流</view>
            <!-- ✨ 极其重要的业务按钮：确认收货，状态变为 3 ✨ -->
            <view class="btn primary" @click="confirmReceipt(order.id)">确认收货</view>
          </template>
          
          <!-- 已完成 (待评价) -->
          <template v-if="order.zhuang_tai === 3">
            <view class="btn plain">申请售后</view>
            <view class="btn primary plain-primary" @click="goToReview(order)">去评价</view>
          </template>
        </view>
      </view>

      <view v-if="orderList.length === 0" class="empty-state">
        <text class="empty-text">暂无相关订单</text>
      </view>
      <view class="bottom-space"></view>

    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '待收货', value: 2 },
  { label: '待评价', value: 3 }
]

const currentStatus = ref('')
const orderList = ref([])

onLoad((options) => {
  if (options.status !== undefined && options.status !== 'undefined') {
    // 微信传过来的参数是字符串，转一下数字。如果是空字符串则不变
    currentStatus.value = options.status === '' ? '' : parseInt(options.status)
  }
  fetchOrders()
})

const switchTab = (status) => {
  currentStatus.value = status
  fetchOrders()
}

const fetchOrders = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  if (!currentCustomerId) return;

  try {
    const res = await request.get('/ding_dan', { 
      currentPage: 1, pageSize: 50, 
      ke_hu_id: currentCustomerId,
      status: currentStatus.value 
    })
    if (res.code === 200) {
      orderList.value = res.data.lists || []
    }
  } catch (error) {}
}

// 辅助方法
const getStatusText = (status) => {
  const map = { 0: '待付款', 1: '待发货', 2: '卖家已发货', 3: '交易完成', '-1': '交易关闭' }
  return map[status] || '未知'
}
const getStatusClass = (status) => {
  if (status === 0 || status === 2) return 'text-red'
  if (status === 3) return 'text-green'
  return 'text-gray'
}
const getTotalCount = (goodsList) => {
  return goodsList.reduce((sum, item) => sum + item.buy_count, 0)
}

// === 业务跳转与流转 ===
const goToDetail = (id) => {
  // 跳转回商品详情
}

const payNow = (order) => {
  // 直接跳转收银台
  uni.navigateTo({ url: `/pages/checkout/pay?order_id=${order.id}&amount=${order.fu_kuan_jing_e}` })
}

// C 端确认收货：将状态从 2 变 3！
const confirmReceipt = async (orderId) => {
  uni.showModal({
    title: '确认收货', content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        // 由于为了偷懒，我们可以直接复用 B 端的修改状态接口！
        // 假设你在 ding_dan.js 路由里还有 /xiugai 这个接口
        try {
          const upRes = await request.post('/ding_dan/xiugai', { id: orderId, zhuang_tai: 3 })
          if (upRes.code === 200) {
            uni.showToast({ title: '收货成功' })
            fetchOrders() // 刷新列表
          }
        } catch (e) {}
      }
    }
  })
}

const goToReview = (order) => {
  // 真实项目中：带着 order 里的商品数据跳转到发布评价页面
  uni.showToast({ title: '去评价', icon: 'none' })
}

const loadMore = () => { /* 翻页逻辑预留 */ }
</script>

<style scoped>
.order-page { background-color: #f4f4f4; height: 100vh; display: flex; flex-direction: column; }

/* 顶部 Tabs */
.tabs-header { display: flex; background: #fff; height: 44px; align-items: center; justify-content: space-around; position: relative; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,0.02);}
.tab-item { font-size: 14px; color: #666; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; transition: color 0.3s;}
.tab-item.active { color: #ff4d4f; font-weight: bold; }
.line { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 3px; background: #ff4d4f; border-radius: 2px; }

/* 列表区 */
.order-list { flex: 1; padding: 12px; }
.order-card { background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 12px; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.shop-name { font-size: 14px; font-weight: bold; color: #333; }
.status-text { font-size: 13px; }
.text-red { color: #ff4d4f; }
.text-green { color: #07c160; }
.text-gray { color: #999; }

.goods-item { display: flex; margin-bottom: 12px; }
.pic { width: 75px; height: 75px; border-radius: 6px; background: #f9f9f9; margin-right: 12px; flex-shrink: 0;}
.info { flex: 1; display: flex; justify-content: space-between; }
.name { font-size: 13px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; margin-right: 10px;}
.price-row { display: flex; flex-direction: column; align-items: flex-end; }
.price { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 4px;}
.count { font-size: 12px; color: #999; }

.total-row { text-align: right; font-size: 12px; color: #666; margin-top: 5px; margin-bottom: 15px; }
.amount-wrap { margin-left: 10px; }
.amount { font-size: 16px; font-weight: bold; color: #333; margin-left: 4px;}

.action-row { display: flex; justify-content: flex-end; align-items: center; }
.btn { padding: 6px 16px; border-radius: 16px; font-size: 13px; margin-left: 10px; border: 1px solid #ccc; color: #333; }
.btn.primary { border-color: #ff4d4f; color: #fff; background: linear-gradient(90deg, #ff6034, #ee0a24); border: none; }
.btn.plain-primary { border-color: #ff4d4f; color: #ff4d4f; background: transparent; border: 1px solid #ff4d4f; }

.empty-state { text-align: center; padding-top: 100px; }
.empty-text { color: #999; font-size: 14px; }
.bottom-space { height: 40px; }
</style>