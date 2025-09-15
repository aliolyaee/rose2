import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add response interceptor for token refresh if API supports it
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (!refreshToken) return Promise.reject(error);

//         // Replace with your actual token refresh endpoint and logic
//         const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/refresh-token`, { refreshToken });

//         localStorage.setItem('accessToken', data.accessToken);
//         // Update refreshToken if the refresh endpoint provides a new one
//         // if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

//         axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
//         originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Handle refresh token failure (e.g., redirect to login)
//         console.error('Token refresh failed:', refreshError);
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         // Potentially redirect to login page
//         if (typeof window !== 'undefined') {
//           // window.location.href = '/login';
//         }
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
