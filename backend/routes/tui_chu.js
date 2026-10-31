var express = require('express');
var router = express.Router();
var responseHelper=require("../utils/responseHelper")

router.post('/',async function(req,res,next){
 
    responseHelper.success(res,"退出成功");

})

module.exports = router;