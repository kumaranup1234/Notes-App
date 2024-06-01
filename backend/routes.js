const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const otplib = require('otplib');
const jwt = require("jsonwebtoken");
const { getConnectedClient } = require("./database");
const { ObjectId } = require("mongodb");
const { authenticateToken, loginLimiter, sendPasswordResetEmail, sensitiveOperationLimiter} = require("./utilities");


const generateOTP = () => {
    return otplib.authenticator.generate(process.env.OTP_SECRET);
};


// POST /create-account
router.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: true, message: "Full Name is required" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }

    try {
        const client = getConnectedClient();
        const usersCollection = client.db("notesdb").collection("users");

        const isUser = await usersCollection.findOne({ email });

        if (isUser) {
            return res.status(400).json({ error: true, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Await the hash operation

        const user = await usersCollection.insertOne({
            fullName,
            email,
            password : hashedPassword,
            createdOn: Date.now()
        });

        const accessToken = jwt.sign({ userId: user.insertedId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "300m"
        });

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Account created successfully."
        });
    } catch (error) {
        console.error("Error occurred during account creation:", error);
        res.status(500).json({
            error: true,
            message: "Error occurred during account creation"
        });
    }
});

// POST /login
router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = getConnectedClient();
        const usersCollection = client.db("notesdb").collection("users");
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User do not exist!" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password); // Compare with hashedPassword

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10h" });

        res.status(200).json({
            error: false,
            message: "Login Successful",
            email,
            token
        });
    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({
            error: true,
            msg: "Error occurred during login"
        });
    }
});

// Post // send email

router.post("/send-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        console.error("No email provided in the request body.");
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    try {
        console.log(`Received request to send password reset email to: ${email}`);
        const client = await getConnectedClient();
        const usersCollection = client.db("notesdb").collection("users");

        const user = await usersCollection.findOne({ email });

        if (!user) {
            console.warn(`No user found with email: ${email}`);
            return res.status(401).json({ error: true, message: "User doesn't exist" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        const updateResult = await usersCollection.updateOne(
            { email },
            { $set: { otp, otpExpires } }
        );

        console.log(`OTP generated and expiry set for user: ${email}`);

        await sendPasswordResetEmail(email, otp);

        console.log(`Password reset email sent to: ${email}`);

        res.status(200).json({
            error: false,
            message: "Password reset email sent"
        });
    } catch (error) {
        console.error("Error occurred during password reset:", error);
        res.status(500).json({
            error: true,
            message: {error}
        });
    }
});


// POST /verify-otp

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const client = getConnectedClient();
        const usersCollection = client.db("notesdb").collection("users");

        const user = await usersCollection.findOne({email});
        //const isValid = otplib.authenticator.check(otp, process.env.OTP_SECRET);
        //console.log(isValid)
        console.log(otp);

        if (!user  || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({
                error: true,
                message: 'Invalid or expired OTP'
            });
        }

        // Clear OTP from database
        await usersCollection.updateOne(
            {email},
            {$unset: {otp: "", otpExpires: ""}}
        );

        console.log(user._id);

        // Generate JWT with user's ObjectId
        const token = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});

        console.log(token);
        res.status(200).json({
            error: false,
            token
        });

    } catch (error){
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error' });
    }

})

// Put /reset-password
router.put('/reset-password', async (req, res) => {
    const { newPassword } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];


    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const { userId } = decoded;

        const client = getConnectedClient();
        const usersCollection = client.db("notesdb").collection("users");

        // Find the user by the token
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({
            error: false,
            message: 'Password reset done' });
    } catch (error) {
        console.error('Error occurred while resetting password:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error' });
    }
});

// GET //validate-token

router.get('/validate-token', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded || !decoded.userId) {
            throw new Error('Invalid token data');
        }

        res.status(200).json({
            error: false,
            message: 'Token is valid',
        });
    } catch (err) {
        console.error('Token verification failed:', err);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: 'Token has expired',
            });
        }

        res.status(401).json({
            error: true,
            message: 'Token is not valid',
        });
    }
});

// GET /get-user

router.get("/get-user", authenticateToken, async (req, res) => {
    const user = req.user;

    const client = getConnectedClient();
    const userCollection = client.db("notesdb").collection("users");
    const id = new ObjectId(user.userId)

    const isUser = await userCollection.findOne({_id: id});

    if(!isUser){
        return res.status(401);
    }

    return res.json({
        user: {fullName: isUser.fullName, email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn},
        message: ""
    })

})



