<template>  
  <div>
    <h1 class="text-2xl font-bold mb-6">仪表盘</h1>    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <el-card class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">总销售额</p>
            <p class="text-2xl font-bold">¥128,900</p>
          </div>
          <el-icon :size="40"><Money /></el-icon>
        </div>
      </el-card>
      
      <el-card class="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">订单总数</p>
            <p class="text-2xl font-bold">1,234</p>
          </div>
          <el-icon :size="40"><ShoppingCart /></el-icon>
        </div>
      </el-card>
      
      <el-card class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">商品数量</p>
            <p class="text-2xl font-bold">567</p>
          </div>
          <el-icon :size="40"><Goods /></el-icon>
        </div>
      </el-card>
      
      <el-card class="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">用户总数</p>
            <p class="text-2xl font-bold">3,456</p>
          </div>
          <el-icon :size="40"><User /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span class="font-medium">销售额趋势</span>
          </template>
          <div class="h-80 flex items-center justify-center text-gray-400">
            图表组件占位
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span class="font-medium">热门商品</span>
          </template>
          <el-table :data="hotProducts" stripe style="width: 100%">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="sales" label="销量" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
 
</template>

<script setup>
import { ref } from 'vue'
import { Money, ShoppingCart, Goods, User } from '@element-plus/icons-vue'

const hotProducts = ref([
  { name: 'iPhone 15', sales: 123 },
  { name: '华为 Mate 60', sales: 98 },
  { name: '小米 14', sales: 87 },
  { name: '联想笔记本', sales: 65 },
  { name: 'iPad Pro', sales: 54 }
])
</script>