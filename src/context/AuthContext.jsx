import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

// Step 1: Ek khaali "context" banaya — ye khud khaali box hai
const AuthContext = createContext();

// Step 2: Ek "Provider" component banaya — ye box ko bharega aur poore app ko dega
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // App khulte hi check karo — kya pehle se koi logged in hai (cookie se)
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const data = await authService.getCurrentUser();
                setUser(data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Login function — poore app se call hoga
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user);
        return data;
    };

    // Logout function
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Step 3: Ek chhota custom hook — taaki baar baar useContext(AuthContext) na likhna pade
export const useAuth = () => {
    return useContext(AuthContext);
};