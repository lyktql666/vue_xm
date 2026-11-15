"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "pay",
  setup(__props) {
    const checkoutItems = common_vendor.ref([]);
    const currentAddress = common_vendor.ref(null);
    const payType = common_vendor.ref("wechat");
    const isPaying = common_vendor.ref(false);
    common_vendor.onShow(() => {
      const items = common_vendor.index.getStorageSync("checkoutItems");
      if (items)
        checkoutItems.value = items;
      const selected = common_vendor.index.getStorageSync("selectedAddress");
      if (selected) {
        currentAddress.value = selected;
        common_vendor.index.removeStorageSync("selectedAddress");
      } else if (!currentAddress.value) {
        fetchDefaultAddress();
      }
    });
    const fetchDefaultAddress = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      try {
        const res = await utils_request.request.get("/address/list", { ke_hu_id: currentCustomerId });
        if (res.code === 200 && res.data.length > 0) {
          currentAddress.value = res.data.find((a) => a.is_default == 1 || a.is_default === true) || res.data[0];
        }
      } catch (e) {
      }
    };
    const chooseAddress = () => {
      common_vendor.index.setStorageSync("addressMode", "select");
      common_vendor.index.navigateTo({ url: "/pages/address/list" });
    };
    const totalCount = common_vendor.computed(() => {
      return checkoutItems.value.reduce((sum, item) => sum + (item.shu_liang || 1), 0);
    });
    const totalPrice = common_vendor.computed(() => {
      let total = checkoutItems.value.reduce((sum, item) => sum + item.jia_ge * (item.shu_liang || 1), 0);
      return total.toFixed(2);
    });
    const handlePay = async () => {
      if (!currentAddress.value)
        return common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
      if (isPaying.value)
        return;
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      isPaying.value = true;
      common_vendor.index.showLoading({ title: "支付处理中..." });
      try {
        const orderItems = checkoutItems.value.map((item) => ({
          shang_pin_id: item.shang_pin_id || item.id,
          // 兼容购物车和详情页直接购买
          shu_liang: item.shu_liang || 1,
          price: item.jia_ge
        }));
        const createRes = await utils_request.request.post("/ding_dan/create", {
          ke_hu_id: currentCustomerId,
          address_id: currentAddress.value.id,
          items: orderItems
        });
        if (createRes.code === 200) {
          const payRes = await utils_request.request.post("/ding_dan/pay_success", { order_id: createRes.data.order_id });
          if (payRes.code === 200) {
            const cartIds = checkoutItems.value.filter((i) => i.cart_id).map((i) => i.cart_id);
            if (cartIds.length > 0) {
              await utils_request.request.post("/cart/delete_batch", { cart_ids: cartIds });
            }
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "支付成功！", icon: "success" });
            common_vendor.index.removeStorageSync("checkoutItems");
            setTimeout(() => {
              common_vendor.index.switchTab({ url: "/pages/cart/cart" });
            }, 1500);
          }
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: createRes.message || "下单失败", icon: "none" });
          isPaying.value = false;
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        isPaying.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentAddress.value
      }, currentAddress.value ? {
        b: common_vendor.t(currentAddress.value.di_zhi_xiang_qing),
        c: common_vendor.t(currentAddress.value.shou_jian_ren),
        d: common_vendor.t(currentAddress.value.dian_hua)
      } : {}, {
        e: common_vendor.o(chooseAddress, "5f"),
        f: common_vendor.f(checkoutItems.value, (item, index, i0) => {
          var _a;
          return {
            a: item.pic_url || ((_a = item.pic_urls) == null ? void 0 : _a[0]) || "/static/default.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.jia_ge),
            d: common_vendor.t(item.shu_liang || item.buyCount || 1),
            e: index
          };
        }),
        g: payType.value === "wechat" ? 1 : "",
        h: common_vendor.o(($event) => payType.value = "wechat", "1e"),
        i: payType.value === "alipay" ? 1 : "",
        j: common_vendor.o(($event) => payType.value = "alipay", "d8"),
        k: common_vendor.t(totalCount.value),
        l: common_vendor.t(totalPrice.value),
        m: common_vendor.t(isPaying.value ? "处理中..." : "确认支付"),
        n: isPaying.value ? 1 : "",
        o: common_vendor.o(handlePay, "22")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d4627034"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/pay.js.map
