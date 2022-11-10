const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = 7000 || process.env.PORT;

// Using Middleware
app.use(cors());
app.use(express.json());

// Database Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const database = async () => {
  try {
    const database = client.db("servicesCollection");
    const blogs = database.collection("blogs");
    const services = database.collection("services");
    const review = database.collection("review");
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
      if (serviceQuery <= 6) {
        const cursor = services.find(query).limit(serviceQuery);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        const cursor = services.find(query).limit(3);
        const result = await cursor.toArray();
        res.send(result);
      }
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
      res.send(result);
    });
    app.get("/my-reviews", async (req, res) => {
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
      res.send(result)
    });
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
