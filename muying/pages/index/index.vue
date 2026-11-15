<template>
  <view class="page-container">
    <!-- 头部固定区域：搜索栏 + 3个Tab页签 -->
    <view class="header-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索宝宝奶粉、纸尿裤..."
          disabled
        />
        <view class="search-btn">搜索</view>
      </view>

      <!-- 顶层 Tabs -->
      <view class="custom-tabs">
        <view
          class="tab-item"
          v-for="(tab, index) in tabList"
          :key="index"
          :class="{ active: currentTabIndex === index }"
          @click="switchTab(index)"
        >
          <text class="tab-text">{{ tab }}</text>
          <view
            class="tab-line"
            v-if="currentTabIndex === index"
          ></view>
        </view>
      </view>
    </view>

    <!-- 左右滑动的 Swiper 容器 -->
    <swiper
      class="main-swiper"
      :current="currentTabIndex"
      @change="onSwiperChange"
    >
      <!-- 第1屏：推荐 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-content">
          <view class="banner-box">
            <swiper
              v-if="bannerList.length > 0"
              class="swiper"
              circular
              autoplay
              interval="3000"
              indicator-dots
              indicator-active-color="#ff4d4f"
              indicator-color="rgba(255,255,255,0.5)"
            >
              <swiper-item
                v-for="(item, index) in bannerList"
                :key="index"
                @click="previewImages([item.pic_url])"
              >
                <image
                  class="swiper-img"
                  :src="item.pic_url"
                  mode="aspectFill"
                ></image>
              </swiper-item>
            </swiper>
            <view v-else class="swiper empty-banner">暂无活动推荐</view>
          </view>

          <!-- 分类图标 -->
          <view class="king-kong-area">
            <view
              class="grid-item"
              v-for="item in categoryList"
              :key="item.id"
            >
              <view class="grid-icon">
                <text class="grid-icon-text">
                  {{ getCategoryIcon(item.name) }}
                </text>
              </view>
              <text class="grid-text">{{ item.name }}</text>
            </view>
          </view>

          <view class="guess-you-like">
            <view class="title-text">- 猜你喜欢 -</view>
          </view>

          <view class="product-list">
            <view
              class="product-card"
              v-for="item in productList"
              :key="item.id"
              @click="goToDetail(item)"
            >
              <view class="img-box" @click="previewImages(item.pic_urls)">
                <image
                  class="pic"
                  :src="item.pic_urls?.[0] || '/static/default.png'"
                  mode="aspectFill"
                ></image>
                <view
                  v-if="item.total_stock <= 0"
                  class="out-of-stock"
                >
                  抢光了
                </view>
              </view>

              <view class="info-box">
                <view class="name">
                  <text class="tag">自营</text>{{ item.name }}
                </view>

                <view class="tags">
                  <text class="mini-tag">{{ item.lei_xing }}</text>
                  <text class="mini-tag" v-if="item.pin_pai">
                    {{ item.pin_pai }}
                  </text>
                </view>

                <view class="price-row">
                  <view class="price">
                    <text class="symbol">¥</text>
                    <text class="big-num">{{ item.jia_ge }}</text>
                  </view>
                  <view class="sales">
                    已售 {{ Math.floor(Math.random() * 1000) + 100 }} 件
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="bottom-tips" v-if="productList.length > 0">
            - 到底啦 -
          </view>
        </scroll-view>
      </swiper-item>

      <!-- 第2屏：关注 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-content empty-page">
          <text class="empty-text">暂时还没有关注的店铺哦~</text>
        </scroll-view>
      </swiper-item>

      <!-- 第3屏：分类 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-content empty-page">
          <text class="empty-text">这是全部商品分类页面</text>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

// 顶部 Tab 联动逻辑
const tabList = ['推荐', '关注', '分类']
const currentTabIndex = ref(0)

const switchTab = (index) => {
  currentTabIndex.value = index
}

const onSwiperChange = (e) => {
  currentTabIndex.value = e.detail.current
}

// 根据分类名称返回对应图标
const getCategoryIcon = (name = '') => {
  if (name.includes('奶粉')) return '🥛'
  if (name.includes('纸尿') || name.includes('尿布')) return '🧷'
  if (name.includes('奶嘴')) return '🍼'
  if (name.includes('玩具')) return '🧸'
  return '🛍️'
}

