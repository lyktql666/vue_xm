<template>
  <div>
    <!-- 顶部标题和按钮 -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">商品分类管理</h1>
      <el-button type="primary" @click="addCategory">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-card>
      <!-- 分类表格 -->
      <el-table :data="categoryList" stripe style="width: 100%" v-loading="isLoading">
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="name" label="分类名称" />
        
        <!-- 展示后端实时计算的聚合数据 -->
        <el-table-column prop="sp_count" label="商品种类数" width="120">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.sp_count }} 种</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="total_stock" label="该类总库存" width="120">
          <template #default="{ row }">
            <span class="font-bold text-blue-600">{{ row.total_stock }}</span> 件
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="editCategory(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 高配版分页组件 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增分类对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增分类" width="400px">
      <!-- 只有名字和状态！ -->
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="addForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAdd">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑分类" width="400px">
      <!-- 只有名字和状态！ -->
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="状态">
           <!-- 使用 Switch 开关组件，体验更好 -->
          <el-switch v-model="editForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import LBAPI from '@/api/lei_bie' 

const isLoading = ref(false)
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)

const categoryList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单极其精简 
const addForm = ref({ name: '', isActive: true })
const editForm = ref({ id: null, name: '', isActive: true })

// ================= 数据加载 =================
const loadCategories = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const data = await LBAPI.getSPList({ currentPage: currentPage.value, pageSize: pageSize.value })
    if (data) {
      categoryList.value = data.lists || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 分页事件
const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1; loadCategories() }
const handleCurrentChange = (val) => { currentPage.value = val; loadCategories() }

// ================= 增删改逻辑 =================

// 新增分类
const addCategory = () => {
  addForm.value = { name: '', isActive: true }
  addDialogVisible.value = true
}

const saveAdd = async () => {
  if (!addForm.value.name) return ElMessage.warning('分类名称不能为空')
  
  const result = await LBAPI.addSP(addForm.value)
  if (result) {
    addDialogVisible.value = false 
    currentPage.value = 1
    loadCategories() 
  }
}

// 编辑分类
const editCategory = (row) => {
  // 拷贝当前行数据，只拷我们需要修改的字段
  editForm.value = {
    id: row.id,
    name: row.name,
    isActive: row.isActive
  }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  if (!editForm.value.name) return ElMessage.warning('分类名称不能为空')

  const result = await LBAPI.updateSP(editForm.value)
  if (result) {
    editDialogVisible.value = false
    loadCategories() 
  }
}

// 删除分类
const deleteCategory = async (row) => {
  // 增加高级防护：如果该分类下还有商品，严禁删除！
  if (row.sp_count > 0) {
    return ElMessage.error(`删除失败！该分类下还有 ${row.sp_count} 件商品，请先将商品转移或删除。`)
  }

  try {
    await ElMessageBox.confirm(`确定删除分类 "${row.name}" 吗？此操作不可恢复。`, '确认删除', { type: 'warning' })
    const result = await LBAPI.deleteSP(row.id)
    if (result) {
      if (categoryList.value.length === 1 && currentPage.value > 1) currentPage.value -= 1
      loadCategories() 
    }
  } catch (error) {}
}

onMounted(() => {
  loadCategories()
})
</script>