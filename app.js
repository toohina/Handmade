require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const nodemailer = require("nodemailer");
const {generateOtp}=require("./generate-otp");
const mongoose=require("mongoose");

const app=express();

mongoose.connect("mongodb://localhost:27017/handmadeDB",{useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false });

const productSchema=new mongoose.Schema({
    name:String,
    price:Number,
    imgUrl:String,
    category:String  //bookmark, card, decor
});

const cartItemSchema=new mongoose.Schema({
    product_info:productSchema,
    qty:Number
})

const customerSchema=new mongoose.Schema({
    email:String,
    password:String,
    cart:[cartItemSchema],
    wish:[productSchema]
});

const Product=mongoose.model("Product",productSchema);
const Customer=mongoose.model("Customer",customerSchema);

//middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

//ROUTES


//home
app.get("/",(req,res)=>{
    res.render("home",{"css":"home"});
});



//products
app.get("/bookmark",(req,res)=>{
    Product.find({category:"bookmark"},(err,bookmarks)=>{
         res.render("products",{css:"products",products:bookmarks});
    });
});

app.get("/card",(req,res)=>{
    Product.find({category:"card"},(err,cards)=>{
        res.render("products",{css:"products",products:cards});
    });
});

app.get("/decor",(req,res)=>{
    Product.find({category:"decor"},(err,decors)=>{
        res.render("products",{css:"products",products:decors});
    });
});


////////////////////////////////////////////////////////cart///////////////////////////////////////////////////
let unregisteredUserCartProducts=[];
let qty=[];
app.get("/cart",(req,res)=>{
    //if user is registered


    //else
   
    res.render("cart",{css:"cart",products:unregisteredUserCartProducts,qty:qty});
});
app.post("/addToCart",(req,res)=>{
    // if user is registered


    //else
   
    Product.findOne({"_id":req.body.productId},(err,product)=>{
        let k=0;
        if(unregisteredUserCartProducts.length!=0){
            for(var i=0;i<unregisteredUserCartProducts.length;i++){
                if(JSON.stringify(unregisteredUserCartProducts[i])===JSON.stringify(product)){
                    qty[i]=qty[i]+1;
                    k=1;
                    break;
                }
            }
            if(k===0){
                qty.push(1);
                unregisteredUserCartProducts.push(product);
            }
        }else{
            qty.push(1);
            unregisteredUserCartProducts.push(product);
        }
        
        

        res.redirect("/"+product.category);
    });  
});

app.post("/changeQty",(req,res)=>{
    console.log(req.body);
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




//ADMIN
app.get("/admin",(req,res)=>{
    res.render("admin-login");
});
app.post("/admin",(req,res)=>{
    if(req.body.email==="toohi2000@gmail.com"&&req.body.password==="secretsilver")
    {
        res.redirect("/admin/addProducts");
    }
});

app.get("/admin/addProducts",(req,res)=>{
    res.render("admin-addProducts");
});
app.post("/admin/addProducts",(req,res)=>{
   Product.create({
        name:req.body.name,
        price:Number(req.body.price),
        imgUrl:req.body.imgUrl,
        category:req.body.category
     });
});

app.post("/admin/logout",(req,res)=>{
    res.redirect("/admin");
});

//listening on port 
app.listen(3000,()=>{
console.log("Listening at port");
});