import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]); //all messages with selected user
    const [users, setUsers] = useState([]); //all users except logged in user
    const [selectedUser, setSelectedUser] = useState(null); //this user is the one we are chatting with
    const [unseenMessages, setUnseenMessages] = useState({}); //object with userId as key and number of unseen msgs as value

    const { socket, axios } = useContext(AuthContext);

    //func to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data?.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMsgs);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    //func to get all messages with selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data?.success) {
                setMessages(data.messages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    //func to send message to selected user
    const sendMessage = async (msgData) => {
        try {
            // axios automatically detects FormData and sets proper headers
            // No need for manual config - axios handles both JSON and FormData
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, msgData);
            if (data?.success) {
                setMessages(prev => [...prev, data.newMessage]);
            } else {
                toast.error(data.message || "Failed to send message");
            }

        } catch (error) {
            console.error("Send message error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
            toast.error(errorMessage);
        }
    }

    // define the event handler
    const handleNewMessage = (newMessage) => {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages((prev) => [...prev, newMessage]);
            axios.put(`/api/messages/seen/${newMessage._id}`);
        } else {
            setUnseenMessages((prev) => ({
                ...prev,
                [newMessage.senderId]: prev[newMessage.senderId]
                    ? prev[newMessage.senderId] + 1
                    : 1,
            }));
        }
    };

    useEffect(() => {
        if (!socket) return;
        // subscribe
        socket.on("newMessage", handleNewMessage);

        // unsubscribe when component unmounts OR deps change
        return () => {
            socket.off("newMessage", handleNewMessage);
        };

    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
    }
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}