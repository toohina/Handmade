require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const nodemailer = require("nodemailer");
const {generateOtp}=require("./generate-otp");
//const {getSum}=require("./get-sum");
const mongoose=require("mongoose");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app=express();

const YOUR_DOMAIN = 'https://fierce-mesa-16226.herokuapp.com';

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
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");

//ROUTES


//register customer

app.get("/register",(req,res)=>{
    res.render("register",{"css":"register-login"});
});

app.post("/register",(req,res)=>{

});


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
let total=0;

let unregisteredUserWishlistProducts=[];

app.get("/cart",(req,res)=>{
    //if user is registered


    //else 
    sum=0;
    for(var i=0;i<unregisteredUserCartProducts.length;i++){
        sum+=unregisteredUserCartProducts[i].price*qty[i];
    }
    total=sum;
    res.render("cart",{css:"cart",products:unregisteredUserCartProducts,qty:qty,total:total});
});

app.post("/addToCart",(req,res)=>{
    // if user is registered


    //else
   
    Product.findOne({"_id":req.body.productId},(err,product)=>{
        let k=0;
        if(unregisteredUserCartProducts.length!=0){
            for(var i=0;i<unregisteredUserCartProducts.length;i++){
                if(JSON.stringify(unregisteredUserCartProducts[i])===JSON.stringify(product)){
                    qty[i]=Number(qty[i])+1;
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
        res.status(204).send();  //////////vvi
    });
});

app.post("/changeQty",(req,res)=>{
    //if registered



    //else
    qty[req.body.index]=req.body.qty;

    //res.status(204).send();
    res.redirect("/cart");
});

app.post("/deleteFromCart",(req,res)=>{
    //if registered


    //else
    let tempQty=[];
    let tempUnregisteredUserCartProducts=[];
    for(var i=0;i<qty.length;i++){
        if(i!=req.body.index){
            tempQty.push(qty[i]);
            tempUnregisteredUserCartProducts.push(unregisteredUserCartProducts[i]);
        }
    }
    qty=tempQty.slice();
    unregisteredUserCartProducts=tempUnregisteredUserCartProducts.slice();
    res.redirect("/cart");
});

app.post("/moveToWishlist",(req,res)=>{
    let present=0;
    for(var i=0;i<unregisteredUserWishlistProducts.length;i++){
        console.log(unregisteredUserWishlistProducts[i]);
        if(JSON.stringify(unregisteredUserWishlistProducts[i])===JSON.stringify(unregisteredUserCartProducts[req.body.index])){
            present=1;
            break;
        }
    }
    if(present==0){
        unregisteredUserWishlistProducts.push(unregisteredUserCartProducts[req.body.index])
    }
   
    let tempQty=[];
    let tempUnregisteredUserCartProducts=[];
    for(var i=0;i<qty.length;i++){
        if(i!=req.body.index){
            tempQty.push(qty[i]);
            tempUnregisteredUserCartProducts.push(unregisteredUserCartProducts[i]);
        }
    }
    qty=tempQty;
    unregisteredUserCartProducts=tempUnregisteredUserCartProducts;
    res.redirect("/cart");
});


//////////////////////////////////////////////////////////////wish///////////////////////////////////////////////////////////


app.get("/wish",(req,res)=>{
    res.render("wish",{css:"wish",products:unregisteredUserWishlistProducts});
});

app.post("/addToWishlist",(req,res)=>{
     // if user is registered


    //else
   
    Product.findOne({"_id":req.body.productId},(err,product)=>{
        let k=0;
        if(unregisteredUserWishlistProducts.length!=0){
            for(var i=0;i<unregisteredUserWishlistProducts.length;i++){
                if(JSON.stringify(unregisteredUserWishlistProducts[i])===JSON.stringify(product)){
                    k=1;
                    break;
                }
            }
            if(k===0){
                unregisteredUserWishlistProducts.push(product);
            }
        }else{
            unregisteredUserWishlistProducts.push(product);
        }
        res.status(204).send();  //////////vvi
    });
});

app.post("/deleteFromWish",(req,res)=>{
    let tempWishlist=[];
    for(var i=0;i<unregisteredUserWishlistProducts.length;i++){
        if(i!=req.body.index){
            tempWishlist.push(unregisteredUserWishlistProducts[i]);
        }
    }  
    unregisteredUserWishlistProducts=tempWishlist; 
    res.redirect("/wish");
});

app.post("/moveToCart",(req,res)=>{
    let tempWishlist=[];
    let present=0;
    for(var i=0;i<unregisteredUserWishlistProducts.length;i++){
        if(i!=req.body.index){
            tempWishlist.push(unregisteredUserWishlistProducts[i]);
        }
        else{
            for(var j=0;j<unregisteredUserCartProducts.length;j++){
                if(JSON.stringify(unregisteredUserCartProducts[j])===JSON.stringify(unregisteredUserWishlistProducts[i])){
                    qty[j]=qty[j]+1;
                    present=1;
                    break;
                }
            }
            if(present==0){
                unregisteredUserCartProducts.push(unregisteredUserWishlistProducts[i]);
                qty.push(1);
            }
        }
    }  
    unregisteredUserWishlistProducts=tempWishlist; 
    res.redirect("/wish");
});

//login customer

app.get("/login",(req,res)=>{
    res.render("login",{"css":"register-login"});
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

//CHECKOUT!!!!

app.post('/create-checkout-session', async (req, res) => {
    var itemsArr=[];
    for(var i=0;i<qty.length;i++){
     itemsArr.push({
            price_data: {
              currency: 'inr',
              product_data: {
                name: unregisteredUserCartProducts[i].name,
                images: [unregisteredUserCartProducts[i].imgUrl],
              },
              unit_amount: unregisteredUserCartProducts[i].price*100,
            },
            quantity: qty[i],
          });
    }

    options={
      payment_method_types: ['card'],
      shipping_address_collection: {
          allowed_countries: ['IN'],
        },
      line_items: itemsArr,
      mode: 'payment',
      success_url: ""+YOUR_DOMAIN+"/success",
      cancel_url: ""+YOUR_DOMAIN+"/cancel",
    }
    const session = await stripe.checkout.sessions.create(options);
    res.json({ id: session.id });
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
    res.redirect("/admin/addProducts");
});

app.post("/admin/logout",(req,res)=>{
    res.redirect("/admin");
});

//listening on port 
app.listen(4242,()=>{
console.log("Listening at port");
});