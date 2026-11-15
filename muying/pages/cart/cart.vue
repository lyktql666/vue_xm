<template>
  <view class="cart-page">
    <view class="nav-header">购物车</view>

    <!-- 购物车列表区域 -->
    <scroll-view scroll-y class="cart-list" v-if="cartItems.length > 0">
      
      <view class="cart-item" v-for="item in cartItems" :key="item.cart_id">
        <!-- 1. 单选框 (点击切换选中状态) -->
        <view class="check-box" @click="toggleCheck(item)">
          <text class="icon" :class="{ 'is-checked': item.checked }">
            {{ item.checked ? '✓' : '' }}
          </text>
        </view>
        
        <!-- 2. 商品主图 (点击跳详情页) -->
        <image class="pic" :src="item.pic_url" mode="aspectFill" @click="goToDetail(item.shang_pin_id)"></image>
        
        <!-- 3. 商品信息 -->
        <view class="info" @click="goToDetail(item.shang_pin_id)">
          <view class="name">{{ item.name }}</view>
          
          <!-- 如果被后台下架了给出红字提示，并强制取消勾选 -->
          <view class="invalid-tip" v-if="!item.zhuang_tai">商品已失效/下架</view>
          
          <view class="price-row" v-else>
            <view class="price"><text class="symbol">¥</text>{{ item.jia_ge }}</view>
            <!-- 数量加减控制器 (阻止冒泡，防止误触跳转详情) -->
            <view class="num-ctrl" @click.stop>
              <text class="btn" @click.stop="changeNum(item, -1)">-</text>
              <text class="num">{{ item.shu_liang }}</text>
              <text class="btn" @click.stop="changeNum(item, 1)">+</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 没东西的空状态 -->
    <view v-else class="empty-cart">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车空空如也，快去挑点宝贝吧~</text>
      <view class="go-btn" @click="goHome">去逛逛</view>
    </view>

    <!-- 底部全选结算栏 -->
    <view class="bottom-bar" v-if="cartItems.length > 0">
      <view class="check-all" @click="toggleAll">
        <text class="icon" :class="{ 'is-checked': isAllChecked }">{{ isAllChecked ? '✓' : '' }}</text>
        <text>全选</text>
      </view>
      
      <view class="total-info">
        <text class="label">合计:</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      
      <view class="submit-btn" :class="{ 'disabled': totalCount === 0 }" @click="goToCheckout">
        结算 ({{ totalCount }})
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const cartItems = ref([])

// === 每次进入页面刷新真实数据 ===
onShow(() => {
  fetchCartList()
})

const fetchCartList = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  if (!currentCustomerId) return // 未登录时静默，显示空购物车即可

  try {
    const res = await request.get('/cart/list', { ke_hu_id: currentCustomerId })
    if (res.code === 200) {
      // 拿到后端数据后，给每个【上架中】的商品打上前端专用的勾选标记 checked: true
      cartItems.value = res.data.map(item => ({
        ...item,
        // 只有状态为1(上架)的商品才默认勾选，下架商品强制不勾选
        checked: item.zhuang_tai ? true : false 
      }))
    }
  } catch (error) {
    console.error("获取购物车失败", error)
  }
}

// === 核心算账魔法 (响应式计算) ===
const totalPrice = computed(() => {
  let total = 0
  cartItems.value.forEach(item => {
    // 只有勾选了，且商品没有下架的，才算钱！
    if (item.checked && item.zhuang_tai) {
      total += item.jia_ge * item.shu_liang
    }
  })
  return total.toFixed(2)
})

const totalCount = computed(() => {
  return cartItems.value.filter(item => item.checked && item.zhuang_tai).length
})

// === 全选与单选逻辑 ===
const isAllChecked = computed(() => {
  // 过滤出所有有效的(未下架)商品
  const validItems = cartItems.value.filter(item => item.zhuang_tai)
  if (validItems.length === 0) return false
  // 如果所有有效商品都被勾选了，全选按钮就亮起
  return validItems.every(item => item.checked)
})

const toggleCheck = (item) => {
  // 如果下架了，禁止勾选
  if (!item.zhuang_tai) {
    return uni.showToast({ title: '该商品已失效', icon: 'none' })
  }
  item.checked = !item.checked
}

const toggleAll = () => {
  const target = !isAllChecked.value // 反转当前状态
  cartItems.value.forEach(item => {
    // 只能操作上架的商品
    if (item.zhuang_tai) {
      item.checked = target
    }
  })
}

// === 加减数量 ===
const changeNum = (item, diff) => {
  if (item.shu_liang + diff < 1) return; // 最少买1件
  // 前端乐观更新 (如果追求极致严谨，这里应该发个请求给后端改 tb_gou_wu_che 表里的数量)
  item.shu_liang += diff;
}

