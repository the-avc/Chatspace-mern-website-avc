import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true; // Enable cookies for refresh token

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // const [token, setToken] = useState(null); //token is stored in local storage
    const [authUser, setAuthUser] = useState(null);  //this user is the logged in user
    const [onlineUsers, setOnlineUsers] = useState([]); //array of userIds who are online
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true); //to track initial auth check

    //check if user is authenticated and set user data and connect to socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.post("/api/auth/refresh-token");
            if (data?.success) {
                // setAccessToken(data.token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                setAuthUser(data.userData);
                connectSocket(data.userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            if (authUser) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    //login func to handle socket connection on login
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data?.success) {
                // setAccessToken(data.token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
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
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error("Logout error:", error);
        }
        setAuthUser(null);
        setOnlineUsers([]);
        // setAccessToken(null);
        delete axios.defaults.headers.common["Authorization"];
        if (socket && socket?.connected) socket.disconnect();
        setSocket(null);
        toast.success("Logged out successfully");
    }

    //update profile func to update authUser state
    const updateProfile = async (formData) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", formData, {
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

        const token = axios.defaults.headers.common["Authorization"]?.split(" ")[1];
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
        axios,
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