import BaseAPI from "./base";
import { ElMessage } from "element-plus";
class LBAPI extends BaseAPI {
  constructor() {
    super("/lb_lie_biao"); //设置调用的路径
  }
  // 获取类别列表
  async getSPList(params) {
    try {
      const res = await this.get("/",params);
      if (res.code === 200) {
        return res.data;
      } else {
        ElMessage.error(res.message || "获取类别列表失败");
        return [];
      }
    } catch (error) {
      console.error("获取类别列表错误：", error);
      ElMessage.error("获取类别列表失败");
      return [];
    }
  }

  // 修改商品信息（价格、库存、状态等）改
  async updateSP(model) {
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
      console.error("修改类别错误：", error);
      ElMessage.error("修改失败");
      return null;
    }
  }
  // 添加新商品
  async addSP(model) {
    try {
        const res = await this.post("/tianjia", model);
        if (res.code === 200) {
        ElMessage.success(res.message || "添加成功");
        return res.data;
      } else {
        ElMessage.error(res.message || "添加失败");
        return null;
      }
    }catch (error) {
      console.error("修改类别错误：", error);
      ElMessage.error("修改失败");
      return null;
    }
}
  // 删除商品
  async deleteSP(id) {
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
      console.error("删除类别错误：", error);
      ElMessage.error("删除失败");
      return false;
    }
  }
}

export default new LBAPI();