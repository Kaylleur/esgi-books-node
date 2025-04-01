
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user");
const {sendTokens, jwtSecretRefresh} = require("../utils/auth");


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: '"email" and "password" are required' });
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if(!await bcrypt.compare(password, user.password)){
    return res.status(401).json({ message: "Invalid credentials" });
  }
  sendTokens(res, email);
});


router.get("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "refreshToken manquant" });
  }

  jwt.verify(refreshToken, jwtSecretRefresh, (err, decoded) => {
    if (err) {
      // Token invalide ou expiré
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    sendTokens(res, decoded.email);
  });
});

module.exports = router;