<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">商品列表</h1>
      <el-button type="primary" @click="addProduct">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <el-card>
      <!-- 商品表格 -->
      <el-table :data="productList" stripe style="width: 100%" v-loading="isLoading">
        <el-table-column type="expand">
  <template #default="{ row }">
    <div class="expand-container px-12 py-4 bg-gray-50/50">
      <div class="expand-content bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
        
        <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center">
          <el-icon class="mr-2 text-orange-400 text-lg"><StarFilled /></el-icon> 
          买家评价明细 <span class="text-xs text-gray-400 ml-2 font-normal">(共 {{ row.reviews?.length || 0 }} 条)</span>
        </h3>

        <!-- 如果有评价，显示表格 -->
        <el-table v-if="row.reviews && row.reviews.length > 0" :data="row.reviews" :border="false" size="small" style="width: 100%" class="custom-inner-table">
          <el-table-column prop="customer_name" label="买家姓名" width="120" />
          
          <el-table-column label="打分" width="140">
            <template #default="scope">
              <!-- 这里是单个买家打的具体星级 -->
              <el-rate v-model="scope.row.star" disabled size="small" />
            </template>
          </el-table-column>
          
          <el-table-column prop="content" label="评价内容" min-width="300">
            <template #default="scope">
              <span class="text-gray-600 italic">"{{ scope.row.content }}"</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="time" label="评价时间" width="160" align="right">
            <template #default="scope">
              <span class="text-gray-400 text-xs">{{ new Date(scope.row.time).toLocaleString() }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 如果没有评价，显示一个漂亮的空状态 -->
        <el-empty v-else description="该商品暂时还没有买家评价哦~" :image-size="60" />

      </div>
    </div>
  </template>
</el-table-column>
        <el-table-column label="商品图片" width="180" align="center"  header-align="center">
          <template #default="{ row }">
            <!-- 只要有图片数组，就把数组直接丢给咱们的新组件！ -->
            <Image3DStack 
              v-if="row.pic_urls && row.pic_urls.length > 0" 
              :images="row.pic_urls" 
            />
            <div v-else class="text-gray-400 text-xs bg-gray-100 w-[60px] h-[60px] flex items-center justify-center rounded">
              暂无
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="lei_xing" label="分类" width="120" />
        <el-table-column prop="pin_pai" label="品牌" width="120" />
        <el-table-column prop="bao_zhi_qi" label="保质期" width="100" />
        <el-table-column prop="xiang_qing" label="详情介绍" width="100" />

        <el-table-column prop="jia_ge" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.jia_ge }}
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="100" align="center">
          <template #default="{ row }">
            <!-- 点击触发 showBatchDetails 方法，把当前行的批次数据传过去 -->
            <el-button type="primary" link class="font-bold text-lg" @click="showBatchDetails(row)">
              {{ row.total_stock }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.zhuang_tai ? 'success' : 'info'">
              {{ row.zhuang_tai ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="editProduct(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column label="综合评分" width="160" align="center">
  <template #default="{ row }">
    <!-- disabled 表示只能看不能点，show-score 会在旁边显示具体的分数数字 -->
    <el-rate 
      v-model="row.avg_star" 
      disabled 
      show-score 
      text-color="#ff9900" 
      score-template="{value} 星"
    />
    <div v-if="row.avg_star === 0" class="text-xs text-gray-400 mt-1">暂无评价</div>
  </template>
</el-table-column>
      </el-table>

      <!-- 高配版 Element Plus 分页组件  -->
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

    <!-- 编辑商品对话框  -->
    <el-dialog v-model="editDialogVisible" title="编辑商品" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.lei_xing_id" placeholder="请选择分类" style="width: 100%">
           <el-option
             v-for="item in categoryList"
             :key="item.id"
             :label="item.name"
             :value="item.id"
           />
         </el-select>
       </el-form-item>
       <el-form-item label="品牌">
          <el-input v-model="editForm.pin_pai" placeholder="请输入商品品牌" />
        </el-form-item>
        <el-form-item label="保质期">
          <el-input v-model="editForm.bao_zhi_qi" placeholder="如：12个月，3年" />
        </el-form-item>
        <el-form-item label="详情">
          <el-input v-model="editForm.xiang_qing" placeholder="详情介绍" />
        </el-form-item>

       <el-form-item label="商品图片">
          <el-upload
            v-model:file-list="editFileList"
            action="/api/sp_lie_biao/tu_pian"
            list-type="picture-card"
            :on-success="handleEditSuccess"
            :on-remove="handleEditRemove"
           >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="价格">
          <el-input-number v-model="editForm.jia_ge" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="editForm.ku_cun" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.zhuang_tai" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增商品对话框  -->
    <el-dialog v-model="addDialogVisible" title="新增商品" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="分类">
             <el-select v-model="addForm.lei_xing_id" placeholder="请选择分类" style="width: 100%">
             <el-option
                 v-for="item in categoryList"
                 :key="item.id"
                 :label="item.name"
                 :value="item.id"
                 />
              </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="addForm.pin_pai" placeholder="请输入商品品牌" />
        </el-form-item>
        <el-form-item label="保质期">
          <el-input v-model="addForm.bao_zhi_qi" placeholder="如：12个月，3年" />
        </el-form-item>
        <el-form-item label="详情">
          <el-input v-model="addForm.xiang_qing" placeholder="详情介绍" />
        </el-form-item>

         <el-form-item label="商品图片">
          <el-upload
            v-model:file-list="addFileList"
            action="/api/sp_lie_biao/tu_pian"
            list-type="picture-card"
            :on-success="handleAddSuccess"
            :on-remove="handleAddRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="价格">
          <el-input-number v-model="addForm.jia_ge" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="addForm.ku_cun" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="addForm.zhuang_tai" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdd">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="batchDialogVisible" :title="`【${currentProductName}】库存批次明细`" width="500px">
      <el-table :data="currentBatches" border stripe size="small">
        <el-table-column type="index" label="批次" width="60" align="center" />
        <el-table-column prop="dao_qi_shi_jian" label="到期时间 (保质期至)" align="center">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain"><el-icon><Calendar /></el-icon> {{ row.dao_qi_shi_jian }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pi_ci_ku_cun" label="该批次剩余库存" align="center">
          <template #default="{ row }">
            <span class="text-blue-600 font-bold text-base">{{ row.pi_ci_ku_cun }} 件</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="batchDialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, StarFilled,Calendar } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import SPAPI from '@/api/shang_pin'
import Image3DStack from '@/views/Image3DStack.vue'

// ================= 数据状态 =================
const isLoading = ref(false)
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)

// 列表数据
const productList = ref([])
const addFileList = ref([])
const editFileList = ref([])

// 分页核心状态 
const currentPage = ref(1) // 当前页码，默认第 1 页
const pageSize = ref(10)   // 每页条数，默认 10 条
const total = ref(0)       // 数据总条数
const categoryList = ref([]) // 分类列表
const batchDialogVisible = ref(false)
const currentBatches = ref([])
const currentProductName = ref('')

// 点击总库存触发的方法
const showBatchDetails = (row) => {
  currentProductName.value = row.name
  currentBatches.value = row.batches || []
  
  if (currentBatches.value.length === 0) {
    ElMessage.info('该商品暂无批次明细记录')
    return
  }
  
  batchDialogVisible.value = true
}

// 表单数据
const editForm = ref({ id: null, name: '', lei_xing_id: null, pin_pai: '', bao_zhi_qi: '', jia_ge: 0, xiang_qing:'',zhuang_tai: true, pic_urls: [] })
const addForm = ref({ name: '', lei_xing_id: null, pin_pai: '', bao_zhi_qi: '', jia_ge: 0, xiang_qing:'', zhuang_tai: true, pic_urls: [] })

// ================= 核心方法 =================

// 获取商品列表（带分页参数）
const loadProducts = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const params = { currentPage: currentPage.value, pageSize: pageSize.value }
    const data = await SPAPI.getSPList(params)
    
    if (data) {
      productList.value = data.lists || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取下拉框类别数据的方法 
const loadCategories = async () => {
  try {
    const res = await SPAPI.getLeiBieList() 
    categoryList.value = res || [] // 赋值给下拉框
  } catch (error) {
    console.error('获取类别列表失败:', error)
  }
}

//  2. 分页事件：切换每页显示条数 
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 核心细节：切换条数时，必须强制回到第一页
  loadProducts()
}

// 3. 分页事件：切换页码
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadProducts()
}

// 【新增弹窗】图片上传成功
const handleAddSuccess = (res) => {
  if (res.code === 200) {
    addForm.value.pic_urls.push(res.data.url) // 把后端给的网址塞进数组
  }
}
// 【新增弹窗】图片被移除
const handleAddRemove = (uploadFile) => {
  const urlToRemove = uploadFile.response ? uploadFile.response.data.url : uploadFile.url
  addForm.value.pic_urls = addForm.value.pic_urls.filter(url => url !== urlToRemove)
}

// 【编辑弹窗】图片上传成功
const handleEditSuccess = (res) => {
  if (res.code === 200) {
    editForm.value.pic_urls.push(res.data.url)
  }
}
// 【编辑弹窗】图片被移除
const handleEditRemove = (uploadFile) => {
  const urlToRemove = uploadFile.response ? uploadFile.response.data.url : uploadFile.url
  editForm.value.pic_urls = editForm.value.pic_urls.filter(url => url !== urlToRemove)
}

// ================= CRUD 业务逻辑 =================

const addProduct = () => {
  // 清空表单和照片墙
  addForm.value = { name: '', lei_xing_id: null, pin_pai: '', bao_zhi_qi: '', jia_ge: 0, ku_cun: 0, xiang_qing: '', zhuang_tai: true, pic_urls: [] }
  addFileList.value = []
  addDialogVisible.value = true
}

const saveAdd = async () => {
  // 表单验证
  if (!addForm.value.name || !addForm.value.name.trim()) {
    ElMessage.error('请输入商品名称')
    return
  }
  if (!addForm.value.lei_xing_id) {
    ElMessage.error('请选择商品类别')
    return
  }
  if (addForm.value.jia_ge === null || addForm.value.jia_ge === undefined || addForm.value.jia_ge <= 0) {
    ElMessage.error('请输入大于0的商品价格')
    return
  }
  if (addForm.value.ku_cun === null || addForm.value.ku_cun === undefined || addForm.value.ku_cun < 0) {
    ElMessage.error('请输入正确的库存数量')
    return
  }

  // ✨✨ 核心修复代码：强行塞入店铺 ID！ ✨✨
  // 从本地缓存拿当前商家的店铺ID，如果没拿到，兜底强制分配给 ID 为 1 的店铺
  const currentShopId = localStorage.getItem('dian_pu_id') || 1;
  
  // 用扩展运算符把 addForm 的数据拷贝出来，并强行加上 dian_pu_id
  const payload = { 
    ...addForm.value, 
    dian_pu_id: parseInt(currentShopId) 
  };

  // 🚨 极其关键：这里传的是包装好的 payload，而不是 addForm.value！
  const result = await SPAPI.addSP(payload)
  
  if (result) {
    addDialogVisible.value = false 
    ElMessage.success('商品添加成功')
    loadProducts() 
  }
}

// ================= 编辑商品 =================
const saveEdit = async () => {
  // ✨✨ 同理，编辑时也把店铺 ID 塞进去 ✨✨
  const currentShopId = localStorage.getItem('dian_pu_id') || 1;
  const payload = { 
    ...editForm.value, 
    dian_pu_id: parseInt(currentShopId) 
  };

  // 🚨 传的是 payload
  const result = await SPAPI.updateSP(payload)
  
  if (result) {
    editDialogVisible.value = false
    ElMessage.success('商品修改成功')
    loadProducts()
  }
}

const editProduct = (row) => {
  // 1. 拷贝基础数据
  editForm.value = { ...row } 
  // 2. 确保 pic_urls 是个数组 (防止老数据没有这个字段)
  editForm.value.pic_urls = row.pic_urls ? [...row.pic_urls] : []
  
  // 3.  核心魔法：把网址字符串变成照片墙能认出来的对象数组 
  editFileList.value = editForm.value.pic_urls.map((url, index) => {
    return { name: `图片${index + 1}`, url: url }
  })
  
  editDialogVisible.value = true
}

const deleteProduct = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除商品 "${row.name}" 吗？`, '确认删除', { type: 'warning' })
    const result = await SPAPI.deleteSP(row.id)
    if (result) {
      if (productList.value.length === 1 && currentPage.value > 1) currentPage.value -= 1
      loadProducts() 
    }
  } catch (error) {}
}

// 初始化加载
onMounted(async () => {
  await loadProducts()   
  await loadCategories() 
})
</script>
<style scoped>
:deep(.el-table__expanded-cell) { padding: 0 !important; background-color: transparent !important; }
.expand-container {
  animation: scrollDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden; transform-origin: top; 
}
@keyframes scrollDown {
  0% { max-height: 0; opacity: 0; transform: translateY(-10px) scaleY(0.95); }
  100% { max-height: 800px; opacity: 1; transform: translateY(0) scaleY(1); }
}
:deep(.custom-inner-table) { --el-table-border-color: transparent !important; --el-table-header-bg-color: #f9fafc; }
:deep(.custom-inner-table th.el-table__cell) { color: #909399; font-weight: normal; border-bottom: 1px solid #ebeef5 !important; }
:deep(.custom-inner-table td.el-table__cell) { border-bottom: 1px dashed #f0f2f5 !important; }
:deep(.custom-inner-table .el-table__row:last-child td.el-table__cell) { border-bottom: none !important; }
</style>