//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');             
const passport = require("passport");
const passsportLocalMongoose = require("passport-local-mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express"); 


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({                             
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());               
app.use(passport.session());                    


mongoose.connect("mongodb+srv://admin-arbaz:Test123@cluster2.ot6xo.mongodb.net/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(passsportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Secret API",
            description: "Secret API Information",
            contact: {
                name: "Amazing Developer"
            },
            servers: ["http://localhost:3000"]
        }
    },
    // ['.routes/*js']
    apis: ["app.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Routes
/**
 * @swagger
 * /:
 *  get:
 *   description: Use to request to home route
 *   responses:
 *     '200':
 *       description: A successfull response
 */
app.get("/", function(req, res){
    res.render("home");
    res.status(200).send("Home results");
});

/**
 * @swagger
 * /register:
 *  get:
 *   description: Use to request to register route
 *   responses:
 *     '201':
 *       description: A successfull response
 */
app.get("/register", function(req, res){
    res.render("register");
    res.status(200).send("register results");
});

/**
 * @swagger
 * /login:
 *  get:
 *   description: Use to request to login route
 *   responses:
 *     '202':
 *       description: A successfull response
 */
app.get("/login", function(req, res){
    res.render("login");
    res.status(200).send("login results");
});

/**
 * @swagger
 * /secrets:
 *  get:
 *   description: Use to request to secrets route
 *   responses:
 *     '203':
 *       description: A successfull response
 */
app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
    res.status(200).send("secret results");
});

/**
 * @swagger
 * /logout:
 *  get:
 *   description: Use to request to logout
 *   responses:
 *     '204':
 *       description: A successfull response
 */
app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/");
    res.status(200).send("logout results");
});

/**
 * @swagger
 * /register:
 *  post:
 *   description: Use to update register
 *   responses:
 *     '205':
 *       description: A successfull response
 */
app.post("/register", function(req, res){
    User.register({username:req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
    res.status(200).send("Successfully updated");
});

/**
 * @swagger
 * /login:
 *  post:
 *   description: Use to update to login
 *   responses:
 *     '206':
 *       description: A successfull response
 */
app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
    res.status(200).send("successfully updated");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

 
app.listen(port, function() {
  console.log("Server has started Succesfully");
});
  