// 数据
const bannerList = ref([])
const categoryList = ref([])
const productList = ref([])

const fetchCategories = async () => {
  try {
    const res = await request.get('/lb_lie_biao', {
      currentPage: 1,
      pageSize: 5
    })

    if (res.code === 200) {
      categoryList.value = res.data.lists || res.data || []
      if (categoryList.value.length > 5) {
        categoryList.value = categoryList.value.slice(0, 5)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchProducts = async () => {
  try {
    const currentCustomerId = uni.getStorageSync('customerId') || ''

    const res = await request.get('/sp_lie_biao', {
      currentPage: 1,
      pageSize: 20,
      ke_hu_id: currentCustomerId
    })

    if (res.code === 200) {
      productList.value = res.data.lists
      extractBanners(res.data.lists)
    }
  } catch (error) {
    console.error(error)
  }
}

const extractBanners = (products) => {
  const banners = []

  for (const item of products) {
    if (item.pic_urls && item.pic_urls.length > 0) {
      banners.push({
        id: item.id,
        pic_url: item.pic_urls[0]
      })
    }

    if (banners.length >= 3) break
  }

  bannerList.value = banners
}

const previewImages = (urls) => {
  if (!urls || urls.length === 0) return

  const cleanUrls = urls.map((url) => {
    const finalUrl = url.startsWith('http') ? url : `http://${url}`
    return finalUrl.replace('localhost', '127.0.0.1')
  })

  uni.previewImage({
    urls: cleanUrls,
    current: cleanUrls[0]
  })
}

const goToDetail = (item) => {
  uni.setStorageSync('currentProduct', item)
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`
  })
}

onLoad(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f4f4;
}

.header-section {
  background-color: #ff4d4f;
  z-index: 999;
}

.search-box {
  background: #fff;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 4px 0 15px;
  margin: 10px 15px;
}

.search-icon {
  font-size: 16px;
  margin-right: 5px;
}

.search-input {
  flex: 1;
  font-size: 14px;
}

.search-btn {
  background: linear-gradient(to right, #ff9000, #ff4d4f);
  color: #fff;
  font-size: 13px;
  height: 26px;
  line-height: 26px;
  padding: 0 12px;
  border-radius: 13px;
}

.custom-tabs {
  display: flex;
  justify-content: space-around;
  padding: 5px 0 10px;
}

.tab-item {
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  transition: all 0.3s;
}

.tab-item.active {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #fff;
  border-radius: 2px;
}

.main-swiper {
  flex: 1;
}

.scroll-content {
  height: 100%;
}

.banner-box {
  padding: 10px 10px 0;
  background: linear-gradient(to bottom, #ff4d4f 0%, #f4f4f4 100%);
}

.swiper {
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.empty-banner {
  background-color: #e5e5e5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.king-kong-area {
  display: flex;
  padding: 15px 10px;
  background: #fff;
  margin: 10px;
  border-radius: 12px;
}

.grid-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff1ed, #ffe1dc);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon-text {
  font-size: 26px;
  line-height: 1;
}

.grid-text {
  font-size: 12px;
  color: #666;
}

.guess-you-like {
  text-align: center;
  padding: 15px 0 5px;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
  letter-spacing: 2px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 10px;
}

.product-card {
  width: 48.5%;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.img-box {
  position: relative;
  width: 100%;
  height: 170px;
}

.pic {
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
}

.out-of-stock {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
}

.info-box {
  padding: 10px;
}

.name {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  height: 36px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tag {
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 4px;
}

.tags {
  margin: 6px 0;
  display: flex;
  gap: 4px;
}

.mini-tag {
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  font-size: 9px;
  padding: 0 3px;
  border-radius: 2px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 5px;
}

.price {
  color: #ff4d4f;
  font-weight: bold;
}

.symbol {
  font-size: 12px;
  margin-right: 2px;
}

.big-num {
  font-size: 18px;
}

.sales {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.bottom-tips {
  text-align: center;
  color: #ccc;
  font-size: 12px;
  padding: 20px 0;
}

/* 占位页面样式 */
.empty-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-text {
  color: #999;
  font-size: 14px;
  margin-top: 50%;
  display: block;
  text-align: center;
}
</style>