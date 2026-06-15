 
const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
 


const express = require ('express');
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();


app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');




const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000; ;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

 let appointmentCollection;
async function run() {
  try {
    
    await client.connect();

      const db = client.db("docappoint");  
        appointmentCollection = db.collection("bookings");


     app.post('/bookings',async(req,res)=>{
          const appointmentData = req.body
         const result= await appointmentCollection.insertOne(appointmentData)
           res.json(result)
     })




     app.get('/bookings',async(req,res)=>{
      const result= await appointmentCollection.find().toArray();
      res.json(result);
     })







    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");






  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send('server is fine. Welcome');
})




app.listen(PORT,()=>{
    console.log('Port is 5000')
})