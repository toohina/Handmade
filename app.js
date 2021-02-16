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


//home
app.get("/",(req,res)=>{
    res.render("home",{"css":"home"});
});



//products
app.get("/products",(req,res)=>{
    res.render("products",{"css":"products"});
});


//cart
app.get("/cart",(req,res)=>{
    res.render("cart",{"css":"cart"});
});

//wish
app.get("/wish",(req,res)=>{
    res.render("wish",{"css":"wish"});
});

//login customer

app.get("/login",(req,res)=>{
    res.render("login",{"css":"login"});
});

//register customer

app.get("/register",(req,res)=>{
    res.render("register",{"css":"register-login"});
});





app.listen(3000,()=>{
console.log("Listening at port");
});