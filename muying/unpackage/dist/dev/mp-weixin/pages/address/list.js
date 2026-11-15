"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const addressList = common_vendor.ref([]);
    const isSelectMode = common_vendor.ref(false);
    common_vendor.onShow(() => {
      const mode = common_vendor.index.getStorageSync("addressMode");
      isSelectMode.value = mode === "select";
      fetchAddressList();
    });
    const fetchAddressList = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      try {
        const res = await utils_request.request.get("/address/list", { ke_hu_id: currentCustomerId });
        if (res.code === 200) {
          addressList.value = res.data;
        }
      } catch (e) {
      }
    };
    const goToEdit = (item) => {
      if (item) {
        common_vendor.index.setStorageSync("editAddress", item);
      } else {
        common_vendor.index.removeStorageSync("editAddress");
      }
      common_vendor.index.navigateTo({ url: "/pages/address/edit" });
    };
    const selectAddress = (item) => {
      if (isSelectMode.value) {
        common_vendor.index.setStorageSync("selectedAddress", item);
        common_vendor.index.removeStorageSync("addressMode");
        common_vendor.index.navigateBack();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: addressList.value.length > 0
      }, addressList.value.length > 0 ? {
        b: common_vendor.f(addressList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.shou_jian_ren),
            b: common_vendor.t(item.dian_hua),
            c: item.is_default
          }, item.is_default ? {} : {}, {
            d: common_vendor.t(item.di_zhi_xiang_qing),
            e: common_vendor.o(($event) => goToEdit(item), item.id),
            f: item.id,
            g: common_vendor.o(($event) => selectAddress(item), item.id)
          });
        })
      } : {}, {
        c: common_vendor.o(($event) => goToEdit(null), "20")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90a3874e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/list.js.map
