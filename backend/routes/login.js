var express = require('express');
var router = express.Router();
var userdal=require("../shujuku/deng_lu_dal")
var responseHelper=require("../utils/responseHelper")
const user=new userdal();


router.post('/',async function(req,res,next){
  let model = req.body; 
  let u = await user.login(model);
  if(u){
    responseHelper.success(res,u,"登录成功");
  }
  else{
    responseHelper.error(res,"登录失败，账号或密码错误");
  }
})

module.exports = router;