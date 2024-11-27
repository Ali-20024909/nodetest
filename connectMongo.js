// Load environment variables from .env file
require('dotenv').config();

// Construct the MongoDB connection URI using the environment variable
const uri = `mongodb+srv://Ali:${process.env.MONGO_DB_PASSWORD}@cluster0.jm7tn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Import MongoDB client and API version
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient instance with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the MongoDB server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("An error occurred while connecting to MongoDB:", error);
  } finally {
    // Close the client connection
    await client.close();
  }
}

// Run the function and catch any errors
run().catch(console.dir);
