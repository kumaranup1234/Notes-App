import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import HomePage from "./pages/Home/HomePage.jsx";
import About from "./pages/About/About.jsx";
import SendEmail from "./pages/Reset/SendEmail.jsx";
import ResetPasswordPage from "./pages/Reset/ResetPasswordPage.jsx";
import Sent from "./pages/Reset/Sent.jsx";
import {useAuth, AuthProvider} from "./Context/AuthContext.jsx";


const ProtectedRoute = ({ element }) => {
    const { isLoggedIn, isLoading } = useAuth();
    if (!isLoading){
        return isLoggedIn ? element : <Navigate to="/login" />;
    }
};

const routes = (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Home />} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset" element={<SendEmail />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/sent" element={<Sent />} />
        </Routes>
    </Router>
);

const App = () => {

    return(
        <AuthProvider>
        <div>
            {routes}
        </div>
        </AuthProvider>
    )
}
export default App
