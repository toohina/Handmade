require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// const nodemailer = require("nodemailer");
// const { generateOtp } = require("./generate-otp");
//passport
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//const {getSum}=require("./get-sum");
const mongoose = require("mongoose");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
// passport middleware
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const YOUR_DOMAIN = 'http://localhost:4242';

mongoose.connect("mongodb+srv://admin-toohina:test123@cluster0.kbrib.mongodb.net/handmadeDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    imgUrl: String,
    category: String //bookmark, card, decor
});

const cartItemSchema = new mongoose.Schema({
        ref:userSchema,
        product:productSchema,
        qty:{
            type:Number,
            default:1
        }
});

const wishItemSchema = new mongoose.Schema({
    ref:userSchema,
    products:[productSchema]
});


userSchema.plugin(passportLocalMongoose); //hash and salt passwords


const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const CartItem=mongoose.model('Cart',cartItemSchema);
const WishItem = mongoose.model('Wish', wishItemSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES


let profile;

//register customer
app.get("/register", (req, res) => {
    res.render("register", { "css": "register-login", "profile": false, "successfulRegisteration": true });
});

app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            res.render("register", { "css": "register-login", "profile": false, "successfulRegisteration": false });
        } else {
            passport.authenticate("local")(req, res, function() {
                profile = true;
                res.redirect("/");
            });
        }
    });
});




//login customer

app.get("/login", (req, res) => {
    successfulLogin = true;
    res.render("login", { "css": "register-login", "profile": false, "successfulLogin": true });
});

app.get("/login-retry", (req, res) => {
    successfulLogin = false;
    res.render("login", { "css": "register-login", "profile": false, "successfulLogin": false });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.findOne({ username: req.body.username }, function(err, foundUser) {
        if (foundUser) {
            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                    res.redirect("/login-retry");
                } else {
                    passport.authenticate("local", {
                        failureRedirect: "/login-retry"
                    })(req, res, function() {
                        res.redirect("/");
                    });
                }
            });
        } else {
            res.redirect("/login-retry");
        }
    });
});


//home


app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        profile = true;
    } else {
        profile = false;
    }
    res.render("home", { "css": "home", "profile": profile });
});


//products
app.get("/bookmark", (req, res) => {
    Product.find({ category: "bookmark" }, (err, bookmarks) => {
        if (req.isAuthenticated()) {
            res.render("products", { css: "products", products: bookmarks, "profile": true });
        } else {
            res.render("products", { css: "products", products: bookmarks, "profile": false });
        }
    });
});

app.get("/card", (req, res) => {
    Product.find({ category: "card" }, (err, cards) => {
        if (req.isAuthenticated()) {
            res.render("products", { css: "products", products: cards, "profile": true });
        } else {
            res.render("products", { css: "products", products: cards, "profile": false });
        }
    });
});

app.get("/decor", (req, res) => {
    Product.find({ category: "decor" }, (err, decors) => {
        if (req.isAuthenticated()) {
            res.render("products", { css: "products", products: decors, "profile": true });
        } else {
            res.render("products", { css: "products", products: decors, "profile": false });
        }
    });
});

///////////////////////////////////////////////////////wishlist///////////////////////////////////////////////
app.get("/wish",(req, res)=>{
    if(req.isAuthenticated()){
        WishItem.findOne({'ref._id': req.user._id},(err,foundItem)=>{
            res.render("wish", { css: "wish", item:foundItem,"profile": true});
        });
    }else{
        res.redirect("/login");
    }
});

app.post("/deleteFromWish", (req, res)=>{
    WishItem.findOneAndUpdate({'ref._id': req.user._id},{$pull:{products:{_id:req.body.id}}},(err,list)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/wish");
        }
      
    });
});

app.post("/moveToCart",(req, res)=>{
    WishItem.findOneAndUpdate({'ref._id': req.user._id},{$pull:{products:{_id:req.body.id}}},(err,list)=>{
        if(err){
            console.log(err);
        }else{

            Product.findById(req.body.id,(err,foundProduct) => {
                CartItem.findOneAndUpdate({'ref._id' : req.user._id, 'product._id':req.body.productId},{$inc:{'qty':1}},{new:true},(err,foundCartItem) => {
                    if(err){
                        console.log(err);
                    }else{
                        if(!foundCartItem){
                            const newCartItem = new CartItem({
                                ref:req.user,
                                product:foundProduct,
                                qty:1
                            });
                            newCartItem.save();
                        }else{
                            console.log(foundCartItem);
                        }
                    }
                });
            });
            
            res.redirect("/wish");
        } 
    });
});

////////////////////////////////////////////////////////cart///////////////////////////////////////////////////
app.get("/cart",(req, res)=>{
    if(req.isAuthenticated()){
        CartItem.find({'ref._id':req.user._id},(err,cartItems)=>{
            console.log(cartItems);
            res.render("cart",{css:"cart","profile":true,"cartItems":cartItems});
        });
    }else{
        res.redirect("/login");
    }
});

