import { createContext, useContext, useEffect, useState } from "react";
import { toggleAI } from "../src/lib/ai";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const AiContext = createContext(null);

export const AiProvider = ({ children }) => {
    const { axios, socket } = useContext(AuthContext);
    // Any AI-related state or functions can be added here in the future
    const [aiEnabled, setAiEnabled] = useState(true);

    useEffect(() => {
        if (!socket) return;
        //listen for aiStatus event from server
        socket.on('aiStatusChanged', (status) => {
            setAiEnabled(status);
            toast.success(`AI is now ${status ? 'enabled' : 'disabled'}`);
        })
        return () => {
            socket.off('aiStatus');
        }
    }, [socket]);
    //function to toggle aiEnabled state on server
    const handleToggleAi = async () => {
        try {
            const newStatus = await toggleAI(axios, !aiEnabled);
            if (typeof newStatus === 'boolean') {
                setAiEnabled(newStatus);
            } else {
                toast.error('Failed to toggle AI status');
            }
        } catch (error) {
            toast.error('Error toggling AI status');
            console.error("Error toggling AI status:", error);
        }
    }
    const value = {
        aiEnabled,
        setAiEnabled,
        handleToggleAi
    };

    return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}