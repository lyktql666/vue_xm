const {where} = require("sequelize");
const { Op } = require("sequelize");

const user=require("./mysqlmuying").users;
function userdal(){
    this.createUser=async function(model){
        var u= await user.create(model)
        return u;

    };
    this.getALL=async function () {
        var lists =await user.findAll();
        return lists; 
    };
    this.getUser=async function (id) {
        var tea=await user.findOne({where:{id:id}});
        return tea;
        
    };
    this.updateUser=async function(model){
        let ireturn= await user.update(
           model,
        {where:{id:model.id}}
    )
    return ireturn;
    };
    this.deleteUser=async function(id){
        await user.destroy({where:{id:id}});
    }

    this.login = async function(model) {
    var u = await user.findOne({
            where: {
            //满足下面任意一个条件即可
            [Op.or]: [
                { zhang_hao: model.account }, // 条件1：输入的字符串等于账号
                { you_xiang: model.account }  // 条件2：输入的字符串等于邮箱
            ],
            // 并且密码必须正确
            mi_ma:  model.password
        }
    });
    return u;
};
this.changePwd = async function(userId, oldPassword, newPassword) {
        // 1. 先查出这个用户
        const u = await user.findOne({ where: { id: userId } });
        
        if (!u) {
            return { success: false, msg: "用户不存在" };
        }
        
        // 2. 比对旧密码对不对
        if (u.mi_ma !== oldPassword) {
            return { success: false, msg: "原密码错误，请重新输入" };
        }

        // 3. 旧密码正确，把新密码更新进去
        await user.update(
            { mi_ma: newPassword }, 
            { where: { id: userId } }
        );

        return { success: true, msg: "密码修改成功" };
    };



}
module.exports=userdal;