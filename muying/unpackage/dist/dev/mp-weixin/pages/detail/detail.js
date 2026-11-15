"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const product = common_vendor.ref(null);
    const currentAddress = common_vendor.ref(null);
    const showSkuPopup = common_vendor.ref(false);
    const popupType = common_vendor.ref("cart");
    const buyCount = common_vendor.ref(1);
    common_vendor.onLoad((options) => {
      const data = common_vendor.index.getStorageSync("currentProduct");
      if (data)
        product.value = data;
    });
    common_vendor.onShow(() => {
      fetchLatestData();
      const selected = common_vendor.index.getStorageSync("selectedAddress");
      if (selected) {
        currentAddress.value = selected;
        common_vendor.index.removeStorageSync("selectedAddress");
      } else if (!currentAddress.value) {
        fetchDefaultAddress();
      }
    });
    const fetchLatestData = async () => {
      if (!product.value || !product.value.id)
        return;
      const currentCustomerId = common_vendor.index.getStorageSync("customerId") || "";
      try {
        const res = await utils_request.request.get("/sp_lie_biao", { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId });
        if (res.code === 200) {
          const latestData = res.data.lists.find((item) => item.id === product.value.id);
          if (latestData) {
            product.value = latestData;
            common_vendor.index.setStorageSync("currentProduct", latestData);
          }
        }
      } catch (e) {
      }
    };
    const fetchDefaultAddress = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return;
      try {
        const res = await utils_request.request.get("/address/list", { ke_hu_id: currentCustomerId });
        if (res.code === 200 && res.data.length > 0) {
          currentAddress.value = res.data.find((a) => a.is_default == 1 || a.is_default === true) || res.data[0];
        }
      } catch (e) {
      }
    };
    const goodRate = common_vendor.computed(() => {
      var _a;
      if (!((_a = product.value) == null ? void 0 : _a.reviews) || product.value.reviews.length === 0)
        return 100;
      const goodReviews = product.value.reviews.filter((r) => r.star >= 3);
      return Math.round(goodReviews.length / product.value.reviews.length * 100);
    });
    const previewImages = (urls, current) => {
      if (!urls || urls.length === 0)
        return;
      const cleanUrls = urls.map((url) => url.startsWith("http") ? url : "http://" + url).map((url) => url.replace("localhost", "127.0.0.1"));
      common_vendor.index.previewImage({ urls: cleanUrls, current: cleanUrls[current] });
    };
    const checkBuyCount = () => {
      let val = parseInt(buyCount.value);
      if (isNaN(val) || val < 1)
        buyCount.value = 1;
      if (val > product.value.total_stock)
        buyCount.value = product.value.total_stock;
    };
    const openSkuPopup = (type) => {
      popupType.value = type;
      showSkuPopup.value = true;
    };
    const closeSkuPopup = () => {
      showSkuPopup.value = false;
      setTimeout(() => {
        buyCount.value = 1;
      }, 300);
    };
    const chooseAddress = () => {
      common_vendor.index.setStorageSync("addressMode", "select");
      common_vendor.index.navigateTo({ url: "/pages/address/list" });
    };
    const goToReview = () => {
      common_vendor.index.navigateTo({ url: `/pages/detail/review` });
    };
    const goHome = () => {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    };
    const goCart = () => {
      common_vendor.index.switchTab({ url: "/pages/cart/cart" });
    };
    const confirmSkuAction = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先去个人中心登录", icon: "none" });
      if (product.value.total_stock < buyCount.value) {
        return common_vendor.index.showToast({ title: "手慢了，库存不足", icon: "error" });
      }
      if (popupType.value === "cart") {
        try {
          const res = await utils_request.request.post("/cart/add", {
            ke_hu_id: currentCustomerId,
            shang_pin_id: product.value.id,
            shu_liang: buyCount.value
          });
          if (res.code === 200) {
            common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
            closeSkuPopup();
          } else {
            common_vendor.index.showToast({ title: res.message || "操作失败", icon: "none" });
          }
        } catch (e) {
        }
        return;
      }
      if (!currentAddress.value) {
        return common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
      }
      common_vendor.index.showLoading({ title: "正在锁定库存..." });
      try {
        const res = await utils_request.request.post("/ding_dan/create", {
          ke_hu_id: currentCustomerId,
          address_id: currentAddress.value.id,
          // 传真实的地址 ID
          items: [{
            shang_pin_id: product.value.id,
            shu_liang: buyCount.value,
            price: product.value.jia_ge
          }]
        });
        if (res.code === 200) {
          const payRes = await utils_request.request.post("/ding_dan/pay_success", { order_id: res.data.order_id });
          common_vendor.index.hideLoading();
          if (payRes.code === 200) {
            common_vendor.index.vibrateShort();
            common_vendor.index.showToast({ title: "支付成功！", icon: "success" });
            closeSkuPopup();
          }
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: res.message || "下单失败", icon: "none", duration: 3e3 });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: product.value
      }, product.value ? common_vendor.e({
        b: common_vendor.f(product.value.pic_urls, (url, index, i0) => {
          return {
            a: url,
            b: index,
            c: common_vendor.o(($event) => previewImages(product.value.pic_urls, index), index)
          };
        }),
        c: common_vendor.t(product.value.jia_ge),
        d: common_vendor.t(product.value.total_stock),
        e: common_vendor.t(product.value.name),
        f: common_vendor.t(product.value.pin_pai || "无"),
        g: common_vendor.t(product.value.bao_zhi_qi || "未设置"),
        h: common_vendor.t(((_a = product.value.reviews) == null ? void 0 : _a.length) || 0),
        i: common_vendor.t(goodRate.value),
        j: common_vendor.o(goToReview, "cd"),
        k: product.value.reviews && product.value.reviews.length > 0
      }, product.value.reviews && product.value.reviews.length > 0 ? {
        l: common_vendor.f(product.value.reviews.slice(0, 2), (item, index, i0) => {
          return {
            a: common_vendor.t(item.customer_name),
            b: common_vendor.t(item.star),
            c: common_vendor.t(item.content),
            d: item.id
          };
        })
      } : {}, {
        m: product.value.reviews && product.value.reviews.length > 0
      }, product.value.reviews && product.value.reviews.length > 0 ? {
        n: common_vendor.o(goToReview, "78")
      } : {}, {
        o: common_vendor.o(goHome, "0f"),
        p: common_vendor.o(goCart, "4d"),
        q: common_vendor.o(($event) => openSkuPopup("cart"), "76"),
        r: common_vendor.o(($event) => openSkuPopup("buy"), "5d"),
        s: showSkuPopup.value
      }, showSkuPopup.value ? common_vendor.e({
        t: common_vendor.o(closeSkuPopup, "d5"),
        v: popupType.value === "buy"
      }, popupType.value === "buy" ? common_vendor.e({
        w: common_vendor.t(((_b = currentAddress.value) == null ? void 0 : _b.di_zhi_xiang_qing) || "请点击选择收货地址"),
        x: currentAddress.value
      }, currentAddress.value ? {
        y: common_vendor.t(currentAddress.value.shou_jian_ren),
        z: common_vendor.t(currentAddress.value.dian_hua)
      } : {}, {
        A: common_vendor.o(chooseAddress, "d1")
      }) : {}, {
        B: ((_c = product.value.pic_urls) == null ? void 0 : _c[0]) || "/static/default.png",
        C: common_vendor.o(($event) => previewImages(product.value.pic_urls, 0), "d2"),
        D: common_vendor.t((product.value.jia_ge * buyCount.value).toFixed(2)),
        E: common_vendor.t(product.value.total_stock),
        F: common_vendor.t(buyCount.value),
        G: ((_d = product.value.pic_urls) == null ? void 0 : _d[0]) || "/static/default.png",
        H: common_vendor.t(product.value.name),
        I: buyCount.value <= 1 ? 1 : "",
        J: common_vendor.o(($event) => buyCount.value > 1 && buyCount.value--, "77"),
        K: common_vendor.o(checkBuyCount, "fe"),
        L: buyCount.value,
        M: common_vendor.o(($event) => buyCount.value = $event.detail.value, "c3"),
        N: buyCount.value >= product.value.total_stock ? 1 : "",
        O: common_vendor.o(($event) => buyCount.value < product.value.total_stock && buyCount.value++, "5d"),
        P: popupType.value === "buy"
      }, popupType.value === "buy" ? {} : {}, {
        Q: common_vendor.t(popupType.value === "cart" ? "加入购物车" : `立即支付 ¥${(product.value.jia_ge * buyCount.value).toFixed(2)}`),
        R: popupType.value === "buy" ? 1 : "",
        S: popupType.value === "cart" ? 1 : "",
        T: common_vendor.o(confirmSkuAction, "93"),
        U: common_vendor.o(() => {
        }, "31"),
        V: showSkuPopup.value ? 1 : "",
        W: common_vendor.o(closeSkuPopup, "2d")
      }) : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eca06f3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/detail.js.map
