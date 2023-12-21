require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7apvnd5.mongodb.net/?retryWrites=true&w=majority`;

// console.log(process.env.DB_USER, process.env.DB_PASS);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db = client.db('movieworld');
    const userCollection = db.collection('users');
    const moviesCollection = db.collection('movies');


    // api to save a new user
    app.post("/save_users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // api to show all users
    app.get("/show_users", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });


    // api to add a user as admin
    app.put("/makeAdminUser/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin"
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });


    // check a user is admin or not
    app.get("/adminUser/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });


    // api to save a new movie
    app.post("/save_movies", async (req, res) => {
      const blog = req.body;
      const result = await moviesCollection.insertOne(blog);
      res.send(result);
    });

    // api to show all movies
    app.get("/show_movies", async (req, res) => {
      const query = {};
      const cursor = moviesCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
    });


    // api to approve a blog
    app.put("/makeApproveBlog/:id", async (req, res) => {
      const blogId = req.params.id;
      const filter = { _id: ObjectId(blogId) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "approve",
        },
      };
      const result = await moviesCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });


    // show a movie details by its id
    app.get('/movieDetails/:id', async (req, res) => {
      const id = req.params.id;

      const result = await moviesCollection.findOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });

    // delete a movie
    app.delete('/deleteMovies/:id', async (req, res) => {
      const id = req.params.id;

      const result = await moviesCollection.deleteOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });


    // show a certain user added movies
    app.get("/myPostedMovies", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          bloggerEmail: req.query.email,
        };
      }
      const cursor = moviesCollection.find(query).sort({ postDate: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('MovieWorld Server is Running.....');
});

app.listen(port, () => {
  console.log(`MovieWorld server app listening on port ${port}`);
});