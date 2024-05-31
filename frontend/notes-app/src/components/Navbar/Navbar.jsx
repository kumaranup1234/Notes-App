import React, {useState} from 'react';
import ProfileInfo from "../../Cards/ProfileInfo.jsx";
import {useNavigate} from "react-router-dom";
import SearchBar from "../../SearchBar/SearchBar.jsx";
import Logo from "../../assets/notes_system_tray_icon.webp";
import { useLocation } from "react-router-dom";
import {useAuth} from "../../Context/AuthContext.jsx";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const[searchQuery, setSearchQuery] = useState("");
    const { isLoggedIn, logout } = useAuth();


    const onLogout = () => {
        localStorage.clear();
        logout();
        navigate("/login");
    }


    const handleSearch = () => {
        if (searchQuery){
            onSearchNote(searchQuery);
        }
    }

    const onClearSearch = () => {
        setSearchQuery("");
        handleClearSearch();
    }

    // Conditionally render the SearchBar component based on the current route
    const renderSearchBar = location.pathname !== '/login';

    const handleClick = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }


    return (
        <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">

            <div className="flex items-center cursor-pointer" onClick={handleClick}>
            <img src={Logo} alt="Notes Logo" className="h-7 w-7 mr-2"/>
            <h2 className="text-2xl font-medium text-black py-2">Notes</h2>
            </div>

            { renderSearchBar && (<SearchBar value={searchQuery}
                       onChange={({target}) => setSearchQuery(target.value)}
                       handleSearch={handleSearch}
                       onClearSearch={onClearSearch}
            /> )}

            <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
        </div>
    )
}

export default Navbar;