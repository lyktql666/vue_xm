"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "cart",
  setup(__props) {
    const cartItems = common_vendor.ref([]);
    common_vendor.onShow(() => {
      fetchCartList();
    });
    const fetchCartList = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return;
      try {
        const res = await utils_request.request.get("/cart/list", { ke_hu_id: currentCustomerId });
        if (res.code === 200) {
          cartItems.value = res.data.map((item) => ({
            ...item,
            // 只有状态为1(上架)的商品才默认勾选，下架商品强制不勾选
            checked: item.zhuang_tai ? true : false
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:94", "获取购物车失败", error);
      }
    };
    const totalPrice = common_vendor.computed(() => {
      let total = 0;
      cartItems.value.forEach((item) => {
        if (item.checked && item.zhuang_tai) {
          total += item.jia_ge * item.shu_liang;
        }
      });
      return total.toFixed(2);
    });
    const totalCount = common_vendor.computed(() => {
      return cartItems.value.filter((item) => item.checked && item.zhuang_tai).length;
    });
    const isAllChecked = common_vendor.computed(() => {
      const validItems = cartItems.value.filter((item) => item.zhuang_tai);
      if (validItems.length === 0)
        return false;
      return validItems.every((item) => item.checked);
    });
    const toggleCheck = (item) => {
      if (!item.zhuang_tai) {
        return common_vendor.index.showToast({ title: "该商品已失效", icon: "none" });
      }
      item.checked = !item.checked;
    };
    const toggleAll = () => {
      const target = !isAllChecked.value;
      cartItems.value.forEach((item) => {
        if (item.zhuang_tai) {
          item.checked = target;
        }
      });
    };
    const changeNum = (item, diff) => {
      if (item.shu_liang + diff < 1)
        return;
      item.shu_liang += diff;
    };
    const goHome = () => common_vendor.index.switchTab({ url: "/pages/index/index" });
    const goToDetail = async (id) => {
      common_vendor.index.showLoading({ title: "加载中" });
      try {
        const currentCustomerId = common_vendor.index.getStorageSync("customerId") || "";
        const res = await utils_request.request.get("/sp_lie_biao", { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId });
        if (res.code === 200) {
          const targetProduct = res.data.lists.find((p) => p.id === id);
          if (targetProduct) {
            common_vendor.index.setStorageSync("currentProduct", targetProduct);
            common_vendor.index.navigateTo({ url: `/pages/detail/detail` });
          }
        }
      } catch (error) {
      }
      common_vendor.index.hideLoading();
    };
    const goToCheckout = () => {
      if (totalCount.value === 0)
        return common_vendor.index.showToast({ title: "请选择要结算的商品", icon: "none" });
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      const selectedItems = cartItems.value.filter((item) => item.checked && item.zhuang_tai);
      common_vendor.index.setStorageSync("checkoutItems", selectedItems);
      common_vendor.index.navigateTo({ url: "/pages/checkout/pay" });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: cartItems.value.length > 0
      }, cartItems.value.length > 0 ? {
        b: common_vendor.f(cartItems.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.checked ? "✓" : ""),
            b: item.checked ? 1 : "",
            c: common_vendor.o(($event) => toggleCheck(item), item.cart_id),
            d: item.pic_url,
            e: common_vendor.o(($event) => goToDetail(item.shang_pin_id), item.cart_id),
            f: common_vendor.t(item.name),
            g: !item.zhuang_tai
          }, !item.zhuang_tai ? {} : {
            h: common_vendor.t(item.jia_ge),
            i: common_vendor.o(($event) => changeNum(item, -1), item.cart_id),
            j: common_vendor.t(item.shu_liang),
            k: common_vendor.o(($event) => changeNum(item, 1), item.cart_id),
            l: common_vendor.o(() => {
            }, item.cart_id)
          }, {
            m: common_vendor.o(($event) => goToDetail(item.shang_pin_id), item.cart_id),
            n: item.cart_id
          });
        })
      } : {
        c: common_vendor.o(goHome, "2e")
      }, {
        d: cartItems.value.length > 0
      }, cartItems.value.length > 0 ? {
        e: common_vendor.t(isAllChecked.value ? "✓" : ""),
        f: isAllChecked.value ? 1 : "",
        g: common_vendor.o(toggleAll, "93"),
        h: common_vendor.t(totalPrice.value),
        i: common_vendor.t(totalCount.value),
        j: totalCount.value === 0 ? 1 : "",
        k: common_vendor.o(goToCheckout, "aa")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c91e7611"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/cart.js.map
