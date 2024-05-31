import React from 'react';
import messyNotesImage from '../../assets/composition-17.png';
import logo from '../../assets/notes_system_tray_icon.webp';
import {Link} from "react-router-dom";


const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <header className="flex justify-between items-center w-full px-10 py-5 bg-white shadow-md">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="w-8 h-8 mr-2" /> {/* Logo image */}
                    <div className="text-2xl font-bold text-500">Notes</div>
                </div>
                <nav className="space-x-6">
                    <Link to="/about" className="text-gray-600 hover:text-red-500">About</Link>
                </nav>
            </header>
            <main className="flex flex-1 items-center justify-center w-full p-10 bg-white">
                <div className="max-w-lg text-left">
                    <h1 className="text-5xl font-bold mb-4 leading-tight">Forget about your messy Notes.</h1>
                    <p className="text-lg text-gray-700 mb-8">Notes is an web app developed for the ease of users</p>
                    {/* <button className="bg-red-500 text-white px-6 py-3 text-lg rounded hover:bg-red-600">Try now</button> */}
                    <Link to="/login" className="bg-red-500 text-white px-6 py-3 text-lg rounded hover:bg-red-600">Try now</Link>
                </div>
                <div className="ml-10">
                    <img src={messyNotesImage} alt="Messy notes illustration" className="max-w-full h-auto rounded-lg shadow-lg" />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
