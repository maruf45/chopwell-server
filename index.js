const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = 7000 || process.env.PORT;

// Using Middleware
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use(express.json());

// Database Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJwt(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorize access" });
    }
    req.decoded = decoded;
    next();
  });
}
const database = async () => {
  try {
    const database = client.db("servicesCollection");
    const blogs = database.collection("blogs");
    const services = database.collection("services");
    const review = database.collection("review");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: "10d",
      });
      res.send({ token });
    });
    // getting blogs api from database
    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = blogs.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // getting food services api from database
    app.get("/services", async (req, res) => {
      const serviceQuery = parseInt(req.query.size);
      const query = {};
      if (serviceQuery === serviceQuery) {
        const cursor = services.find(query).limit(serviceQuery);
        const result = await cursor.toArray();
        res.send(result.reverse());
      } else {
        const cursor = services.find(query).limit(3);
        const result = await cursor.toArray();
        res.send(result.reverse());
      }
    });
    app.post("/services", async (req, res) => {
      const newServices = req.body;
      console.log(newServices);
      const result = await services.insertOne(newServices);
      res.send(result);
    });
    // specific service api
    app.get("/:service/:id", async (req, res) => {
      const serviceId = req.params.id;
      const query = { _id: ObjectId(serviceId) };
      const result = await services.findOne(query);
      res.send(result);
    });
    // post services review
    app.post("/review", async (req, res) => {
      const reviews = req.body;
      const result = await review.insertOne(reviews);
      res.send(result);
    });
    // get reviews
    app.get("/user/reviews/:id", async (req, res) => {
      const foodId = req.params.id;
      const query = { food: foodId };
      const cursor = review.find(query);
      const result = await cursor.toArray();
      res.send(result.reverse());
    });
    app.get("/my-reviews", verifyJwt, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorize access" });
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = review.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/my-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await review.deleteOne(query);
      res.send(result);
    });
    app.get("/user/update-review/:Id", async (req, res) => {
      const id = req.params.Id;
      const query = { _id: ObjectId(id) };
      const result = await review.findOne(query);
      res.send(result);
    });
    app.put("/user/profile/update/:Id", async (req, res) => {
      const id = req.params.Id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          fullName: data.fullName,
          date: data.date,
          review: data.review,
        },
      };
      const result = await review.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } catch {}
};

database().catch((error) => {
  console.log(error.message);
});

// Create API
app.get("/", (req, res) => {
  res.send(`Server is running on ${port} port`);
});

app.listen(port);
