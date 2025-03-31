const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const app = express();
const port = 3000;
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const authRoutes = require('./routes/auth');
app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/auth', authRoutes)


app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`)
});

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/booksDatabase')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection error:', err));
