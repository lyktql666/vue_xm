"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "register",
  setup(__props) {
    const form = common_vendor.reactive({ dian_hua: "", xing_ming: "", mi_ma: "" });
    const handleRegister = async () => {
      if (!form.dian_hua || !form.xing_ming || !form.mi_ma) {
        return common_vendor.index.showToast({ title: "请填写完整", icon: "none" });
      }
      try {
        const res = await utils_request.request.post("/ke_hu/register", form);
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "注册成功，请登录", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        }
      } catch (error) {
      }
    };
    return (_ctx, _cache) => {
      return {
        a: form.dian_hua,
        b: common_vendor.o(($event) => form.dian_hua = $event.detail.value, "47"),
        c: form.xing_ming,
        d: common_vendor.o(($event) => form.xing_ming = $event.detail.value, "8f"),
        e: form.mi_ma,
        f: common_vendor.o(($event) => form.mi_ma = $event.detail.value, "ef"),
        g: common_vendor.o(handleRegister, "1c")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bac4a35d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
