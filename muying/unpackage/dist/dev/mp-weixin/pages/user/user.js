"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const isLogin = common_vendor.ref(false);
    const userInfo = common_vendor.ref({});
    const orderCounts = common_vendor.ref({
      pay: 0,
      // 待付款 (0)
      ship: 0,
      // 待发货 (1)
      recv: 0,
      // 待收货 (2)
      review: 0
      // 待评价 (3)
    });
    common_vendor.onShow(() => {
      const customerId = common_vendor.index.getStorageSync("customerId");
      if (customerId) {
        isLogin.value = true;
        userInfo.value = common_vendor.index.getStorageSync("customerInfo") || {};
        fetchOrderStats(customerId);
      } else {
        isLogin.value = false;
        userInfo.value = {};
        resetCounts();
      }
    });
    const fetchOrderStats = async (customerId) => {
      try {
        const res = await utils_request.request.get("/ding_dan", { ke_hu_id: customerId, pageSize: 100 });
        if (res.code === 200 && res.data.lists) {
          const orders = res.data.lists;
          orderCounts.value.pay = orders.filter((o) => o.zhuang_tai === 0).length;
          orderCounts.value.ship = orders.filter((o) => o.zhuang_tai === 1).length;
          orderCounts.value.recv = orders.filter((o) => o.zhuang_tai === 2).length;
          orderCounts.value.review = orders.filter((o) => o.zhuang_tai === 3).length;
        }
      } catch (error) {
      }
    };
    const resetCounts = () => {
      orderCounts.value = { pay: 0, ship: 0, recv: 0, review: 0 };
    };
    const goToOrder = (status) => {
      if (!isLogin.value)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      common_vendor.index.navigateTo({ url: `/pages/order/list?status=${status}` });
    };
    const goToAddressList = () => {
      if (!isLogin.value)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      common_vendor.index.removeStorageSync("addressMode");
      common_vendor.index.navigateTo({ url: "/pages/address/list" });
    };
    const checkLogin = () => {
      if (!isLogin.value)
        common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: function(res) {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("customerId");
            common_vendor.index.removeStorageSync("customerInfo");
            isLogin.value = false;
            resetCounts();
            common_vendor.index.showToast({ title: "已退出", icon: "none" });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLogin.value
      }, isLogin.value ? {
        b: common_vendor.t(userInfo.value.xing_ming || "尊贵的会员"),
        c: common_vendor.t(userInfo.value.dian_hua || "未绑定")
      } : {}, {
        d: common_vendor.o(checkLogin, "cd"),
        e: common_vendor.o(($event) => goToOrder(""), "67"),
        f: orderCounts.value.pay > 0
      }, orderCounts.value.pay > 0 ? {
        g: common_vendor.t(orderCounts.value.pay)
      } : {}, {
        h: common_vendor.o(($event) => goToOrder(0), "9c"),
        i: orderCounts.value.ship > 0
      }, orderCounts.value.ship > 0 ? {
        j: common_vendor.t(orderCounts.value.ship)
      } : {}, {
        k: common_vendor.o(($event) => goToOrder(1), "ad"),
        l: orderCounts.value.recv > 0
      }, orderCounts.value.recv > 0 ? {
        m: common_vendor.t(orderCounts.value.recv)
      } : {}, {
        n: common_vendor.o(($event) => goToOrder(2), "c9"),
        o: orderCounts.value.review > 0
      }, orderCounts.value.review > 0 ? {
        p: common_vendor.t(orderCounts.value.review)
      } : {}, {
        q: common_vendor.o(($event) => goToOrder(3), "45"),
        r: common_vendor.o(($event) => goToOrder(-1), "ab"),
        s: common_vendor.o(goToAddressList, "b9"),
        t: isLogin.value
      }, isLogin.value ? {
        v: common_vendor.o(handleLogout, "1c")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
