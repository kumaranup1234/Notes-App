import React, { createContext, useState, useContext } from 'react';

const ResetContext = createContext();

export const useResetContext = () => useContext(ResetContext);

export const ResetProvider = ({ children }) => {
    const [resetPoint, setResetPoint] = useState(null); // Initialize reset point state
    const [otpToken, setOtpToken] = useState(null); // Initialize OTP token state

    const setReset = (reset) => setResetPoint(reset); // Function to update reset point
    const setToken = (token) => setOtpToken(token); // Function to update OTP token

    return (
        <ResetContext.Provider value={{ resetPoint, otpToken, setReset, setToken }}>
            {children}
        </ResetContext.Provider>
    )
}

