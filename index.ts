const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

const app = express();
const PORT = process.env.PORT || 5000;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unknown error occurred";
}

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
   // await client.connect();
    const db = client.db("e-commerce");
    const productCollection = db.collection("products");
    const bookingCollection = db.collection("bookings");
    const usersCollection = client.db("e-commerce").collection("users");

    app.get("/user/:email", async (req: any, res: any) => {
      try {
        const email = req.params.email;

        const user = await usersCollection.findOne({
          email,
        });

        res.send(user);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: getErrorMessage(error),
        });
      }
    });

    app.patch("/user/:email", async (req: any, res: any) => {
      try {
        console.log("PATCH HIT");
        console.log(req.params.email);
        console.log(req.body);

        const result = await usersCollection.updateOne({ email: req.params.email },
          {
    $set: req.body,
  }
        );

        console.log(result);

        return res.status(200).json({
          success: true,
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: getErrorMessage(error),
        });
      }
    });

    app.get("/featured", async (req: any, res: any) => {
      const result = await productCollection.find().limit(4).toArray();
      res.json(result);
    });

    app.get("/products", async (req: any, res: any) => {
      const result = await productCollection.find().toArray();
      res.json(result);
    });

    app.post("/products", async (req: any, res: any) => {
      const productData = req.body;
      console.log(productData);
      const result = await productCollection.insertOne(productData);
      res.json(result);
    });

    app.get("/products/:id", async (req: any, res: any) => {
      const { id } = req.params;
      const result = await productCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    app.patch("/products/:id", async (req: any, res: any) => {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(updatedData);

      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );

      res.json(result);
    });

    app.delete("/products/:id", async (req: any, res: any) => {
      const { id } = req.params;
      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    app.post("/booking", async (req: any, res: any) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);

      res.json(result);
    });

    app.get("/booking/:userId", async (req: any, res: any) => {
      const { userId } = req.params;

      const result = await bookingCollection.find({ userId: userId }).toArray();

      res.json(result);
    });

    app.delete("/booking/:bookingId", async (req: any, res: any) => {
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(bookingId),
      });

      res.json(result);
    });

    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req: any, res: any) => {
  res.send("Server is running fine!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});