import BaseAPI from "./base";
import { ElMessage } from "element-plus";
class DDAPI extends BaseAPI {
  constructor() {
    super("/ding_dan"); //设置调用的路径
  }
  async getDDList(params) {
    try {
      const res = await this.get("/",params);
      if (res.code === 200) {
        return res.data;
      } else {
        ElMessage.error(res.message || "获取订单列表失败");
        return [];
      }
    } catch (error) {
      console.error("获取订单列表错误：", error);
      ElMessage.error("获取订单列表失败");
      return [];
    }
  }

  async updateDD(model) {
    try {
      const res = await this.post("/xiugai", model);
      if (res.code === 200) {
        ElMessage.success(res.message || "修改成功");
        return res.data;
      } else {
        ElMessage.error(res.message || "修改失败");
        return null;
      }
    } catch (error) {
      console.error("修改订单错误：", error);
      ElMessage.error("修改失败");
      return null;
    }
  }
  async deleteDD(id) {
    try {
      const res = await this.post("/shanchu", { id });
      if (res.code === 200) {
        ElMessage.success(res.message || "删除成功");
        return true;
      } else {
        ElMessage.error(res.message || "删除失败");
        return false;
      }
    } catch (error) {
      console.error("删除订单错误：", error);
      ElMessage.error("删除失败");
      return false;
    }
  }
}

export default new DDAPI();