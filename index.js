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
    const review = database.collection('review');
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
      }else{
          const cursor = services.find(query).limit(3);
          const result = await cursor.toArray();
          res.send(result);
      }
    });
    // specific service api 
    app.get('/:service/:id', async(req, res) =>{
        const serviceId = req.params.id;
        const query = {_id: ObjectId(serviceId)};
        const result = await services.findOne(query);
        res.send(result);
    })
    // post services review
    app.post('/review', async(req, res)=> {
      const review = req.body;
      const result = await review.insertOne(review)
      res.send(result);
    })
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