// === 页面跳转 ===
const goHome = () => uni.switchTab({ url: '/pages/index/index' })

const goToDetail = async (id) => {
  // 从后台重新拉取这个商品的详情存入缓存，然后跳转，实现详情页秒开
  uni.showLoading({ title: '加载中' })
  try {
    const currentCustomerId = uni.getStorageSync('customerId') || ''; 
    const res = await request.get('/sp_lie_biao', { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId })
    if (res.code === 200) {
      const targetProduct = res.data.lists.find(p => p.id === id)
      if (targetProduct) {
        uni.setStorageSync('currentProduct', targetProduct)
        uni.navigateTo({ url: `/pages/detail/detail` })
      }
    }
  } catch (error) {}
  uni.hideLoading()
}

// === 🚀 核心：跳往收银台并生成真实订单！ ===
const goToCheckout = () => {
  if (totalCount.value === 0) return uni.showToast({ title: '请选择要结算的商品', icon: 'none' })
  
  const currentCustomerId = uni.getStorageSync('customerId')
  if(!currentCustomerId) return uni.showToast({ title: '请先登录', icon: 'none' })

  // 1. 挑出勾选的合法商品
  const selectedItems = cartItems.value.filter(item => item.checked && item.zhuang_tai)
  
  // 2. ✨ 把这些商品打包存进缓存，交给收银台页面去处理！✨
  uni.setStorageSync('checkoutItems', selectedItems)
  
  // 3. 跳转到收银台页面
  uni.navigateTo({ url: '/pages/checkout/pay' })
}
</script>

<style scoped>
.cart-page { background: #f6f6f6; height: 100vh; display: flex; flex-direction: column; }
.nav-header { padding: 40px 0 15px; text-align: center; font-size: 18px; font-weight: bold; background: #fff; border-bottom: 1px solid #f0f0f0; }

.cart-list { flex: 1; padding: 12px; }
.cart-item { background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02);}

.check-box { width: 32px; height: 100%; display: flex; align-items: center; justify-content: flex-start; cursor: pointer; }
.icon { width: 18px; height: 18px; border-radius: 50%; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: transparent; transition: all 0.2s;}
.icon.is-checked { background: #ff4d4f; border-color: #ff4d4f; color: #fff; }

.pic { width: 85px; height: 85px; border-radius: 8px; margin-right: 12px; background: #f9f9f9; flex-shrink: 0;}
.info { flex: 1; height: 85px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;}
.name { font-size: 14px; font-weight: bold; color: #333; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.4;}

.price-row { display: flex; justify-content: space-between; align-items: center; }
.price { color: #ff4d4f; font-weight: bold; font-size: 18px;}
.symbol { font-size: 12px; margin-right: 2px; }

.num-ctrl { display: flex; align-items: center; border: 1px solid #eee; border-radius: 6px; overflow: hidden; background: #fff;}
.btn { width: 28px; height: 26px; text-align: center; line-height: 26px; font-size: 16px; color: #666; background: #fafafa; cursor: pointer;}
.num { width: 36px; text-align: center; font-size: 13px; border-left: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold; line-height: 26px;}

.invalid-tip { color: #999; font-size: 12px; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; display: inline-block; align-self: flex-start;}

.empty-cart { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty-icon { font-size: 60px; margin-bottom: 10px; opacity: 0.8;}
.empty-text { color: #999; font-size: 14px; margin-bottom: 25px; }
.go-btn { border: 1px solid #ff4d4f; color: #ff4d4f; padding: 8px 30px; border-radius: 20px; font-size: 15px; font-weight: bold; cursor: pointer;}

.bottom-space { height: 70px; }

/* 底部结算栏 */
.bottom-bar { position: fixed; bottom: var(--window-bottom, 50px); left: 0; right: 0; height: 55px; background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.03); display: flex; align-items: center; padding: 0 15px; z-index: 100;}
.check-all { display: flex; align-items: center; font-size: 14px; color: #666; cursor: pointer; }
.check-all .icon { margin-right: 8px; }

.total-info { flex: 1; text-align: right; margin-right: 15px; }
.label { font-size: 13px; color: #333; margin-right: 4px; }
.total-price { color: #ff4d4f; font-size: 20px; font-weight: bold; }

.submit-btn { background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; width: 110px; height: 40px; text-align: center; line-height: 40px; border-radius: 20px; font-size: 15px; font-weight: bold; transition: opacity 0.3s; cursor: pointer;}
.submit-btn.disabled { background: #dcdcdc; color: #fff; }
</style>