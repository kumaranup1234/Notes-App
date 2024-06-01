import React, { useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar/Navbar';
import Toast from '../../ToastMessage/Toast';
import PasswordInput from "../../components/Input/PasswordInput.jsx";
import { useResetContext } from "../../Context/ResetContext.jsx";


const ResetPasswordPage = () => {
    const { resetPoint, otpToken, setReset, setToken } = useResetContext();

    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: '',
        type: 'edit'
    });

    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown: true,
            message,
            type
        });
    };

    const handleCloseToast = () => {
        setShowToastMsg({
            isShown: false,
            message: '',
            type: 'edit'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            const errorMessage = 'Please enter a new password';
            setError(errorMessage);
            showToastMessage(errorMessage, 'delete');
            return;
        }

        setError('');


        localStorage.setItem("token", otpToken);


        try {
            const response = await axiosInstance.put('/reset-password', {
                newPassword
            });

            showToastMessage(response.data.message, 'edit');
            setReset(false);
            setToken('');
            navigate("/done");


        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again';
            setError(errorMessage);
            showToastMessage(errorMessage, 'delete');
        }
    };

    if (!resetPoint) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center mt-28">
                    <div className="w-96 border rounded bg-white px-7 py-10">
                        <p className="text-red-500">Unauthorised access.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center mt-28">
                <div className="w-96 border rounded bg-white px-7 py-10">
                    <form onSubmit={handleSubmit}>
                        <h4 className="text-2xl mb-7">Reset Password</h4>
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="submit" className="btn-primary">Reset</button>
                    </form>
                </div>
            </div>
            <Toast
                isShown={showToastMsg.isShown}
                message={showToastMsg.message}
                type={showToastMsg.type}
                onClose={handleCloseToast}
            />
        </>
    );
};

export default ResetPasswordPage;
