var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
var spdal=require("../shujuku/shang_pin_dal")
var responseHelper=require("../utils/responseHelper")
const shang_pin=new spdal();


const storage = multer.diskStorage({
  // 决定把图片存到哪里
  destination: function (req, file, cb) {
    cb(null, 'public/tupian/') 
  },
  // 决定给图片起什么名字 (防止重名覆盖)
  filename: function (req, file, cb) {
    // 提取原文件的后缀名 (比如 .png, .jpg)
    const ext = path.extname(file.originalname);
    // 用当前时间戳重命名(比如 16987654321.jpg)
    cb(null, Date.now() + ext);
  }
});

// 生成一个处理上传的中间件
const upload = multer({ storage: storage });


// ================== 2. 写一个处理上传的 POST 接口 ==================
// 注意：前端 <el-upload> 传过来的文件字段名叫 'file'
router.post('/tu_pian', upload.single('file'), function (req, res, next) {
  try {
    if (!req.file) {
      return responseHelper.error(res, "上传失败，没有收到文件");
    }

    // 拼接出图片的网络访问 URL 
    const imgUrl = 'http://localhost:3000/tupian/' + req.file.filename;

    // 注意：把 { url: imgUrl } 作为 data 传给前端
    responseHelper.success(res, { url: imgUrl }, "图片上传成功！");

  } catch (error) {
    console.error("图片上传报错：", error);
    responseHelper.error(res, "图片上传发生异常");
  }
});

router.get('/', async function(req, res, next) {
  let page = {
    currentPage: parseInt(req.query.currentPage) || 1,
    pageSize: parseInt(req.query.pageSize) || 10,
    // ✨ 核心补全：把前端传来的客户 ID 接住，存进 page 对象里！✨
    ke_hu_id: req.query.ke_hu_id 
  };

  // 这样传给 DAL 层时，page 里面就包含了 ke_hu_id
  let result = await shang_pin.getALL(page);
  
  responseHelper.success(res, result, "获取数据成功");
})

router.get('/leibie',async function(req,res,next){
  try {
    let u = await shang_pin.getAllLeiBie();
    
    responseHelper.success(res, u, "类别获取成功");
  } catch (error) {
    console.error("类别获取报错：", error); // 留个日志方便排错
    responseHelper.error(res, "类别获取失败");
  }
})
router.post('/xiugai',async function(req,res,next){
  try {
    // 1. 接收前端传过来的完整的修改数据包 (里面包含 id，以及要改的 price/stock 等)
    let model = req.body; 
    
    // 2. 严谨一点：确保前端至少传了 id 过来，否则数据库不知道改哪一行
    if (!model.id) {
        return responseHelper.error(res, "修改失败，缺少商品ID");
    }

    // 3. 将数据包传给你图1写的 updateUser 方法
    let u = await shang_pin.updateSP(model);
    
    // 4. 返回成功
    responseHelper.success(res, u, "修改成功");
  } catch (error) {
    console.error("修改商品报错：", error); // 留个日志方便排错
    responseHelper.error(res, "修改失败");
  }
})
router.post('/tianjia',async function(req,res,next){
  try {
    // 1. 接收前端传过来的完整的修改数据包 (里面包含 id，以及要改的 price/stock 等)
    let model = req.body; 
    let u = await shang_pin.createSP(model);
    
    // 4. 返回成功
    responseHelper.success(res, u, "添加成功");
  } catch (error) {
    console.error("添加商品报错：", error); // 留个日志方便排错
    responseHelper.error(res, "添加失败");
  }
})
router.post('/shanchu',async function(req,res,next){
  try {
    await shang_pin.deleteSP(req.body.id);
    responseHelper.success(res, null, "删除成功");
  } catch (error) {
    console.error("删除商品报错：", error); // 留个日志方便排错
    responseHelper.error(res, "删除失败");
  }
})


module.exports = router;