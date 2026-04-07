const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup API
router.post("/signup", async (req, res) => {
    console.log('🔐 Signup Request Received:', req.body);
    try {
        const { name, email, password } = req.body;
        
        console.log('🔍 Checking if user exists:', email);
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).send("User already exists");
        }
        
        console.log('🔑 Hashing password...');
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('👤 Creating new user...');
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        console.log('✅ User created successfully:', { name, email });
        res.status(201).send("User created successfully");
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).send("Error creating user");
    }
});

// Login API
router.post("/login", async (req, res) => {
    console.log('🔐 Login Request Received:', req.body);
    try {
        const { email, password } = req.body;
        
        console.log('🔍 Finding user:', email);
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).send("User not found");
        }
        
        console.log('🔑 Comparing password...');
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Invalid password for:', email);
            return res.status(400).send("Invalid credentials");
        }
        
        console.log('🎟️ Generating JWT token...');
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        const userData = { id: user._id, name: user.name, email: user.email };
        console.log('✅ Login successful:', userData);
        
        res.json({ 
            message: "Login successful", 
            token,
            user: userData
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).send("Error logging in");
    }
});

module.exports = router;
