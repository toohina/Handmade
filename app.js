require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");

const app=express();


//middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

//routes
app.get("/",(req,res)=>{
 res.render("home");
});





app.listen(3000,()=>{
console.log("Listening at port");
});