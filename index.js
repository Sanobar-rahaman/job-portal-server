const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const  app = express()
const port = process.env.PORT ||5001;

//middlewere
app.use(cors())
app.use(express.json())

//mongodb
// jobHunting
// NFRnwPnadMru8FYB



const uri = "mongodb+srv://jobHunting:NFRnwPnadMru8FYB@cluster0.6q5hueg.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection  = client.db('jobDb').collection('alljob')

    // for add jobs
    app.post('/alljobs',async(req,res)=>{
         const newJobs = req.body 
        
         const result = await jobCollection.insertOne(newJobs)
         res.send(result)
    })
    app.get('alljobs',async(req,res)=>{
        const cursor  = jobCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send(' job Hunting successfully loded')

})
app.listen(port,()=>{
    console.log(` job Hunting serrver is running on port:${port}`);
})