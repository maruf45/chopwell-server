const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = 7000 || process.env.PORT;

// Using Middleware
app.use(cors());
app.use(express.json());

// Database Connect
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const database = async () => {
  try {

  } catch {}
};

database().catch((error) => {
  console.log(error);
});


// Create API
app.get("/", (req, res) => {
  res.send(`Server is running on ${port} port`);
});

app.listen(port);
