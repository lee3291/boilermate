import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type UserContextType = {
    username: string;
    setUsername: (u: string) => void;
    clearUsername: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState<string>(() => {
        // optional: hydrate from localStorage
        return typeof window !== "undefined" ? localStorage.getItem("username") ?? "" : "";
    });

    useEffect(() => {
        if (username) localStorage.setItem("username", username);
        else localStorage.removeItem("username");
    }, [username]);

    const clearUsername = () => setUsername("");

    return (
        <UserContext.Provider value={{ username, setUsername, clearUsername }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside a UserProvider");
    return ctx;
};

