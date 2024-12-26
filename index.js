require("dotenv").config();
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const mongoose =require('mongoose')
const userRoutes = require("./routes/userRoutes");

const app =express()

app.use(cors());
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT =8082;

mongoose
.connect(process.env.MONGO_URI)
.then(() =>{
  console.log("database connected");
  
}).catch((err) => {
console.log(err);

})

app.get('/',(req,res) =>{
  res.send('hello world...')
})
app.post('/',(req,res) =>{
  res.send('this is a post request!')
})
app.use("/api/users", userRoutes);
app.listen(PORT,'0.0.0.0',() =>{
  console.log(`Server running at http://localhost:${PORT}`)
})
// app.listen(5000, '0.0.0.0', () => {
//   console.log('Server running on port 5000');
// });

// const http = require('node:http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });