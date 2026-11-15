"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:3000";
const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        // 如果以后有 token，可以在这里带上
        "Authorization": common_vendor.index.getStorageSync("token") || ""
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          common_vendor.index.showToast({ title: "服务器异常", icon: "error" });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络请求失败", icon: "error" });
        reject(err);
      }
    });
  });
};
const request$1 = {
  get: (url, data) => request(url, "GET", data),
  post: (url, data) => request(url, "POST", data)
};
exports.request = request$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
