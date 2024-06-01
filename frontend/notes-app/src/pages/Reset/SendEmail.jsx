
import {useEffect, useState} from "react";
import { validateEmail } from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstance.js";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Toast from "../../ToastMessage/Toast.jsx";
import {useNavigate} from "react-router-dom";
import {useResetContext} from "../../Context/ResetContext.jsx";
import Spinner from "../../components/Loading/Spinner.jsx";

const SendEmail = () => {
    const { setReset, setToken } = useResetContext();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: "",
        type: "edit"
    });

    useEffect(() => {
        if (error) {
            showToastMessage(error, "delete");
        }
    }, [error]);

    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown: true,
            message,
            type
        })
    }

    const handleCloseToast = () => {
        setShowToastMsg({
            isShown: false,
            message: ""
        })
    }

    const handleSubmitEmail = async (e) => {
        setIsLoading(true)
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email");
            showToastMessage(error);
            return;
        }

        setError("");

        try {
            const response = await axiosInstance.post("/send-email", {
                email
            });

            if (response.data && !response.data.error) {
                setShowOtpInput(true);
                setIsLoading(false);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again";
            setError(errorMessage);
            showToastMessage(errorMessage);
        }
    };

    const handleSubmitOtp = async (e) => {
        e.preventDefault();

        setError('');

        try {

            const response = await axiosInstance.post("/verify-otp",
                {
                    email: email,
                    otp: otp,
                }
            );

            if (response.data && !response.data.error) {
                setToken(response.data.token);
                setReset(true);
                navigate("/reset-password");
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again";
            setError(errorMessage);
            showToastMessage(errorMessage);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center mt-28">
                <div className="w-96 border rounded bg-white px-7 py-10">
                    {!showOtpInput ? (
                        <form onSubmit={handleSubmitEmail}>
                            <h4 className="text-2xl mb-7">Reset</h4>
                            <input
                                type="text"
                                placeholder="Email"
                                className="input-box"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit" className="btn-primary">Send Email</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitOtp}>
                            <h4 className="text-2xl mb-7">Enter OTP</h4>
                            <input
                                type="text"
                                placeholder="OTP"
                                className="input-box"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <button type="submit" className="btn-primary">Submit OTP</button>
                        </form>
                    )}
                    {isLoading && <Spinner />} {/* Show spinner while waiting for the OTP */}
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

export default SendEmail;
