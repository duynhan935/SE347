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

// 🧩 Interceptor xử lý lỗi toàn cục
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        console.group("%c⚠️ API Error", "color:red; font-weight:bold;");
        console.log("➡️ URL:", error.config?.url);
        console.log("➡️ Method:", error.config?.method?.toUpperCase());
        console.log("➡️ Status:", status ?? "Unknown");

        // Nếu backend có trả về errorCode/message
        if (data?.errorCode || data?.message) {
            console.log("➡️ Error Code:", data.errorCode);
            console.log("➡️ Message:", data.message);
        } else {
            console.log("➡️ Raw Error:", error.message);
        }

        console.groupEnd();

        // ⚡ Tùy chỉnh thêm theo mã lỗi HTTP
        switch (status) {
            case 400:
                console.error("Bad Request – Kiểm tra dữ liệu gửi đi");
                break;
            case 401:
                console.error("Unauthorized – Token hết hạn hoặc không hợp lệ");
                // Có thể gọi logout() hoặc redirect login tại đây
                break;
            case 404:
                console.error("Not Found – Không tìm thấy tài nguyên");
                break;
            case 500:
                console.error("Internal Server Error – Lỗi máy chủ");
                break;
            default:
                console.error("Unknown Error –", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
