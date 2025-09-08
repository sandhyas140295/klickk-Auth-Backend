require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/auth');
require('./db'); 


const app = express();


const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_me';


// app.use(cors({
// origin: FRONTEND_ORIGIN,
// credentials: true,
// }));

app.use(cors())
app.use(express.json());
app.use(cookieParser());


app.set('trust proxy', 1);


app.use(session({
name: 'connect.sid',
secret: SESSION_SECRET,
resave: false,
saveUninitialized: false,
cookie: {
httpOnly: true,
sameSite: process.env.COOKIE_SAMESITE || 'lax',
secure: process.env.NODE_ENV === 'production', 
maxAge: 7 * 24 * 60 * 60 * 1000, 
},
}));


app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
console.log(`\nBackend running on http://localhost:${PORT}`);
console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
});