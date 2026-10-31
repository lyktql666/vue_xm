import BaseAPI from "./base";
import { ElMessage } from "element-plus";
class UserAPI extends BaseAPI {
  constructor() {
    super(""); //设置调用的路径
  }

  // 登录
  async login(data) {
    const res = await this.post("/login", data); 
      if (res.code === 200 && res.data) {
        // 假设后端返回的数据结构是 { id: 1, name: 'admin', token: 'xxxxx' }
        localStorage.setItem("userId", res.data.id); // 单独存一个 ID 方便后续取用
        // 如果后端传的本来就是一串字符串 Token，就这么存：
        // localStorage.setItem("token", res.data.token); 
        // 最好把整个 user 对象变成 JSON 字符串存起来，方便页面显示头像和名字
        localStorage.setItem("user", JSON.stringify(res.data)); 
      }
      return res;
    } catch (error) {
      ElMessage.error(error.message || "登录失败");
      throw error;
    }
  
  // 退出登录
  async logout() {
    try {
      const res = await this.post('/logout'); // 通知后端一声“我走了”
      
      // 把你 login 时存的东西全删干净！
      localStorage.removeItem('userId');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token'); 
      
      ElMessage.success('已安全退出登录');
      return true;
      
    } catch (error) {
      ElMessage.error('退出失败');
      throw error;
    }
  }

  // // 注册
  async register(data) {
  try {
  const res = await this.post('/register', data)
  if (res.code === 200) {
  }
  return res
  } catch (error) {
     ElMessage.error(error.message || '注册失败');
     throw error
  }
  }
  async changePassword(data) {
    try {
      const res = await this.post("/wjmm", data);
      if (res.code === 200) {
        ElMessage.success(res.message || "密码修改成功，请重新登录");
        return true;
      } else {
        ElMessage.error(res.message || "修改失败");
        return false;
      }
    } catch (error) {
      ElMessage.error("网络异常，修改失败");
      return false;
    }
  }

  async getUser(id) {
    try {
      // 发送请求，注意带上 { id: id }
      const res = await this.get("/grzx", { id: id }); 
      
      if (res.code === 200) {
        return res.data;
      } else {
       ElMessage.error(res.message || "获取用户信息失败");
        return [];
      }
    } catch (error) {
      
      console.error("获取用户信息错误：", error);
      ElMessage.error("获取用户信息失败");
      return [];
    }
  }
}
export default new UserAPI();
