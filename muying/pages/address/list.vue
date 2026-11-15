<!-- pages/address/list.vue -->
<template>
  <view class="address-page">
    <scroll-view scroll-y class="address-list" v-if="addressList.length > 0">
      <!-- 注意这里：点击卡片触发 selectAddress -->
      <view class="addr-card" v-for="item in addressList" :key="item.id" @click="selectAddress(item)">
        <view class="addr-info">
          <view class="user-row">
            <text class="name">{{ item.shou_jian_ren }}</text>
            <text class="phone">{{ item.dian_hua }}</text>
            <text class="default-tag" v-if="item.is_default">默认</text>
          </view>
          <view class="detail-row">{{ item.di_zhi_xiang_qing }}</view>
        </view>
        <!-- 注意这里：点击右侧铅笔图标触发 goToEdit，并且加了 .stop 阻止冒泡！ -->
        <view class="edit-icon" @click.stop="goToEdit(item)">✏️</view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>
    
    <view v-else class="empty-box">暂无收货地址</view>

    <!-- 底部新建按钮 -->
    <view class="bottom-bar">
      <!-- 点击底部按钮触发 goToEdit(null) -->
      <view class="add-btn" @click="goToEdit(null)">+ 新建收货地址</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const addressList = ref([])
const isSelectMode = ref(false) 

onShow(() => {
  const mode = uni.getStorageSync('addressMode')
  isSelectMode.value = mode === 'select'
  fetchAddressList()
})

const fetchAddressList = async () => {
  const currentCustomerId = uni.getStorageSync('customerId')
  if (!currentCustomerId) return uni.showToast({ title: '请先登录', icon: 'none' })

  try {
    const res = await request.get('/address/list', { ke_hu_id: currentCustomerId })
    if (res.code === 200) {
      addressList.value = res.data
    }
  } catch (e) {}
}

const goToEdit = (item) => {
  if (item) {
    uni.setStorageSync('editAddress', item) 
  } else {
    uni.removeStorageSync('editAddress') 
  }
  // 只有点击铅笔图标或者底部新增按钮时，才允许跳 edit 页面！
  uni.navigateTo({ url: '/pages/address/edit' })
}

const selectAddress = (item) => {
  if (isSelectMode.value) {
    uni.setStorageSync('selectedAddress', item)
    uni.removeStorageSync('addressMode')
    uni.navigateBack()
  } else {
    // 如果不是选地址模式（是从个人中心进来的），点击卡片本身什么都不做！
    // 或者你可以加一句提示：
    // uni.showToast({ title: '请点击右侧图标编辑', icon: 'none' })
  }
}
</script>

<style scoped>
.address-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 80px; }
.addr-card { background: #fff; margin: 10px 15px; border-radius: 12px; padding: 15px; display: flex; align-items: center; }
.addr-info { flex: 1; margin-right: 15px; }
.user-row { margin-bottom: 8px; display: flex; align-items: baseline; }
.name { font-size: 16px; font-weight: bold; color: #333; margin-right: 10px; }
.phone { font-size: 14px; color: #666; margin-right: 10px; }
.default-tag { font-size: 10px; color: #fff; background: #ff4d4f; padding: 2px 6px; border-radius: 4px; }
.detail-row { font-size: 13px; color: #333; line-height: 1.5; }
.edit-icon { font-size: 18px; color: #999; padding: 5px; }
.empty-box { text-align: center; color: #999; padding-top: 100px; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 10px 15px; padding-bottom: calc(10px + env(safe-area-inset-bottom)); box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
.add-btn { background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; text-align: center; height: 44px; line-height: 44px; border-radius: 22px; font-size: 16px; font-weight: bold; }
</style>