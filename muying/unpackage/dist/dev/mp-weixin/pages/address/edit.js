"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const form = common_vendor.reactive({ id: null, shou_jian_ren: "", dian_hua: "", di_zhi_xiang_qing: "", is_default: false });
    common_vendor.onLoad(() => {
      const editData = common_vendor.index.getStorageSync("editAddress");
      if (editData) {
        form.id = editData.id;
        form.shou_jian_ren = editData.shou_jian_ren;
        form.dian_hua = editData.dian_hua;
        form.di_zhi_xiang_qing = editData.di_zhi_xiang_qing;
        form.is_default = !!editData.is_default;
      }
    });
    const saveAddress = async () => {
      if (!form.shou_jian_ren || !form.dian_hua || !form.di_zhi_xiang_qing) {
        return common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
      }
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      try {
        const payload = { ...form, ke_hu_id: currentCustomerId };
        const res = await utils_request.request.post("/address/save", payload);
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        }
      } catch (e) {
      }
    };
    return (_ctx, _cache) => {
      return {
        a: form.shou_jian_ren,
        b: common_vendor.o(($event) => form.shou_jian_ren = $event.detail.value, "fe"),
        c: form.dian_hua,
        d: common_vendor.o(($event) => form.dian_hua = $event.detail.value, "40"),
        e: form.di_zhi_xiang_qing,
        f: common_vendor.o(($event) => form.di_zhi_xiang_qing = $event.detail.value, "d8"),
        g: form.is_default,
        h: common_vendor.o(($event) => form.is_default = $event.detail.value, "76"),
        i: common_vendor.o(saveAddress, "26")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
