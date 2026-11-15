// utils/request.js
const BASE_URL = 'http://localhost:3000'; // 换成你 Node.js 的真实前缀

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: {
        // 如果以后有 token，可以在这里带上
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data); // 这里直接返回后端给的 { code: 200, data: {...} }
        } else {
          uni.showToast({ title: '服务器异常', icon: 'error' });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'error' });
        reject(err);
      }
    });
  });
};

export default {
  get: (url, data) => request(url, 'GET', data),
  post: (url, data) => request(url, 'POST', data),
}