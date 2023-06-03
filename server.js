const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config()
const { readdirSync } = require("fs");
const mongoose = require('mongoose')

const PORT = process.env.PORT || 8000;

app.use(express.json())
app.use(cors());

// routes
readdirSync("./routes").map((route) => app.use("/", require(`./routes/${route}`)));

// database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
}).then(() => console.log('db connection successful'))
.catch((error) => console.log('connection to db failed', error))

app.listen(PORT, () => console.log(`server is listening on port ${PORT}`));
