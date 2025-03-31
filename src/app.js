const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const jwtSecretAccess = "un secret très très secret";
const jwtSecretRefresh = "un secret encore plus secret";

const app = express();
const port = 3000;
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));