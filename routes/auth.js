const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');


const router = express.Router();


const normalizeEmail = (email) => String(email || '').trim().toLowerCase();


// POST /api/auth/register
router.post('/register', (req, res) => {
const { email, password } = req.body;
const e = normalizeEmail(email);


if (!e || !password) return res.status(400).json({ error: 'Email and password are required' });
if (!/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: 'Invalid email format' });
if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });


db.get('SELECT id FROM users WHERE email = ?', [e], async (err, row) => {
if (err) return res.status(500).json({ error: 'Database error' });
if (row) return res.status(409).json({ error: 'Email already registered' });


try {
const hash = await bcrypt.hash(password, 10);
db.run('INSERT INTO users (email, password) VALUES (?, ?)', [e, hash], function (err2) {
if (err2) return res.status(500).json({ error: 'Failed to create user' });
return res.status(201).json({ message: 'Registered successfully' });
});
} catch (e) {
return res.status(500).json({ error: 'Server error' });
}
});
});


// POST /api/auth/login
router.post('/login', (req, res) => {
const { email, password } = req.body;
const e = normalizeEmail(email);
if (!e || !password) return res.status(400).json({ error: 'Email and password are required' });


db.get('SELECT id, email, password FROM users WHERE email = ?', [e], async (err, user) => {
if (err) return res.status(500).json({ error: 'Database error' });
if (!user) return res.status(401).json({ error: 'Invalid credentials' });


try {
const ok = await bcrypt.compare(password, user.password);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });


req.session.user = { id: user.id, email: user.email };
return res.json({ message: 'Logged in', user: req.session.user });
} catch (e) {
return res.status(500).json({ error: 'Server error' });
}
});
});


// POST /api/auth/logout
router.post('/logout', (req, res) => {
req.session.destroy((err) => {
if (err) return res.status(500).json({ error: 'Failed to logout' });
res.clearCookie('connect.sid');
return res.json({ message: 'Logged out' });
});
});


// GET /api/auth/me
router.get('/me', (req, res) => {
if (req.session.user) return res.json({ user: req.session.user });
return res.status(401).json({ user: null });
});


// Simple auth middleware
function ensureAuth(req, res, next) {
if (req.session.user) return next();
return res.status(401).json({ error: 'Unauthorized' });
}


// GET /api/auth/protected
router.get('/protected', ensureAuth, (req, res) => {
res.json({ message: 'You are authenticated', user: req.session.user });
});


module.exports = router;