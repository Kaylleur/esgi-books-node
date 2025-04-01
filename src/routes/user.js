const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.get('/', async (req, response) => {
  const users = await User.find();
  response.json(users);
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: '"email" and "password" are required' });
  }
  const user = new User({
    email,
    password: bcrypt.hash(password, 10),
  });
  await user.save();
  return res.status(201).json(user);
})

module.exports = router;