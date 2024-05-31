const jwt = require("jsonwebtoken");
const { createTransport } = require("nodemailer");
const rateLimit = require("express-rate-limit");

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied: No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ message: "Access denied: Invalid token" });
        }
        req.user = user;
        next();
    });
}


const sendPasswordResetEmail = async (username, token) => {
    try {
        // Construct the password reset URL with the token embedded
        const resetUrl = `https://deploy-notes-api.vercel.app/reset-password?token=${token}`;

        // Configure transporter with SMTP settings
        const transporter = createTransport({
            host: 'us2.smtp.mailhostbox.com',
            port: 587, // Use 587 or 25 based on your preference
            auth: {
                user: process.env.USER, // Replace with your email address
                pass: process.env.PASSWORD // Replace with your email password
            }
        });

        const mailOptions = {
            from: process.env.USER, // Replace with your email address
            to: username,
            subject: 'Password Reset',
            html: `
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        throw error;
    }
}

// Call the function with appropriate username and token



// Rate limiter for sensitive operations
const sensitiveOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per windowMs
    handler: function (req, res) {
        res.status(429).json({
            message: "Too many requests, please try again later.",
        });
    },
});

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per windowMs
    handler: function (req, res) {
        res.status(429).json({
            message: "Too many requests, please try again later.",
        });
    },
});

module.exports = {
    authenticateToken,
    sendPasswordResetEmail,
    sensitiveOperationLimiter,
    loginLimiter
};
