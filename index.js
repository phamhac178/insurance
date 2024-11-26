const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT;

const userRouter = require("./src/routes/userRouter")

app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.use("/api/user",userRouter)
app.use("/", (req,res)=>{
    res.send("hello");
})  

app.listen(PORT,()=>{
    console.log(`localhost is running at http://localhost:${PORT}`);
})