app.post("/changeQty",(req,res)=>{
    CartItem.findOneAndUpdate({_id:req.body.id},{qty:req.body.qty},{new:true},(err,updatedItem)=>{
        console.log(updatedItem);
        res.redirect("/cart");
    });
});

app.post("/deleteFromCart",(req, res)=>{
    CartItem.findOneAndDelete({_id:req.body.id},(err,success)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/cart");
            console.log(success);
        }
    });
});

app.post("/moveToWishlist",(req, res)=>{
    Product.findOne({_id:req.body.id},(err, product)=>{
        WishItem.findOneAndUpdate({'ref._id': req.user._id},{$addToSet:{products:product}},{new:true},(err,updatedItem)=>{
            console.log(updatedItem);
        });
        CartItem.findOneAndDelete({_id:req.body.itemId},(err,success)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect("/cart");
                console.log(success);
            }
        });
    });
});

app.post("/addToCart",(req, res) => {
    if(req.isAuthenticated()){
        Product.findById(req.body.productId,(err,foundProduct) => {

            CartItem.findOneAndUpdate({'ref._id' : req.user._id, 'product._id':req.body.productId},{$inc:{'qty':1}},{new:true},(err,foundCartItem) => {
                if(err){
                    console.log(err);
                }else{
                    if(!foundCartItem){
                        const newCartItem = new CartItem({
                            ref:req.user,
                            product:foundProduct,
                            qty:1
                        });
                        newCartItem.save();
                    }else{
                        console.log(foundCartItem);
                    }
                }
            });
        });
        res.redirect("/"+req.body.page);

    }else{
        res.redirect("/login");
    }
   
});

app.post("/addToWishlist",(req, res) => {
    if(req.isAuthenticated()){
        Product.findById(req.body.productId,(err,foundProduct) => {

            WishItem.findOneAndUpdate({'ref._id': req.user._id},{$addToSet:{'products':foundProduct}},{new:true},(err,updatedWishItem) => {
                if(err){
                    console.log(err);
                }else{
                    if(!updatedWishItem){
                        const newWishItem =new WishItem({
                            ref:req.user,
                            products:[foundProduct]
                        });
                        newWishItem.save();
                    }else{
                        console.log(updatedWishItem);
                    }
                }
            });
    
        });
            res.redirect("/"+req.body.page);

    }else{
        res.redirect("/login");
    }
   
});


//////////////////////////////////////////////////////////////verify-email///////////////////////////////////////////////

// var otp;
// app.get("/verify-email", (req, res) => {

//     otp = generateOtp();

//     //simple message transfer protocol
//     // Generate test SMTP service account from ethereal.email
//     // Only needed if you don't have a real mail account for testing

//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'btoohina@gmail.com', // generated ethereal user
//             pass: 'randompassword123', // generated ethereal password
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     // send mail with defined transport object
//     transporter.sendMail({
//         from: '"Handmade" <btoohina@gmail.com>', // sender address
//         to: "toohi2000@gmail.com", // list of receivers
//         subject: "OTP", // Subject line
//         text: otp, // plain text body
//     });

//     var makeOtpInvalid = setTimeout(function() { otp = "" }, 90000);
//     makeOtpInvalid.unref(); // Node won't wait for this timeout to complete if it needs to exit earlier.

//     res.render("verify-email", { "css": "verify" });
// });


// app.post("/verify-email", (req, res) => {

//     if (otp === req.body.otp) {
//         console.log("Email Verified.")
//     } else {
//         console.log("Wrong OTP");
//     }

// });

//CHECKOUT!!!!

app.get("/success",(req, res)=>{
    if(req.isAuthenticated()){
        CartItem.deleteMany({'ref._id' : req.user._id},(err,success)=>{
            if(err){
                console.log(err);
            }else{
                res.render("success",{css:"success", profile:true});
            }
        });
    }else{
        res.redirect("/login");
    }
});

app.get("/cancel",(req, res)=>{
    if(req.isAuthenticated()){
        res.render("cancel",{css:"success", profile:true});
    }else{
        res.redirect("/login");
    }
});


app.post('/create-checkout-session',(req, res) => {
   
    

    CartItem.find({'ref._id': req.user._id}, async(err,foundCartItems)=>{

     

        var itemsArr = [];
        
        foundCartItems.forEach(item =>{
            itemsArr.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.product.name,
                        images: [item.product.imgUrl],
                    },
                    unit_amount: item.product.price * 100,
                },
                quantity: item.qty,
            });
        });

        options = {
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
            line_items: itemsArr,
            mode: 'payment',
            success_url: "" + YOUR_DOMAIN + "/success",
            cancel_url: "" + YOUR_DOMAIN + "/cancel",
        }
        const session = await stripe.checkout.sessions.create(options);
        res.json({ id: session.id });

  
       
    });

 

  
});

//logout
app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});


//listening on port 
app.listen(4242, () => {
    console.log("Listening at port");
});