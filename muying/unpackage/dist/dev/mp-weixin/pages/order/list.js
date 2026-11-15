"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const tabs = [
      { label: "全部", value: "" },
      { label: "待付款", value: 0 },
      { label: "待发货", value: 1 },
      { label: "待收货", value: 2 },
      { label: "待评价", value: 3 }
    ];
    const currentStatus = common_vendor.ref("");
    const orderList = common_vendor.ref([]);
    common_vendor.onLoad((options) => {
      if (options.status !== void 0 && options.status !== "undefined") {
        currentStatus.value = options.status === "" ? "" : parseInt(options.status);
      }
      fetchOrders();
    });
    const switchTab = (status) => {
      currentStatus.value = status;
      fetchOrders();
    };
    const fetchOrders = async () => {
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return;
      try {
        const res = await utils_request.request.get("/ding_dan", {
          currentPage: 1,
          pageSize: 50,
          ke_hu_id: currentCustomerId,
          status: currentStatus.value
        });
        if (res.code === 200) {
          orderList.value = res.data.lists || [];
        }
      } catch (error) {
      }
    };
    const getStatusText = (status) => {
      const map = { 0: "待付款", 1: "待发货", 2: "卖家已发货", 3: "交易完成", "-1": "交易关闭" };
      return map[status] || "未知";
    };
    const getStatusClass = (status) => {
      if (status === 0 || status === 2)
        return "text-red";
      if (status === 3)
        return "text-green";
      return "text-gray";
    };
    const getTotalCount = (goodsList) => {
      return goodsList.reduce((sum, item) => sum + item.buy_count, 0);
    };
    const goToDetail = (id) => {
    };
    const payNow = (order) => {
      common_vendor.index.navigateTo({ url: `/pages/checkout/pay?order_id=${order.id}&amount=${order.fu_kuan_jing_e}` });
    };
    const confirmReceipt = async (orderId) => {
      common_vendor.index.showModal({
        title: "确认收货",
        content: "确认已收到商品？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const upRes = await utils_request.request.post("/ding_dan/xiugai", { id: orderId, zhuang_tai: 3 });
              if (upRes.code === 200) {
                common_vendor.index.showToast({ title: "收货成功" });
                fetchOrders();
              }
            } catch (e) {
            }
          }
        }
      });
    };
    const goToReview = (order) => {
      common_vendor.index.showToast({ title: "去评价", icon: "none" });
    };
    const loadMore = () => {
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.label),
            b: currentStatus.value === tab.value
          }, currentStatus.value === tab.value ? {} : {}, {
            c: index,
            d: currentStatus.value === tab.value ? 1 : "",
            e: common_vendor.o(($event) => switchTab(tab.value), index)
          });
        }),
        b: common_vendor.f(orderList.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getStatusText(order.zhuang_tai)),
            b: common_vendor.n(getStatusClass(order.zhuang_tai)),
            c: common_vendor.f(order.goods_list, (good, k1, i1) => {
              var _a;
              return {
                a: ((_a = good.pic_urls) == null ? void 0 : _a[0]) || "/static/default.png",
                b: common_vendor.t(good.shang_pin_name),
                c: common_vendor.t(good.buy_price),
                d: common_vendor.t(good.buy_count),
                e: good.shang_pin_id,
                f: common_vendor.o(($event) => goToDetail(good.shang_pin_id), good.shang_pin_id)
              };
            }),
            d: common_vendor.t(getTotalCount(order.goods_list)),
            e: common_vendor.t(order.fu_kuan_jing_e),
            f: order.zhuang_tai === 0
          }, order.zhuang_tai === 0 ? {
            g: common_vendor.o(($event) => _ctx.cancelOrder(order), order.id),
            h: common_vendor.o(($event) => payNow(order), order.id)
          } : {}, {
            i: order.zhuang_tai === 1
          }, order.zhuang_tai === 1 ? {} : {}, {
            j: order.zhuang_tai === 2
          }, order.zhuang_tai === 2 ? {
            k: common_vendor.o(($event) => confirmReceipt(order.id), order.id)
          } : {}, {
            l: order.zhuang_tai === 3
          }, order.zhuang_tai === 3 ? {
            m: common_vendor.o(($event) => goToReview(), order.id)
          } : {}, {
            n: order.id
          });
        }),
        c: orderList.value.length === 0
      }, orderList.value.length === 0 ? {} : {}, {
        d: common_vendor.o(loadMore, "32")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-456ecf67"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map
