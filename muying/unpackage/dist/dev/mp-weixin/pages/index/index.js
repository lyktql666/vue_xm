"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tabList = ["推荐", "关注", "分类"];
    const currentTabIndex = common_vendor.ref(0);
    const switchTab = (index) => {
      currentTabIndex.value = index;
    };
    const onSwiperChange = (e) => {
      currentTabIndex.value = e.detail.current;
    };
    const getCategoryIcon = (name = "") => {
      if (name.includes("奶粉"))
        return "🥛";
      if (name.includes("纸尿") || name.includes("尿布"))
        return "🧷";
      if (name.includes("奶嘴"))
        return "🍼";
      if (name.includes("玩具"))
        return "🧸";
      return "🛍️";
    };
    const bannerList = common_vendor.ref([]);
    const categoryList = common_vendor.ref([]);
    const productList = common_vendor.ref([]);
    const fetchCategories = async () => {
      try {
        const res = await utils_request.request.get("/lb_lie_biao", {
          currentPage: 1,
          pageSize: 5
        });
        if (res.code === 200) {
          categoryList.value = res.data.lists || res.data || [];
          if (categoryList.value.length > 5) {
            categoryList.value = categoryList.value.slice(0, 5);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:203", error);
      }
    };
    const fetchProducts = async () => {
      try {
        const currentCustomerId = common_vendor.index.getStorageSync("customerId") || "";
        const res = await utils_request.request.get("/sp_lie_biao", {
          currentPage: 1,
          pageSize: 20,
          ke_hu_id: currentCustomerId
        });
        if (res.code === 200) {
          productList.value = res.data.lists;
          extractBanners(res.data.lists);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:222", error);
      }
    };
    const extractBanners = (products) => {
      const banners = [];
      for (const item of products) {
        if (item.pic_urls && item.pic_urls.length > 0) {
          banners.push({
            id: item.id,
            pic_url: item.pic_urls[0]
          });
        }
        if (banners.length >= 3)
          break;
      }
      bannerList.value = banners;
    };
    const previewImages = (urls) => {
      if (!urls || urls.length === 0)
        return;
      const cleanUrls = urls.map((url) => {
        const finalUrl = url.startsWith("http") ? url : `http://${url}`;
        return finalUrl.replace("localhost", "127.0.0.1");
      });
      common_vendor.index.previewImage({
        urls: cleanUrls,
        current: cleanUrls[0]
      });
    };
    const goToDetail = (item) => {
      common_vendor.index.setStorageSync("currentProduct", item);
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${item.id}`
      });
    };
    common_vendor.onLoad(() => {
      fetchCategories();
      fetchProducts();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabList, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: currentTabIndex.value === index
          }, currentTabIndex.value === index ? {} : {}, {
            c: index,
            d: currentTabIndex.value === index ? 1 : "",
            e: common_vendor.o(($event) => switchTab(index), index)
          });
        }),
        b: bannerList.value.length > 0
      }, bannerList.value.length > 0 ? {
        c: common_vendor.f(bannerList.value, (item, index, i0) => {
          return {
            a: item.pic_url,
            b: index,
            c: common_vendor.o(($event) => previewImages([item.pic_url]), index)
          };
        })
      } : {}, {
        d: common_vendor.f(categoryList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(getCategoryIcon(item.name)),
            b: common_vendor.t(item.name),
            c: item.id
          };
        }),
        e: common_vendor.f(productList.value, (item, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: ((_a = item.pic_urls) == null ? void 0 : _a[0]) || "/static/default.png",
            b: item.total_stock <= 0
          }, item.total_stock <= 0 ? {} : {}, {
            c: common_vendor.o(($event) => previewImages(item.pic_urls), item.id),
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.lei_xing),
            f: item.pin_pai
          }, item.pin_pai ? {
            g: common_vendor.t(item.pin_pai)
          } : {}, {
            h: common_vendor.t(item.jia_ge),
            i: item.id,
            j: common_vendor.o(($event) => goToDetail(item), item.id)
          });
        }),
        f: common_vendor.t(Math.floor(Math.random() * 1e3) + 100),
        g: productList.value.length > 0
      }, productList.value.length > 0 ? {} : {}, {
        h: currentTabIndex.value,
        i: common_vendor.o(onSwiperChange, "81")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
