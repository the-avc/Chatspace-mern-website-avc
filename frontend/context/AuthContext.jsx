import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axiosInstance, { setAccessToken, getAccessToken, setTokenRefreshFailCallback } from "../src/lib/axiosInstance";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    //when token refresh fails => re-route
    const handleTokenRefreshFail = () => {
        // console.log("Token refresh failed - starting cleanup");
        // console.log("Socket connected:", socket?.connected);
        setAuthUser(null);
        setAccessToken(null);
        if (socket && socket?.connected) socket.disconnect();
        setSocket(null);
        setOnlineUsers([]);
        // console.log("Cleanup completed");
    }

    useEffect(() => {
        setTokenRefreshFailCallback(handleTokenRefreshFail);
    }, []);

    //check if user is authenticated and set user data and connect to socket
    const checkAuth = async () => {
        try {
            const { data } = await axiosInstance.post("/api/auth/refresh-token");
            if (data?.success) {
                setAccessToken(data.token);
                setAuthUser(data.userData);
                connectSocket(data.userData);
            } else {
                setAccessToken(null);
                setAuthUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setAccessToken(null);
            setAuthUser(null);
        } finally {
            setLoading(false);
        }
    };

    //login func to handle socket connection on login
    const login = async (state, credentials) => {
        try {
            const { data } = await axiosInstance.post(`/api/auth/${state}`, credentials);
            if (data?.success) {
                setAccessToken(data.token);
                setAuthUser(data.userData);
                connectSocket(data.userData);
                toast.success(data.message);
                return { success: true, user: data.userData, isSignup: state === 'signup' };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.error("Login failed");
            return { success: false, message: errorMessage };
        }
    }

    //logout func to disconnect socket on logout
    const logout = async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch (error) {
            console.error("Logout error:", error);
        }
        setAuthUser(null);
        setOnlineUsers([]);
        setAccessToken(null);
        if (socket && socket?.connected) socket.disconnect();
        setSocket(null);
        toast.success("Logged out successfully");
    }

    //update profile func to update authUser state
    const updateProfile = async (formData) => {
        try {
            const { data } = await axiosInstance.put("/api/auth/update-profile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (data?.success) {
                setAuthUser(data.updatedUser);
                toast.success("Profile updated successfully");
                return { success: true, user: data.updatedUser };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Profile update failed";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    //connect socket to handle real-time events
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const token = getAccessToken();
        if (!token) {
            console.error("No token found, cannot connect socket");
            return;
        }

        const newSocket = io(backendURL, { // this creates a new socket connection for the user to the backend
            // Send JWT token for secure authentication
            auth: {
                token: token
            },
            // Keep userId in query for backward compatibility (optional)
            query: {
                userId: userData._id
            },
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            // server should emit an array of userIds;
            console.debug("getOnlineUsers payload:", userIds);
            if (Array.isArray(userIds)) {
                setOnlineUsers(userIds);
            } else if (userIds && typeof userIds === 'object') {
                try {
                    setOnlineUsers(Array.from(Object.keys(userIds)));
                } catch (e) {
                    setOnlineUsers([]);
                }
            } else {
                setOnlineUsers([]);
            }
        });

        newSocket.on('connect_error', (err) => { // Log connection errors
            console.error('Socket connection failed:', err.message);
            // Handle authentication errors specifically
            if (err.message.includes('Authentication error')) {
                console.error('Socket authentication failed - token may be invalid or expired');
                // force logout on auth failure
                logout();
            }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    }

    useEffect(() => { // on initial load, check for token and set axios header
        checkAuth();
    }, []);

    const value = {
        axios: axiosInstance, // Provide axiosInstance instead of plain axios
        authUser,
        onlineUsers,
        socket,
        loading,
        login,
        logout,
        updateProfile,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}