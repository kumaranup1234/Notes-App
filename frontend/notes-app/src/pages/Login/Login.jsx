import Navbar from '../../components/Navbar/Navbar'
import {Link, useNavigate} from 'react-router-dom'
import PasswordInput from "../../components/Input/PasswordInput.jsx";
import {useState} from "react";
import {validateEmail} from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstance.js";
import {useAuth} from "../../Context/AuthContext.jsx";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    let timeoutId;
    const { login } = useAuth();


    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email");
            return;
        }

        if (!password) {
            setError("Please enter a password");
            return;
        }
        setError("");

        // Login API Call

        try {
            const response = await axiosInstance.post("/login", {
                email: email,
                password: password,
            });


            if (response.data && response.data.token) {
                login(response.data.token);
                navigate('/dashboard');
            }

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again");
            }
        }
    };

    // Delayed error message rendering
    clearTimeout(timeoutId);
    setTimeout(() => {
        timeoutId = setError(null);
    }, 3000);


    return <>
        <Navbar />
        <div className="flex items-center justify-center mt-28">
            <div className="w-96 border rounded bg-white px-7 py-10">
                <form onSubmit={handleLogin}>

                    <h4 className="text-2xl mb-7">Login</h4>
                    <input
                        type="text"
                        placeholder="Email"
                        className="input-box"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Link to="/reset" className="font-medium text-xs text-primary ">Forget password?</Link>
                    {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
                    <button type="submit" className="btn-primary">Login</button>

                    <p className="text-sm text-center mt-4">
                        Not registered yet?{""}
                        <Link to="/signup" className="font-medium text-primary underline">Create an Account</Link>
                    </p>
                </form>
            </div>
        </div>
    </>
}

export default Login