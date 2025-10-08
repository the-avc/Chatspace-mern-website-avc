import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: backendURL,
    withCredentials: true, // Enable cookies for refresh token
});

// Variable to track current access token (in memory only)
let currentAccessToken = null;
let isRefreshing = false;

// Function to set access token
export const setAccessToken = (token) => {
    currentAccessToken = token;
    if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
    }
};

// Function to get current access token
export const getAccessToken = () => currentAccessToken;

// Simplified response interceptor for token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors and avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh token using HTTP-only cookie
                const refreshResponse = await axios.post(`${backendURL}/api/auth/refresh-token`, {}, {
                    withCredentials: true
                });

                if (refreshResponse.data?.success && refreshResponse.data.token) {
                    setAccessToken(refreshResponse.data.token);
                    originalRequest.headers["Authorization"] = `Bearer ${refreshResponse.data.token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear token
                setAccessToken(null);
                window.location.href = "/login";
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;