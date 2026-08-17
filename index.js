 
const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
 


const express = require ('express');
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const jose = require('jose');

const jwksUrl = new URL('/api/auth/jwks', process.env.BETTER_AUTH_URL || 'http://localhost:3000');
const JWKS = jose.createRemoteJWKSet(jwksUrl);

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




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
  let userCollection;
async function run() {
  try {
    
    await client.connect();

      const db = client.db("docappoint");  
        appointmentCollection = db.collection("bookings");
       userCollection = db.collection("user");

     app.post('/bookings', authenticateJWT, async(req,res)=>{
          const appointmentData = req.body;
          if (appointmentData.userEmail !== req.user.email) {
              return res.status(403).json({ error: "Forbidden: You cannot book an appointment for another user." });
          }
          const result= await appointmentCollection.insertOne(appointmentData);
          res.json(result);
     })




     app.get('/bookings', authenticateJWT, async(req,res)=>{
       const email = req.query.email;
       if (email !== req.user.email) {
           return res.status(403).json({ error: "Forbidden: You cannot retrieve bookings for another user." });
       }
       const result= await appointmentCollection.find({ userEmail: email }).toArray();
       res.json(result);
     })




app.patch('/bookings/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const UpdateData = req.body;

    const booking = await appointmentCollection.findOne({ _id: new ObjectId(id) });
    if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.userEmail !== req.user.email) {
        return res.status(403).json({ error: "Forbidden: You do not own this booking." });
    }

    const result = await appointmentCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: UpdateData }
    );

    res.json(result);
});




app.patch("/user/profile", authenticateJWT, async (req, res) => {
  const { currentEmail, name, email, image } = req.body;

  if (currentEmail !== req.user.email) {
      return res.status(403).json({ error: "Forbidden: You cannot edit another user's profile." });
  }

  const result = await userCollection.updateOne(
    { email: currentEmail },
    {
      $set: {
        name,
        email,
        image
      }
    }
  );

  res.json(result);
});


app.delete('/bookings/:id', authenticateJWT, async(req,res)=>{
     
   const {id}=req.params;

   const booking = await appointmentCollection.findOne({ _id: new ObjectId(id) });
   if (!booking) {
       return res.status(404).json({ error: "Booking not found" });
   }
   if (booking.userEmail !== req.user.email) {
       return res.status(403).json({ error: "Forbidden: You do not own this booking." });
   }

   const result= await appointmentCollection.deleteOne(
    {_id:new ObjectId(id),  }
   );

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