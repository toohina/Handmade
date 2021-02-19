require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const nodemailer = require("nodemailer");
const {generateOtp}=require("./generate-otp");

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
app.get("/bookmarks",(req,res)=>{
    res.render("products",{"css":"products"});
});

app.get("/cards",(req,res)=>{
    res.render("products",{"css":"products"});
});

app.get("/decor",(req,res)=>{
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
    res.render("login",{"css":"register-login"});
});

//register customer

app.get("/register",(req,res)=>{
    res.render("register",{"css":"register-login"});
});


//verify-email

var otp;
app.get("/verify-email",(req,res)=>{
     
        otp=generateOtp();
    
         //simple message transfer protocol
         // Generate test SMTP service account from ethereal.email
         // Only needed if you don't have a real mail account for testing
       
         // create reusable transporter object using the default SMTP transport
         let transporter = nodemailer.createTransport({
             service:'gmail',
             auth: {
               user: 'btoohina@gmail.com', // generated ethereal user
               pass: 'randompassword123', // generated ethereal password
             },
             tls:{
                 rejectUnauthorized:false
             }
           });
         
           // send mail with defined transport object
           transporter.sendMail({
             from: '"Handmade" <btoohina@gmail.com>', // sender address
             to: "toohi2000@gmail.com", // list of receivers
             subject: "OTP", // Subject line
             text: otp, // plain text body
           });
            
           var makeOtpInvalid=setTimeout(function(){otp=""},90000);
           makeOtpInvalid.unref();// Node won't wait for this timeout to complete if it needs to exit earlier.

    res.render("verify-email",{"css":"verify"});
});


app.post("/verify-email",(req,res)=>{
 
    if(otp===req.body.otp){
        console.log("Email Verified.")
    }else{
        console.log("Wrong OTP");
    }

});



//listening on port 
app.listen(3000,()=>{
console.log("Listening at port");
});