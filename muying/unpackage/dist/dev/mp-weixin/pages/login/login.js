"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const form = common_vendor.reactive({ dian_hua: "", mi_ma: "" });
    const handleLogin = async () => {
      var _a;
      if (!form.dian_hua || !form.mi_ma) {
        return common_vendor.index.showToast({ title: "请填写完整", icon: "none" });
      }
      try {
        const res = await utils_request.request.post("/ke_hu/login", form);
        common_vendor.index.__f__("log", "at pages/login/login.vue:45", "登录原始响应:", res);
        common_vendor.index.__f__("log", "at pages/login/login.vue:46", "响应数据:", res == null ? void 0 : res.data);
        const body = (res == null ? void 0 : res.data) && res.code === void 0 ? res.data : res;
        if (Number(body == null ? void 0 : body.code) !== 200 || !((_a = body == null ? void 0 : body.data) == null ? void 0 : _a.id)) {
          return common_vendor.index.showToast({
            title: (body == null ? void 0 : body.message) || "登录失败，请检查账号和密码",
            icon: "none"
          });
        }
        common_vendor.index.setStorageSync("customerId", body.data.id);
        common_vendor.index.setStorageSync("customerInfo", body.data);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/index/index",
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/login/login.vue:64", "首页跳转失败", err);
              common_vendor.index.showToast({ title: "登录成功，但首页跳转失败", icon: "none" });
            }
          });
        }, 500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:70", "登录请求失败", error);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "网络请求失败，请稍后重试", icon: "none" });
      }
    };
    const goToRegister = () => {
      common_vendor.index.navigateTo({ url: "/pages/register/register" });
    };
    return (_ctx, _cache) => {
      return {
        a: form.dian_hua,
        b: common_vendor.o(($event) => form.dian_hua = $event.detail.value, "ff"),
        c: form.mi_ma,
        d: common_vendor.o(($event) => form.mi_ma = $event.detail.value, "cc"),
        e: common_vendor.o(handleLogin, "2e"),
        f: common_vendor.o(goToRegister, "11")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
