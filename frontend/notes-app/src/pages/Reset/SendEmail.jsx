// SendEmail.jsx
import {useEffect, useState} from "react";
import { validateEmail } from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstance.js";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Toast from "../../ToastMessage/Toast.jsx";
import {useNavigate} from "react-router-dom";

const SendEmail = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email");
            showToastMessage(error);
            return;
        }

        setError("");

        try {
            const response = await axiosInstance.post("/send-email", { email });

            if (response.data && !response.data.error){

                navigate("/sent");
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
                    <form onSubmit={handleSubmit}>
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
