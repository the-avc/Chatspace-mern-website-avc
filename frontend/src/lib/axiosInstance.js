import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: backendURL,
    withCredentials: true,
});

// Token management
let currentAccessToken = null;

export const setAccessToken = (token) => {
    currentAccessToken = token;
    axiosInstance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : undefined;
};

export const getAccessToken = () => currentAccessToken;

// Response interceptor for automatic token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config: originalRequest, response } = error;
        
        // Only handle 401s that haven't been retried and aren't refresh requests
        if (response?.status === 401 && !originalRequest._retry && 
            !originalRequest.url?.includes('/refresh-token')) {
            
            originalRequest._retry = true;
            
            try {
                // Use fresh axios to avoid interceptor loops
                const refreshAxios = axios.create({ baseURL: backendURL, withCredentials: true });
                const { data } = await refreshAxios.post('/api/auth/refresh-token');
                
                if (data?.success && data.token) {
                    setAccessToken(data.token);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return axiosInstance(originalRequest);
                }
            } catch {
                // Refresh failed
            }
            
            setAccessToken(null);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;