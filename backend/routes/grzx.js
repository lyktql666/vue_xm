var express = require('express');
var router = express.Router();
var userdal=require("../shujuku/deng_lu_dal")
var responseHelper=require("../utils/responseHelper")
const user=new userdal();

router.get('/', async function(req, res, next) {
  try {
    const id = req.query.id; 
    
    if (!id) {
        return responseHelper.error(res, "缺少用户ID参数");
    }

    let result = await user.getUser(id); 
    responseHelper.success(res, result, "获取数据成功");
  }catch (error) {
    console.error("获取数据报错：", error);
    responseHelper.error(res, "系统异常");
  }
});

module.exports = router;