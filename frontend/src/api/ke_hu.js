import BaseAPI from "./base";
import { ElMessage } from "element-plus";
class KHAPI extends BaseAPI {
  constructor() {
    super("/ke_hu"); //设置调用的路径
  }
  // 获取商品列表
  async getKHList(params) {
    try {
      const res = await this.get("/",params);
      if (res.code === 200) {
        return res.data;
      } else {
        ElMessage.error(res.message );
        return [];
      }
    } catch (error) {
      console.error(error);
      ElMessage.error();
      return [];
    }
  }
  
}

export default new KHAPI();