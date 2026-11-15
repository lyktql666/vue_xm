"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "review",
  setup(__props) {
    const productId = common_vendor.ref(null);
    const allReviews = common_vendor.ref([]);
    const currentTab = common_vendor.ref("all");
    const sortBy = common_vendor.ref("hot");
    const showReviewModal = common_vendor.ref(false);
    const showDetailPopup = common_vendor.ref(false);
    const currentReview = common_vendor.ref({});
    const replyTarget = common_vendor.ref(null);
    const replyContent = common_vendor.ref("");
    const isInputFocus = common_vendor.ref(false);
    const newReview = common_vendor.ref({ star: 5, content: "" });
    common_vendor.onLoad(() => {
      loadLocalData();
    });
    common_vendor.onShow(() => {
      fetchLatestData();
    });
    const loadLocalData = () => {
      const data = common_vendor.index.getStorageSync("currentProduct");
      if (data) {
        productId.value = data.id;
        allReviews.value = data.reviews || [];
      }
    };
    const fetchLatestData = async () => {
      if (!productId.value)
        return;
      const currentCustomerId = common_vendor.index.getStorageSync("customerId") || "";
      try {
        const res = await utils_request.request.get("/sp_lie_biao", { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId });
        if (res.code === 200) {
          const latestProduct = res.data.lists.find((item) => item.id === productId.value);
          if (latestProduct) {
            allReviews.value = latestProduct.reviews || [];
            common_vendor.index.setStorageSync("currentProduct", latestProduct);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/detail/review.vue:218", error);
      }
    };
    const syncCache = () => {
      const data = common_vendor.index.getStorageSync("currentProduct");
      if (data) {
        data.reviews = allReviews.value;
        common_vendor.index.setStorageSync("currentProduct", data);
      }
    };
    const calculateHotScore = (review) => {
      const LIKE_WEIGHT = 2;
      const REPLY_WEIGHT = 5;
      const GRAVITY = 1.5;
      const likes = review.likeCount || 0;
      const replies = review.replies && review.replies.length || 0;
      const baseScore = likes * LIKE_WEIGHT + replies * REPLY_WEIGHT + 1;
      const hoursElapsed = ((/* @__PURE__ */ new Date()).getTime() - new Date(review.time).getTime()) / (1e3 * 60 * 60);
      return baseScore / Math.pow(hoursElapsed + 2, GRAVITY);
    };
    const sortedReviews = common_vendor.computed(() => {
      let list = allReviews.value.filter((item) => {
        if (currentTab.value === "good")
          return item.star >= 3;
        if (currentTab.value === "bad")
          return item.star <= 2;
        return true;
      });
      list.sort((a, b) => {
        if (sortBy.value === "time") {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        } else {
          return calculateHotScore(b) - calculateHotScore(a);
        }
      });
      return list;
    });
    const toggleSort = () => {
      sortBy.value = sortBy.value === "hot" ? "time" : "hot";
    };
    const inputPlaceholder = common_vendor.computed(() => {
      if (replyTarget.value) {
        return `回复 @${replyTarget.value.customer_name}：`;
      }
      return "勇敢滴少年啊快去创造热评~";
    });
    const openDetailPopup = (reviewItem) => {
      currentReview.value = reviewItem;
      replyTarget.value = null;
      replyContent.value = "";
      showDetailPopup.value = true;
    };
    const closeDetailPopup = () => {
      showDetailPopup.value = false;
      isInputFocus.value = false;
    };
    const setReplyTarget = (replyItem) => {
      replyTarget.value = replyItem;
      isInputFocus.value = true;
    };
    const handleLike = async (item, type) => {
      if (item.id > 1e11) {
        return common_vendor.index.showToast({ title: "刚发布的内容，刷新后再赞哦~", icon: "none" });
      }
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      item.isLiked = !item.isLiked;
      item.likeCount = (item.likeCount || 0) + (item.isLiked ? 1 : -1);
      try {
        const res = await utils_request.request.post("/hu_dong/toggle_like", {
          target_type: type,
          target_id: item.id,
          ke_hu_id: currentCustomerId
        });
        if (res.code === 200) {
          syncCache();
        } else {
          item.isLiked = !item.isLiked;
          item.likeCount += item.isLiked ? 1 : -1;
          common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        }
      } catch (error) {
        item.isLiked = !item.isLiked;
        item.likeCount += item.isLiked ? 1 : -1;
      }
    };
    const handleReport = () => {
      common_vendor.index.showToast({ title: "已收到举报，我们将尽快核实", icon: "none" });
    };
    const submitReply = async () => {
      if (!replyContent.value)
        return;
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      try {
        const res = await utils_request.request.post("/hu_dong/add_reply", {
          ping_jia_id: currentReview.value.id,
          ke_hu_id: currentCustomerId,
          content: replyContent.value,
          reply_to_name: replyTarget.value ? replyTarget.value.customer_name : null
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "发送成功" });
          if (!currentReview.value.replies)
            currentReview.value.replies = [];
          currentReview.value.replies.push({
            id: Date.now(),
            customer_name: common_vendor.index.getStorageSync("customerInfo").xing_ming || "我",
            content: replyContent.value,
            reply_to_name: replyTarget.value ? replyTarget.value.customer_name : null,
            time: /* @__PURE__ */ new Date(),
            isLiked: false,
            likeCount: 0
          });
          syncCache();
          replyContent.value = "";
          isInputFocus.value = false;
        }
      } catch (error) {
      }
    };
    const submitReview = async () => {
      if (!newReview.value.content)
        return common_vendor.index.showToast({ title: "写点什么吧", icon: "none" });
      const currentCustomerId = common_vendor.index.getStorageSync("customerId");
      if (!currentCustomerId)
        return common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      try {
        const res = await utils_request.request.post("/hu_dong/add_review", {
          shang_pin_id: productId.value,
          ke_hu_id: currentCustomerId,
          star: newReview.value.star,
          content: newReview.value.content
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "评价成功" });
          showReviewModal.value = false;
          allReviews.value.unshift({
            id: Date.now(),
            customer_name: common_vendor.index.getStorageSync("customerInfo").xing_ming || "我",
            star: newReview.value.star,
            content: newReview.value.content,
            replies: [],
            isLiked: false,
            likeCount: 0
          });
          syncCache();
        } else {
          common_vendor.index.showToast({ title: res.message, icon: "none", duration: 3e3 });
        }
      } catch (error) {
      }
    };
    const formatDate = (dateStr) => {
      if (!dateStr)
        return "刚刚";
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: currentTab.value === "all" ? 1 : "",
        b: common_vendor.o(($event) => currentTab.value = "all", "d6"),
        c: currentTab.value === "good" ? 1 : "",
        d: common_vendor.o(($event) => currentTab.value = "good", "cc"),
        e: currentTab.value === "bad" ? 1 : "",
        f: common_vendor.o(($event) => currentTab.value = "bad", "15"),
        g: allReviews.value.length > 0
      }, allReviews.value.length > 0 ? {
        h: common_vendor.t(sortBy.value === "hot" ? "热门评论" : "最新评论"),
        i: common_vendor.t(sortBy.value === "hot" ? "时间" : "热度"),
        j: common_vendor.o(toggleSort, "6e")
      } : {}, {
        k: common_vendor.f(sortedReviews.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.customer_name),
            b: common_vendor.f(item.star, (s, k1, i1) => {
              return {
                a: s
              };
            }),
            c: common_vendor.t(item.content),
            d: item.replies && item.replies.length > 0
          }, item.replies && item.replies.length > 0 ? common_vendor.e({
            e: common_vendor.f(item.replies.slice(0, 2), (reply, idx, i1) => {
              return {
                a: common_vendor.t(reply.customer_name),
                b: common_vendor.t(reply.content),
                c: idx
              };
            }),
            f: item.replies.length > 2
          }, item.replies.length > 2 ? {
            g: common_vendor.t(item.replies.length)
          } : {}, {
            h: common_vendor.o(($event) => openDetailPopup(item), item.id)
          }) : {}, {
            i: common_vendor.t(formatDate(item.time)),
            j: common_vendor.t(item.likeCount || 0),
            k: item.isLiked ? 1 : "",
            l: common_vendor.o(($event) => handleLike(item, "review"), item.id),
            m: common_vendor.o(($event) => openDetailPopup(item), item.id),
            n: common_vendor.o(handleReport, item.id),
            o: item.id
          });
        }),
        l: showDetailPopup.value
      }, showDetailPopup.value ? common_vendor.e({
        m: common_vendor.o(closeDetailPopup, "74"),
        n: common_vendor.o(($event) => setReplyTarget(null), "94"),
        o: common_vendor.t(currentReview.value.customer_name),
        p: common_vendor.o(($event) => setReplyTarget(null), "82"),
        q: common_vendor.t(currentReview.value.content),
        r: common_vendor.o(($event) => setReplyTarget(null), "5a"),
        s: common_vendor.t(formatDate(currentReview.value.time)),
        t: common_vendor.t(currentReview.value.likeCount || 0),
        v: currentReview.value.isLiked ? 1 : "",
        w: common_vendor.o(($event) => handleLike(currentReview.value, "review"), "0a"),
        x: common_vendor.o(($event) => setReplyTarget(null), "c5"),
        y: common_vendor.o(handleReport, "77"),
        z: common_vendor.t(((_a = currentReview.value.replies) == null ? void 0 : _a.length) || 0),
        A: common_vendor.f(currentReview.value.replies, (reply, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.o(($event) => setReplyTarget(reply), reply.id),
            b: common_vendor.t(reply.customer_name),
            c: common_vendor.o(($event) => setReplyTarget(reply), reply.id),
            d: reply.reply_to_name
          }, reply.reply_to_name ? {
            e: common_vendor.t(reply.reply_to_name)
          } : {}, {
            f: common_vendor.t(reply.content),
            g: common_vendor.o(($event) => setReplyTarget(reply), reply.id),
            h: common_vendor.t(formatDate(reply.time)),
            i: common_vendor.t(reply.likeCount || 0),
            j: reply.isLiked ? 1 : "",
            k: common_vendor.o(($event) => handleLike(reply, "reply"), reply.id),
            l: common_vendor.o(($event) => setReplyTarget(reply), reply.id),
            m: common_vendor.o(handleReport, reply.id),
            n: reply.id
          });
        }),
        B: !currentReview.value.replies || currentReview.value.replies.length === 0
      }, !currentReview.value.replies || currentReview.value.replies.length === 0 ? {} : {}, {
        C: inputPlaceholder.value,
        D: isInputFocus.value,
        E: common_vendor.o(($event) => isInputFocus.value = false, "7c"),
        F: replyContent.value,
        G: common_vendor.o(($event) => replyContent.value = $event.detail.value, "7b"),
        H: replyContent.value.length > 0 ? 1 : "",
        I: common_vendor.o(submitReply, "11"),
        J: common_vendor.o(() => {
        }, "e4"),
        K: common_vendor.o(closeDetailPopup, "52")
      }) : {}, {
        L: !showDetailPopup.value
      }, !showDetailPopup.value ? {
        M: common_vendor.o(($event) => showReviewModal.value = true, "a1")
      } : {}, {
        N: showReviewModal.value
      }, showReviewModal.value ? {
        O: common_vendor.o(($event) => showReviewModal.value = false, "11"),
        P: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: common_vendor.t(i <= newReview.value.star ? "⭐" : "☆"),
            b: i,
            c: i <= newReview.value.star ? 1 : "",
            d: common_vendor.o(($event) => newReview.value.star = i, i)
          };
        }),
        Q: newReview.value.content,
        R: common_vendor.o(($event) => newReview.value.content = $event.detail.value, "10"),
        S: common_vendor.o(submitReview, "19")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-969ecf9b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/review.js.map
