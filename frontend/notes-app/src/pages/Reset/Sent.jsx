import Navbar from "../../components/Navbar/Navbar.jsx";
import {useNavigate} from "react-router-dom";


const Sent = () => {
    const  navigate = useNavigate();

    const handleClick = () => {
        navigate("/login");
    }

    return (
        <>
            <Navbar/>
            <div className="flex items-center justify-center mt-28">
                <p>Your password has been successfully changed. Click on the button below to got to login page</p>
            </div>
            <div className="flex justify-center">
                <button type="submit" className="btn-primary w-20" onClick={handleClick}>Go Login</button>
            </div>
        </>
    );
}
export default Sent;