"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "message",
  setup(__props) {
    const unread = common_vendor.ref({
      reply: 3,
      like: 12,
      chat: 0
    });
    const shopMessages = common_vendor.ref([
      {
        id: 1,
        shop_name: "全棉时代官方旗舰店",
        shop_logo: "https://img.alicdn.com/imgextra/i3/O1CN01Lp1m9z1vH3w8yB8YJ_!!6000000006146-0-tps-1000-450.jpg",
        content: "[自动回复] 亲，双十一大促全场满300减50哦！",
        time: "4月30日"
      },
      {
        id: 2,
        shop_name: "好孩子母婴专营店",
        shop_logo: "https://img.alicdn.com/imgextra/i4/O1CN015i7Xo31jIq2N6i1p4_!!6000000004526-0-tps-1000-450.jpg",
        content: "您咨询的尺码目前有货的，可以放心拍下~",
        time: "3月15日"
      }
    ]);
    const goTo = (type) => {
      if (type === "reply") {
        common_vendor.index.showToast({ title: "去往回复我的列表", icon: "none" });
      } else if (type === "like") {
        common_vendor.index.showToast({ title: "去往收到点赞列表", icon: "none" });
      } else if (type === "chat") {
        common_vendor.index.showToast({ title: "打开客服聊天窗口", icon: "none" });
      } else if (type === "logistics") {
        common_vendor.index.showToast({ title: "打开物流详情", icon: "none" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: unread.value.reply > 0
      }, unread.value.reply > 0 ? {
        b: common_vendor.t(unread.value.reply)
      } : {}, {
        c: common_vendor.o(($event) => goTo("reply"), "7a"),
        d: unread.value.like > 0
      }, unread.value.like > 0 ? {
        e: common_vendor.t(unread.value.like)
      } : {}, {
        f: common_vendor.o(($event) => goTo("like"), "93"),
        g: unread.value.chat > 0
      }, unread.value.chat > 0 ? {
        h: common_vendor.t(unread.value.chat)
      } : {}, {
        i: common_vendor.o(($event) => goTo("chat"), "aa"),
        j: common_vendor.o(($event) => goTo("logistics"), "e7"),
        k: common_vendor.f(shopMessages.value, (item, k0, i0) => {
          return {
            a: item.shop_logo,
            b: common_vendor.t(item.shop_name),
            c: common_vendor.t(item.time),
            d: common_vendor.t(item.content),
            e: item.id
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
