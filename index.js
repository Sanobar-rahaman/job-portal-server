const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const  app = express()
const port = process.env.PORT ||5001;

//middlewere
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

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
const verifyToken = async(req,res,next)=>{
    const token = req.cookies?.token;
    console.log('value of token in middlewere',token);
    if(!token){
        return res.status(401).send({message:'not authorized'})
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).send({message: 'unauthorized'})
        }
        console.log('value of token',decoded);
        req.user = decoded
        next()
    })
   
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection  = client.db('jobDb').collection('alljob')
    const applyCollection  = client.db('jobDb').collection('apply')

    // auth or jwt related api
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token  = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
        // console.log(token);

        res.cookie('token',token,{
            httpOnly:true,
            // secure:false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            // sameSite: 'strict'
            
        })
        .send({success:true})
    })
    app.post('/logout',async(req,res)=>{
        const user = req.body;
        // console.log('logIn out',user);
        res.clearCookie('token',{maxAge:0}).send({success:true})
    })


    // for add jobs
    app.post('/alljobs',async(req,res)=>{
         const newJobs = req.body 
         const result = await jobCollection.insertOne(newJobs)
         res.send(result)
    })
    app.get('/alljobs',async(req,res)=>{
        const cursor = jobCollection.find()
        const result = await cursor.toArray()
        res.send(result);
      })
    //   for  specific  job
    app.get('/job/:job_title',async(req,res)=>{
        const cursor = jobCollection.find({job_title:req.params.job_title})
        const result = await cursor.toArray()
        res.send(result);
      })
      //details related api
      app.get('/detailjob/:id',async(req,res)=>{
        const id = req.params.id
        
        const query  = {_id : new ObjectId(id)}
        const result = await  jobCollection.findOne(query)
        res.send(result);
      })
    //   apply related api
    app.post('/applyjob',async(req,res)=>{
        const newJobs = req.body 
        const result = await applyCollection.insertOne(newJobs)
        res.send(result)
   })
//    show the applyed job to apply jobs
   app.get('/applyjob',verifyToken,async(req,res)=>{
    const cursor = applyCollection.find()
    const result = await cursor.toArray()
    res.send(result);
  })
  app.delete('/deletejob/:id',async(req,res)=>{
    const id = req.params.id
    // console.log(id);
    const query = {_id : new  ObjectId(id)}
    const result = await applyCollection.deleteOne(query)
    res.send(result);
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