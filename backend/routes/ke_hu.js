var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
var khdal=require("../shujuku/ke_hu_dal")
var responseHelper=require("../utils/responseHelper")
const ke_hu=new khdal();


router.get('/', async function(req, res, next) {
  // 1. 获取前端传过来的分页参数
  // 如果前端没传，默认就是第 1 页，每页 10 条
  let page = {
    currentPage: parseInt(req.query.currentPage) || 1,
    pageSize: parseInt(req.query.pageSize) || 10
  };

  let result = await ke_hu.getAllWithAnalysis(page);
  
  // 3. 返回给前端
  responseHelper.success(res, result, "获取数据成功");
});

router.post('/login',async function(req,res,next){
  let model = req.body; 
  let u = await ke_hu.login(model);
  if(u){
    responseHelper.success(res,u,"登录成功");
  }
  else{
    responseHelper.error(res,"登录失败，账号或密码错误");
  }
})

router.post('/register',async function(req,res,next){
  try {
    let model = {mi_ma:req.body.mi_ma,dian_hua:req.body.dian_hua,xing_ming:req.body.xing_ming};
    let u = await ke_hu.createUser(model);
    responseHelper.success(res,u,"注册成功");
  } catch (error) {
    responseHelper.error(res,"注册失败，该手机号可能已存在");
  }
})

module.exports = router;