// POST // Add Note

router.post("/add-note", authenticateToken, async (req, res) => {

    const { title, content, tags } = req.body;
    const user = req.user;

    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }
    if (!content){
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try {
        const note = await noteCollection.insertOne({
            title: title,
            content: content,
            tags: tags || [],
            isPinned: false,
            userId: user.userId,
            createdOn: Date.now()
        })

        const insertedNote = await noteCollection.findOne({ _id: note.insertedId });

        return res.json({
            error: false,
            note: insertedNote,
            message: "Note added successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        })
    }
})

// GET // get-all-notes

router.get('/get-all-notes', authenticateToken, async (req, res) => {
    const user = req.user;

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try{
        const notes = await noteCollection.find({userId: user.userId}).toArray();
        // Correctly sort notes by isPinned property
        notes.sort((a, b) => {
            if (a.isPinned === b.isPinned) {
                return 0; // No change in order
            } else if (a.isPinned) {
                return -1; // a comes before b
            } else {
                return 1; // b comes before a
            }
        });

        return res.json({
            error: false,
            notes,
            message: "All notes retrieved successfully"
        })
    } catch (error){
        console.log(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        })
    }
})

// PUT //edit-note

router.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = new ObjectId(req.params.noteId);
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;

    // Ensure at least one field to update is provided
    if (!title && !content && !tags && isPinned === undefined) {
        return res.status(400).json({ error: true, message: "No changes provided" });
    }

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try {
        // Find the note to ensure it exists and belongs to the user
        const note = await noteCollection.findOne({ _id: noteId, userId: user.userId });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        // Create an object with the fields to update
        const updateFields = {};
        if (title) updateFields.title = title;
        if (content) updateFields.content = content;
        if (tags) updateFields.tags = tags;
        if (isPinned !== undefined) updateFields.isPinned = isPinned;

        // Update the note
        await noteCollection.updateOne({ _id: noteId }, { $set: updateFields });

        // Fetch the updated note
        const updatedNote = await noteCollection.findOne({ _id: noteId });

        return res.json({
            error: false,
            note: updatedNote,
            message: "Note updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

// DELETE //delete-note

router.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = new ObjectId(req.params.noteId);
    const user = req.user;

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try{
        const note = await noteCollection.findOne({_id: noteId, userId: user.userId});
        if (!note) {
            return res.status(400).json({
                error: true,
                message: "No notes found"
            })
        }

        await noteCollection.deleteOne({_id: noteId, userId: user.userId})

        return res.json({
            error: false,
            message: "Note deleted successfully"
        })
    } catch (error){
        console.log(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
})


// PUT //Update pinned value

router.put("/update-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = new ObjectId(req.params.noteId);
    const { isPinned } = req.body; // Destructure isPinned from req.body
    const user = req.user;

    if (typeof isPinned !== 'boolean') {
        return res.status(400).json({ error: true, message: "Invalid value for isPinned" });
    }

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try {
        // Find the note to ensure it exists and belongs to the user
        const note = await noteCollection.findOne({ _id: noteId, userId: user.userId });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        // Update the note's isPinned field
        await noteCollection.updateOne({ _id: noteId }, { $set: { isPinned: isPinned } });

        // Fetch the updated note
        const updatedNote = await noteCollection.findOne({ _id: noteId });

        return res.json({
            error: false,
            note: updatedNote,
            message: "Note updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

// GET /search-notes

router.get("/search-notes", authenticateToken, async (req, res) => {
    const user = req.user;
    const { query } = req.query;

    // console.log("Received query:", query);

    if (!query) {
        return res.status(400).json({
            error: true,
            message: "Search query is required"
        });
    }

    const client = getConnectedClient();
    const noteCollection = client.db("notesdb").collection("notes");

    try {
        const regex = new RegExp(query, "i");  // Create a case-insensitive regex
        // console.log("Regex:", regex);

        const matchingNotes = await noteCollection.find({
            userId: user.userId,
            $or: [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
            ],
        }).toArray();

        // console.log("Matching Notes:", matchingNotes); // Debug: Log the matching notes

        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        });
    } catch (error) {
        // console.error("Error:", error); // Debug: Log any errors

        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});



module.exports = router;
