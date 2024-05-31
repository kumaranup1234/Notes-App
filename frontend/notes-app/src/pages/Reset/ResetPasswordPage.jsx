import React, { useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar/Navbar';
import Toast from '../../ToastMessage/Toast';
import PasswordInput from "../../components/Input/PasswordInput.jsx";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ResetPasswordPage = () => {
    const query = useQuery();
    const token = query.get('token');
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

        try {
            const response = await axiosInstance.put('/reset-password', {
                newPassword
            }, {
                params: { token } // Passing token as a query parameter
            });

            showToastMessage(response.data.message, 'edit');
            navigate("/login");


        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again';
            setError(errorMessage);
            showToastMessage(errorMessage, 'delete');
        }
    };

    if (!token) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center mt-28">
                    <div className="w-96 border rounded bg-white px-7 py-10">
                        <h4 className="text-2xl mb-7">Invalid Token</h4>
                        <p className="text-red-500">No valid token provided. Please use the link from your email.</p>
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
