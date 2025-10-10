import axios from "axios";

// Tạo instance
const api = axios.create({
    baseURL: "http://localhost:8085/api", // backend của bạn
    timeout: 10000,
});

// // Interceptor thêm token vào header Authorization
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("accessToken"); // giả sử bạn lưu JWT ở localStorage
//         if (token && config.headers) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Interceptor xử lý response lỗi chung (option)
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.log("Token hết hạn hoặc không hợp lệ");
//             // Có thể logout user hoặc redirect login
//         }
//         return Promise.reject(error);
//     }
// );

export default api;
