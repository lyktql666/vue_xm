<template>
  <view class="page-container">
    <view class="header-bg"></view>

    <!-- 用户信息卡片 -->
    <view class="user-card" @click="checkLogin">
      <image class="avatar" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" mode="aspectFill"></image>
      <view class="info" v-if="isLogin">
        <view class="name">{{ userInfo.xing_ming || '尊贵的会员' }}</view>
        <view class="phone">手机号：{{ userInfo.dian_hua || '未绑定' }}</view>
      </view>
      <view class="info" v-else>
        <view class="name">点击登录/注册</view>
        <view class="phone">登录后享受更多专属服务</view>
      </view>
    </view>

    <!-- ✨ 核心升级：我的订单区块 (带红点和跳转) ✨ -->
    <view class="order-section box-card">
      <view class="section-title" @click="goToOrder('')">
        <text>我的订单</text>
        <text class="view-all">全部 ></text>
      </view>
      
      <view class="order-grid">
        <view class="grid-item" @click="goToOrder(0)">
          <view class="icon-wrap">
            <text class="icon">💳</text>
            <view class="badge" v-if="orderCounts.pay > 0">{{ orderCounts.pay }}</view>
          </view>
          <text class="text">待付款</text>
        </view>
        
        <view class="grid-item" @click="goToOrder(1)">
          <view class="icon-wrap">
            <text class="icon">📦</text>
            <view class="badge" v-if="orderCounts.ship > 0">{{ orderCounts.ship }}</view>
          </view>
          <text class="text">待发货</text>
        </view>
        
        <view class="grid-item" @click="goToOrder(2)">
          <view class="icon-wrap">
            <text class="icon">🚚</text>
            <view class="badge" v-if="orderCounts.recv > 0">{{ orderCounts.recv }}</view>
          </view>
          <text class="text">待收货</text>
        </view>
        
        <view class="grid-item" @click="goToOrder(3)">
          <view class="icon-wrap">
            <text class="icon">💬</text>
            <view class="badge" v-if="orderCounts.review > 0">{{ orderCounts.review }}</view>
          </view>
          <text class="text">待评价</text>
        </view>
        
        <view class="grid-item" @click="goToOrder(-1)">
          <view class="icon-wrap">
            <text class="icon">💰</text>
          </view>
          <text class="text">退款/售后</text>
        </view>
      </view>
    </view>

    <!-- 必备服务区块 -->
    <view class="service-section box-card">
      <view class="section-title"><text>必备服务</text></view>
      <view class="list-item" @click="goToAddressList">
        <text class="left">📍 收货地址管理</text><text class="right">></text>
      </view>
      <view class="list-item">
        <text class="left">🎧 联系专属客服</text><text class="right">></text>
      </view>
    </view>

    <view v-if="isLogin" class="logout-btn" @click="handleLogout">退出登录</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const isLogin = ref(false)
const userInfo = ref({})

// ✨ 订单数量统计响应式变量
const orderCounts = ref({
  pay: 0,   // 待付款 (0)
  ship: 0,  // 待发货 (1)
  recv: 0,  // 待收货 (2)
  review: 0 // 待评价 (3)
})

onShow(() => {
  const customerId = uni.getStorageSync('customerId')
  if (customerId) {
    isLogin.value = true
    userInfo.value = uni.getStorageSync('customerInfo') || {}
    fetchOrderStats(customerId) // ✨ 登录了就去拉取订单数量
  } else {
    isLogin.value = false
    userInfo.value = {}
    resetCounts()
  }
})

// ✨ 获取并计算订单红点数量 ✨
const fetchOrderStats = async (customerId) => {
  try {
    const res = await request.get('/ding_dan', { ke_hu_id: customerId, pageSize: 100 })
    if (res.code === 200 && res.data.lists) {
      const orders = res.data.lists
      // 遍历过滤，统计各状态数量
      orderCounts.value.pay = orders.filter(o => o.zhuang_tai === 0).length
      orderCounts.value.ship = orders.filter(o => o.zhuang_tai === 1).length
      orderCounts.value.recv = orders.filter(o => o.zhuang_tai === 2).length
      orderCounts.value.review = orders.filter(o => o.zhuang_tai === 3).length
    }
  } catch (error) {}
}

const resetCounts = () => {
  orderCounts.value = { pay: 0, ship: 0, recv: 0, review: 0 }
}

// ✨ 跳转到专属的订单列表页，并带上状态参数 ✨
const goToOrder = (status) => {
  if (!isLogin.value) return uni.showToast({ title: '请先登录', icon: 'none' })
  // status 可能是 0, 1, 2, 3，如果是空字符串则代表查全部
  uni.navigateTo({ url: `/pages/order/list?status=${status}` })
}

const goToAddressList = () => {
  if (!isLogin.value) return uni.showToast({ title: '请先登录', icon: 'none' })
  uni.removeStorageSync('addressMode') 
  uni.navigateTo({ url: '/pages/address/list' })
}

const checkLogin = () => {
  if (!isLogin.value) uni.navigateTo({ url: '/pages/login/login' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示', content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        uni.removeStorageSync('customerId')
        uni.removeStorageSync('customerInfo')
        isLogin.value = false
        resetCounts()
        uni.showToast({ title: '已退出', icon: 'none' })
      }
    }
  });
}
</script>

<style scoped>
.page-container { background-color: #f4f4f4; min-height: 100vh; position: relative; padding-bottom: 20px;}
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 200px; background: linear-gradient(to bottom, #ff4d4f, #ff7a7b); border-radius: 0 0 20% 20%; z-index: 0; }
.box-card { background: #fff; margin: 0 15px 15px; border-radius: 12px; padding: 15px; position: relative; z-index: 10; }

.user-card { display: flex; align-items: center; padding: 30px 20px 20px; position: relative; z-index: 10; margin-top: 40px; }
.avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid #fff; margin-right: 15px; background: #eee; }
.info .name { font-size: 20px; font-weight: bold; color: #fff; margin-bottom: 5px; }
.info .phone { font-size: 13px; color: rgba(255,255,255,0.8); }

.section-title { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
.view-all { font-size: 12px; color: #999; font-weight: normal; }

/* 宫格样式与红点定位 */
.order-grid { display: flex; justify-content: space-between; }
.grid-item { display: flex; flex-direction: column; align-items: center; position: relative; }
.icon-wrap { position: relative; display: inline-block; margin-bottom: 8px;}
.icon { font-size: 26px; }
.badge { position: absolute; top: -4px; right: -8px; background: #ff4d4f; color: #fff; border: 1px solid #fff; font-size: 10px; min-width: 14px; height: 14px; line-height: 12px; text-align: center; border-radius: 7px; font-weight: bold; padding: 0 3px;}
.text { font-size: 12px; color: #666; }

.list-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px; color: #333; }
.list-item:last-child { border-bottom: none; padding-bottom: 0; }
.right { color: #ccc; }
.logout-btn { margin: 20px 15px; background: #fff; color: #333; text-align: center; height: 46px; line-height: 46px; border-radius: 23px; font-size: 15px; }
</style>