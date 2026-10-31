var express = require('express');
var router = express.Router();
var userdal=require("../shujuku/deng_lu_dal")
var responseHelper=require("../utils/responseHelper")
const user=new userdal();

router.post('/', async function(req, res, next) {
  try {
    // 接收前端传来的数据
    const { userId, oldPassword, newPassword } = req.body;
    
    if (!userId || !oldPassword || !newPassword) {
        return responseHelper.error(res, "参数不完整");
    }

    // 调用 DAL 层处理
    const result = await user.changePwd(userId, oldPassword, newPassword);
    
    if (result.success) {
        responseHelper.success(res, null, result.msg);
    } else {
        responseHelper.error(res, result.msg); // 返回“原密码错误”等提示
    }
  } catch (error) {
    console.error("修改密码报错：", error);
    responseHelper.error(res, "系统异常，修改失败");
  }
});

module.exports = router;