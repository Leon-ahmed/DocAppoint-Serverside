const express = require ('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('server is fine');
})




app.listen(PORT,()=>{
    console.log('Port is 5000')
})