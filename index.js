require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db/connectDB");
const router = require("./router/route");


const app = express();
const port = 2000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors());

app.get("/" , (req , res) => res.status(200).json({
    message : "Hello From Travo server"
}))

app.use("/v1" , router);

const start = async () => {
    try {
        await connectDB()
        app.listen(port , () => {
            console.log(`Server is running on http://localhost:${port}`)
        })
    } catch (error) {
        console.log(error);
    }
}

start();