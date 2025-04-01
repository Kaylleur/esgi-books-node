const jwt = require("jsonwebtoken");

const jwtSecretAccess = "un secret très très secret";
const jwtSecretRefresh = "un secret encore plus secret";

const User = require("../models/user");

function checkBearerToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }

    // Bearer abcdef.dfff.5555
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid Authorization format" });
    }
    jwt.verify(parts[1], jwtSecretAccess, async (err, decoded) => {

        const user = await User.findOne({ email: decoded.email });
        if(!user){
            return res.status(401).json({message: 'User not found'});
        }

        if (err) {
            // Token invalide ou expiré
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        req.user = user;

        next();
    });
}

function sendTokens(res, email) {
    const refreshToken = jwt.sign({ email }, jwtSecretRefresh, {
        expiresIn: "2d",
    });
    const accessToken = jwt.sign({ email }, jwtSecretAccess, { expiresIn: "1d" });
    return res
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // Durée de vie du cookie en ms (ici 1 jour)
        })
        .json({ accessToken });
}


module.exports = {
    checkBearerToken,
    sendTokens,
    jwtSecretRefresh,
    jwtSecretAccess
};