import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from "../utils/axiosInstance.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setIsLoading(false); // Update loading state
                return;
            }

            try {
                const response = await axiosInstance.get('/validate-token', {
                    params: { token }
                });

                console.log(response.data);

                if (response.data.error === false) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false); // Update loading state
            }
        };

        validateToken();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
