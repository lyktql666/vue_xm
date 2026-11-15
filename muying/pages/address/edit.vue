<template>
  <view class="edit-page">
    <view class="form-group">
      <view class="form-item">
        <text class="label">收件人</text>
        <input class="input" v-model="form.shou_jian_ren" placeholder="名字" />
      </view>
      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" v-model="form.dian_hua" type="number" maxlength="11" placeholder="11位手机号" />
      </view>
      <view class="form-item textarea-item">
        <text class="label">详细地址</text>
        <textarea class="textarea" v-model="form.di_zhi_xiang_qing" placeholder="小区楼栋/乡村名称" />
      </view>
    </view>

    <view class="form-group default-box">
      <text class="label">设为默认收货地址</text>
      <switch :checked="form.is_default" color="#ff4d4f" @change="form.is_default = $event.detail.value" />
    </view>

    <view class="save-btn" @click="saveAddress">保存地址</view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const form = reactive({ id: null, shou_jian_ren: '', dian_hua: '', di_zhi_xiang_qing: '', is_default: false })

onLoad(() => {
  const editData = uni.getStorageSync('editAddress')
  if (editData) {
    form.id = editData.id
    form.shou_jian_ren = editData.shou_jian_ren
    form.dian_hua = editData.dian_hua
    form.di_zhi_xiang_qing = editData.di_zhi_xiang_qing
    form.is_default = !!editData.is_default
  }
})

const saveAddress = async () => {
  if (!form.shou_jian_ren || !form.dian_hua || !form.di_zhi_xiang_qing) {
    return uni.showToast({ title: '请填写完整信息', icon: 'none' })
  }
  
  const currentCustomerId = uni.getStorageSync('customerId')
  try {
    const payload = { ...form, ke_hu_id: currentCustomerId }
    const res = await request.post('/address/save', payload)
    
    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => { uni.navigateBack() }, 1000)
    }
  } catch (e) {}
}
</script>

<style scoped>
.edit-page { background: #f5f5f5; min-height: 100vh; padding-top: 10px; }
.form-group { background: #fff; padding: 0 15px; margin-bottom: 10px; }
.form-item { display: flex; align-items: center; min-height: 50px; border-bottom: 1px solid #f9f9f9; }
.textarea-item { align-items: flex-start; padding: 15px 0; border-bottom: none; }
.label { width: 80px; font-size: 15px; color: #333; }
.input { flex: 1; font-size: 15px; }
.textarea { flex: 1; height: 80px; font-size: 15px; line-height: 1.5; }
.default-box { display: flex; justify-content: space-between; align-items: center; height: 55px; }
.save-btn { margin: 30px 15px; background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; text-align: center; height: 46px; line-height: 46px; border-radius: 23px; font-size: 16px; font-weight: bold; }
</style>