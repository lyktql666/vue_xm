var express = require('express');
var router = express.Router();
var userdal=require("../shujuku/deng_lu_dal")
var responseHelper = require("../utils/responseHelper");
const user=new userdal();

router.post('/',async function(req,res,next){
  try {
    let model = {zhang_hao:req.body.username,mi_ma:req.body.password,you_xiang:req.body.email,yong_hu_ming:req.body.yong_hu_ming};
    let u = await user.createUser(model);
    responseHelper.success(res,u,"注册成功");
  } catch (error) {
    responseHelper.error(res,"登录失败，账号或密码错误");
  }
})

module.exports = router;