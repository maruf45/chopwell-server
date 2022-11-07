const express = require("express");
const app = express();
const cors = require("cors");
const port = 7000 || process.env.PORT;

// Using Middleware
app.use(cors());
app.use(express.json());

// Create API
app.get("/", (req, res) => {
    res.send(`Server is running on ${port} port`);
});


app.listen(port);
