import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";


const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //check if user is authenticated and set user data and connect to socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/get-profile");
            if (data?.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Authentication failed";
            console.log("Error checking auth", error);
            // Don't show toast error for auth check failures on page load
            // toast.error(errorMessage);
        }
    };

    //login func to handle socket connection on login
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data?.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
                return { success: true, user: data.userData, isSignup: state === 'signup' };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    //logout func to disconnect socket on logout
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["Authorization"] = null;
        toast.success("Logged out successfully");
        socket.disconnect();
        setSocket(null);
    }

    //update profile func to update authUser state
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
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
        const newSocket = io(backendURL, {
            query: {
                userId: userData._id
            },
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    }

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            checkAuth();
        }
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}