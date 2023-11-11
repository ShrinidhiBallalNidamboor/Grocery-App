//jshint esversion:6
var nodemailer = require('nodemailer');
const mongoose = require("mongoose");
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const crypto = require('crypto'); // Import NodeJS's Crypto Module


class Block { // Our Block Class
  constructor(data, prevHash) {
      this.timestamp = Date.now(); // Get the current timestamp
      this.data = data; // Store whatever data is relevant 
      this.prevHash = prevHash // Store the previous block's hash
      this.hash = computeHash(this.prevHash, this.timestamp, this.data) // Compute this block's hash
  }

}

function computeHash(prevHash, timestamp, data) { // Compute this Block's hash
  let strBlock = prevHash + timestamp + JSON.stringify(data) // Stringify the block's data
  return crypto.createHash("sha256").update(strBlock).digest("hex") // Hash said string with SHA256 encrpytion
}

 async function startGenesisBlock(ID) {
  var chain = new blockchain({});

  blockchain.create(chain, async function(err, chain){
    if(err){
      console.log(err);
    }
    else{
      let block = new Block(
        0, ""
      );
      await blockchain.update({_id: chain._id},{ $push: {chain: block}})};
      await blockchain.update({_id: chain._id},{ID: ID});
    });
  // Create an empty block to start
}

// function obtainLatestBlock() {
//   return this.blockchain[this.blockchain.length - 1] // Get last block on the chain
// }

async function addNewBlock(Data, ID){ // Add a new block
  let b=await blockchain.find({ID: ID});// Set its previous hash to the correct value
  let prevHash = b[0].chain[b[0].chain.length-1].hash;
  console.log(prevHash)
  let block = new Block(
    Data, prevHash
  );
  await blockchain.update({ID: ID},{ $push: {chain: block}});
}

async function checkChainValidity(ID) { // Check to see that all the hashes are correct and the chain is therefore valid
  let chains=await blockchain.find({ID: ID});
  for(let i = 1; i<chains[0].array.length; i++) { // Iterate through, starting after the genesis block
      let currBlock = chains[0].array[i];
      let prevBlock = chains[0].array[i-1];
      
      // Is the hash correctly computed, or was it tampered with?
      let hash = computeHash(prevBlock.hash, currBlock.timestamp, currBlock.data);
      if(currBlock.hash!==hash) { 
          return false
      }
    
      // Does it have the correct prevHash value?; ie: What a previous block tampered with?
      if(currBlock.prevHash!==prevBlock.hash) {                 
        return false
      }
  }
  return true // If all the blocks are valid, return true
}


// // Create two test blocks with some sample data
// let a = new Block({from: "Joe", to: "Jane"})
// let b = new Block({from: "Jane", to: "Joe"})


// let chain = new BlockChain() // Init our chain
// chain.addNewBlock(a) // Add block a
// chain.addNewBlock(b) // Add block b
// console.log(chain) // Print out the blockchain
// console.log("Validity: " + chain.checkChainValidity()) // Check our chain for validity

const multer = require("multer");
const { Decimal128, Double } = require('mongodb');
var ID;
var id_product;
var array=[];
var address=0;
var msg=true;
var noPartner = false;
categories=["Fruits","Vegetables","Home-items","Sports","Toys","Eateries","Stationary","Personal-care"]
/*This requires the npm package called the mongoose that as the driver 
or the intration of the mongoDB with node js.*/

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public/images"));

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("image");

/*This helps in connecting to the mongoDB server called the userDB, 
if doesn't exits then it creates a new database. The end section is added to avoid 
the deprication error created, beacuse the current version is outdated*/
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);


/*This step is used similar to the creation in the case of the SQL languages,
 but the difference here is thsi schema or the patterm=n can be use for creation 
 numerous tables or in this case a collection*/

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
    secret: String,
    Role: String
  });

  const blockchainSchema = new mongoose.Schema ({
    chain: array,
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orderSchema'
    },
  });
  
  const informationSchema = new mongoose.Schema({
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    Name: String,
    Address: String,
    tin: Number,
    gmail: String, 
    adhaarNumber: Number,
    about: String,
    imagename: String
  });

  
  const Product_FarmerSchema = new mongoose.Schema({
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ProductName: String,
    UnitOfMeasure: String,
    UnitOfPrice: Number,
    Description: String,
    Picture: String,
    Category:String
  });
  
  const Product_ShopkeeperSchema = new mongoose.Schema({
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ProductName: String,
    UnitOfMeasure: String,
    UnitOfPrice: Number,
    Description: String,
    Picture: String,
    Category:String
  });

  const cartItems_farm = new mongoose.Schema({
    ID1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ID2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_FarmerSchema'
    },
    quantity: {
      type: Number,
      default:0
    },
    name:String,
    price:Number,
    picture: String,
    Category:String
  });

  const cartItems_shop = new mongoose.Schema({
    ID1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ID2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_ShopkeeperSchema'
    },
    quantity: {
      type: Number,
      default:0
    },
    name:String,
    price:Number,
    picture: String,
    Category:String
  });

  const orderSchema = new mongoose.Schema({
    ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    orderDate: Date,
    deliveryDate: Date,
    Name : String,
    Address : String,
    Phone: Number,
    Amount: Number,
    assign:{
      type:Boolean,
      default:false
    }
  })

  const orderDetailsSchema = new mongoose.Schema({
    ID1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_ShopkeeperSchema'
    },
    ID2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_FarmerSchema'
    },
    ID3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orderSchema'
    },
    quantity: {
      type: Number,
      default:0
    },
    status: {
      type:Boolean,
      default:false
    }
  })

  const ReviewSchema = new mongoose.Schema({
    ID1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_ShopkeeperSchema'
    },
    ID2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_FarmerSchema'
    },
    review: String
  })

  const deliveryAssignSchema = new mongoose.Schema({
    ID1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ID2:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orderSchema'
    },
    status:{
      type:String,
      default:"0"
    }
  })

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

  /*This step is used for the creation of the new collection. 
The individual elements are given in the singular form*/
const User = new mongoose.model("User", userSchema);
const information_farmer = new mongoose.model("information_farmer", informationSchema);
const information_shopkeeper = new mongoose.model("information_shopkeeper", informationSchema);
var Product_shopkeeper = new mongoose.model("Product_shopkeeper", Product_ShopkeeperSchema);
var Product_farmer = new mongoose.model("Product_farmer", Product_FarmerSchema);
var information_delivery = new mongoose.model("information_delivery",informationSchema);
const farmCart  = new mongoose.model("cartItems_farm",cartItems_farm);
const shopCart = new mongoose.model("cartItems_shop",cartItems_shop);
const orderTable = new mongoose.model("orderTable",orderSchema);
const assignTable = new mongoose.model('assignTable',deliveryAssignSchema);
var orderDetails = new mongoose.model('orderDetails', orderDetailsSchema);
var Review = new mongoose.model('ReviewSchema', ReviewSchema);
var blockchain = new mongoose.model('blockchainSchema',blockchainSchema )




/*This creates the session and also create the cookies.*/
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.get("/", function(req, res){
  information_farmer.find({}, function (err, info1) {
    if (err){
      console.log(err);
    }
    else{
      information_shopkeeper.find({}, function (err, info2) {
        if (err){
          console.log(err);
        }
        else{
          if (req.isAuthenticated()){
            console.log(info1);
            Product_farmer.find({}, function (err, product1) {
              if (err){
                console.log(err);
              }
              else{
                Product_shopkeeper.find({}, function (err, product2) {
                  if (err){
                    console.log(err);
                  }
                  else{
                      if(req.user.Role=="User")
                        res.render("home", {loggedIn: 1, page: 1, info1: info1, info2: info2, product1: product1, product2: product2});
                      else if(req.user.Role=="Farmer")
                        res.render("home", {loggedIn: 2, page: 1, info1: info1, info2: info2, product1: product1, product2: product2});
                      else if(req.user.Role=="Shop Owner")
                        res.render("home", {loggedIn: 3, page: 1, info1: info1, info2: info2, product1: product1, product2: product2});
                      else if(req.user.Role=="Delivery Partner")
                        res.render("home", {loggedIn: 4, page: 1, info1: info1, info2: info2, product1: product1, product2: product2});
                  }
                });
              }
            });
            } else {
              Product_farmer.find({}, function (err, product1) {
                if (err){
                  console.log(err);
                }
                else{
                  Product_shopkeeper.find({}, function (err, product2) {
                    if (err){
                      console.log(err);
                    }
                    else{
                      res.render("home", {loggedIn: 0, page: 1, info1: info1, info2: info2, product1: product1, product2: product2});
                    }
                  });
                }
              });
          }
        }
      });
    }
  });
});

/*This is the google authentication 
or using the google authetication 2.0 for saving 
and authentication of the passwords and the user names.*/
app.post("/auth/google", function(req, res){
        User.register({Role: req.body.Role}, function(err, user){
          if (err) {console.log(err);res.redirect("/register");}
          else{passport.authenticate("local")(req, res, function(){res.redirect("/secrets");});
        }
      });
      res.redirect("/auth/google");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] 
}));

/*This is the page to which the 
google directs if the user is authenticate.*/
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
});


app.get("/login", function(req, res){
  if (!(req.isAuthenticated())){
    res.render("login", {loggedIn: 0, page: 5});
  } 
});


app.get("/about", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User")
      res.render("about", {loggedIn: 1, page: 2});
    else if(req.user.Role=="Farmer")
      res.render("about", {loggedIn: 2, page: 2});
    else if(req.user.Role=="Shop Owner")
      res.render("about", {loggedIn: 3, page: 2});
    else if(req.user.Role=="Delivery Partner")
      res.render("about", {loggedIn: 4, page: 2});

  } else {
    res.render("about", {loggedIn: 0, page: 2});
  }
});

app.get("/shop", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
      Product_farmer.find({}, function (err, product1) {
        if (err){
          console.log(err);
        }
        else{
          Product_shopkeeper.find({}, function (err, product2) {
            if (err){
              console.log(err);
            }
            else{


              farmCart.find({ID1:ID},(err,list1)=>{
                if(err){
                  console.log(err)
                }
                else{
                  shopCart.find({ID1:ID},(err,list2)=>{
                    if(err){
                      console.log(err)
                    }
                    else{
                      msg=true;
                      var p1=[]
                      var p2=[]
                      for(var a=0;a<product1.length;a++){
                        p1[a]=1;
                        for(var b=0;b<list1.length;b++){
                            if(list1[b].ID2.equals(product1[a]._id))
                              { 
                                p1[a]=0;
                                break;
                              }
                        
                        }
                      }
                      for(var a=0;a<product2.length;a++){
                        p2[a]=1;
                        for(var b=0;b<list2.length;b++){
                            if(list2[b].ID2.equals(product2[a]._id))
                            { 
                              p2[a]=0;
                              break;
                            }
                        }
                      }
                      res.render("shop", {categories:categories,msg:msg,loggedIn: 1, page: 3, product1: product1, product2: product2,p1:p1,p2:p2});
                    }
                  })
                  
                }
              })
            }
          });
        }
      });
      
    }
    else if(req.user.Role=="Farmer"||req.user.Role=="Shop Owner"||req.user.Role=="Delivery Partner")
      res.redirect("/");
  } else {
    res.redirect("/login");
  }
});



app.post("/searchShop", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
      var search = req.body.searchKey;
      
      if(search!==""){
        //ProductName
        
        console.log(search)
        Product_farmer.find({ ProductName: {$regex:search,$options:"$i"} }, function (err, product1) {
          if (err){
            console.log(err);
          }
          else{
            Product_shopkeeper.find({ ProductName: {$regex:search,$options:"$i"} }, function (err, product2) {
              if (err){
                console.log(err);
              }
              else{
                  if(product1.length==0&&product2.length==0){
                    msg=false;
                    res.render("shop", {categories:categories,msg:msg,loggedIn: 1, page: 3});
                  }
                  else{
              farmCart.find({ID1:ID,name:{$regex:search,$options:"$i"}},(err,list1)=>{
                if(err){
                  console.log(err)
                }
                else{
                  shopCart.find({ID1:ID,name:{$regex:search,$options:"$i"}},(err,list2)=>{
                    if(err){
                      console.log(err)
                    }
                    else{
                      msg=true;
                      var p1=[]
                      var p2=[]
                      for(var a=0;a<product1.length;a++){
                        p1[a]=1;
                        for(var b=0;b<list1.length;b++){
                            if(list1[b].ID2.equals(product1[a]._id))
                              { 
                                p1[a]=0;
                                break;
                              }
                        
                        }
                      }
                      for(var a=0;a<product2.length;a++){
                        p2[a]=1;
                        for(var b=0;b<list2.length;b++){
                            if(list2[b].ID2.equals(product2[a]._id))
                            { 
                              p2[a]=0;
                              break;
                            }
                        }
                      }
                      res.render("shop", {categories:categories,msg:msg,loggedIn: 1, page: 3, product1: product1, product2: product2,p1:p1,p2:p2});
                    }
                  })
                  
                }
              })
                  }
              }
            });
          }
        });
      }
      else{
        res.redirect('/shop')
      }
      
    }
    else
      res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.get("/orderHistory",async (req,res)=>{
  if (req.isAuthenticated()){
    var userOrders = [];
    var status = [];
    var details=[]
    if(req.user.Role=="User"){
      let orders = await orderTable.find({ID:ID});
      var l=0;
      for(let i=0;i<orders.length;i++){
        var indOrders = [];
        var k=0;
        var ordDetails = await orderDetails.find({ID3:orders[i]._id});
        
        for(let j=0;j<ordDetails.length;j++){
          if(ordDetails[j].ID1!=null){
            var shop = await Product_shopkeeper.find({_id:ordDetails[j].ID1});
            indOrders[k++]=shop[0];
          }
          else{
            var farm = await Product_farmer.find({_id:ordDetails[j].ID2});
            indOrders[k++]=farm[0];
          }
          
        }
        userOrders[l++]=indOrders;
        details[l] = ordDetails
        let delivery = await assignTable.find({ID2:orders[i]._id});
        let block_array = await blockchain.find({ID: orders[i]._id});
        status.push(block_array[0].chain.length-1);
      }

      
      for(let i=0;i!=orders.length;i++){
        for(let k=0;k!=userOrders[i].length;k++)
          console.log(userOrders[i][k].ProductName,details[i+1][k].quantity)
         } 
      
      res.render("orderHistory",{details:details,userOrders:userOrders,orders:orders,status:status, page: 14, loggedIn: 1});
    }
    else{
      res.redirect("/");
    }
  }
  else{
    res.redirect("/login");
  }
})

app.get("/details", function(req, res){
  if (req.isAuthenticated()){
    let found=0;
    let array=[];
    if(req.user.Role=="Farmer"){
        information_farmer.find({ ID: ID}, function (err, foundUser) {
        if (err){
            console.log(err);
        }
        else{
          if(foundUser.length!=0){
            found=1;
            array.push(foundUser[0].Name);
            array.push(foundUser[0].Address);
            array.push(foundUser[0].tin);
            array.push(foundUser[0].gmail);
            array.push(foundUser[0].adhaarNumber);
            array.push(foundUser[0].imagename);
            array.push(foundUser[0].about);
            console.log(foundUser[0]);
          }
          res.render("details", {loggedIn: 2, page: 8, found: found, array: array});
        }});
    }
    else if(req.user.Role=="Shop Owner"){
      console.log("Updated");
      information_shopkeeper.find({ ID: ID}, function (err, foundUser) {
      if (err){
          console.log(err);
      }
      else{
        if(foundUser.length!=0){
          found=1;
          array.push(foundUser[0].Name);
          array.push(foundUser[0].Address);
          array.push(foundUser[0].tin);
          array.push(foundUser[0].gmail);
          array.push(foundUser[0].adhaarNumber);
          array.push(foundUser[0].imagename);
          array.push(foundUser[0].about);
          console.log(foundUser[0]);
        }
        res.render("details", {loggedIn: 3, page: 8, found: found, array: array});
      }});
  }
    else if(req.user.Role=="Delivery Partner"){
      console.log("Updated");
      information_delivery.find({ ID: ID}, function (err, foundUser) {
      if (err){
          console.log(err);
      }
      else{
        if(foundUser.length!=0){
          found=1;
          array.push(foundUser[0].Name);
          array.push(foundUser[0].Address);
          array.push(foundUser[0].tin);
          array.push(foundUser[0].gmail);
          array.push(foundUser[0].adhaarNumber);
          array.push(foundUser[0].imagename);
          array.push(foundUser[0].about);
          console.log(foundUser[0]);
        }
        res.render("details", {loggedIn: 4, page: 8, found: found, array: array});
      }});
  }
    else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});


app.get("/Products_farmer", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Farmer"){
        Product_farmer.find({ ID: ID}, function (err, product) {
        if (err){
          console.log(err);
        }
        else{
          console.log(product);
          res.render("Products_farmer", {loggedIn: 2, page: 9, product: product});
        }});
    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/Products_shopkeeper", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Shop Owner"){
        Product_shopkeeper.find({ ID: ID}, function (err, product) {
        if (err){
          console.log(err);
        }
        else{
          console.log(product);
          res.render("Products_shopkeeper", {loggedIn: 3, page: 9, product: product});
        }});
    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/Add_products_farmer", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Farmer"){
        var a=[];
        var f=0;
        if(array.length!=0){
            f=1;
            a.push(array[0]);
            a.push(array[1]);
            a.push(array[2]);
            a.push(array[3]);
            a.push(array[4]);
            a.push(array[5]);
        }
        array=[];
        console.log(a);
        if(address==0){
          res.render("Add_products_farmer", {loggedIn: 2, page: 10, found: f, array: a, address: 0});
        }
        else{
          let temp=address;
          address=0;
          console.log(temp);
          res.render("Add_products_farmer", {loggedIn: 2, page: 10, found: f, array: a, address: temp});
        }
      }
    else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/Add_products_shopkeeper", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Shop Owner"){
        var a=[];
        var f=0;
        if(array.length!=0){
            f=1;
            a.push(array[0]);
            a.push(array[1]);
            a.push(array[2]);
            a.push(array[3]);
            a.push(array[4]);
            a.push(array[5]);
        }
        array=[];
        console.log(a);
        if(address==0){
          res.render("Add_products_shopkeeper", {loggedIn: 3, page: 10, found: f, array: a, address: 0});
        }
        else{
          let temp=address;
          address=0;
          console.log(temp);
          res.render("Add_products_shopkeeper", {loggedIn: 3, page: 10, found: f, array: a, address: temp});
        }
    }
    else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/Add_products_farmer/:item", function(req, res){
  var id=req.params.item;
  if (req.isAuthenticated()){
    if(req.user.Role=="Farmer"){
        Product_farmer.find({ _id: id}, function (err, product) {
          if (err){
            console.log(err);
          }
          else{
            address=id;
            array.push(product[0].ProductName);
            array.push(product[0].UnitOfMeasure);
            array.push(product[0].UnitOfPrice);
            array.push(product[0].Description);
            array.push(product[0].Picture);
            array.push(product[0].category);
            res.redirect("/Add_products_farmer");
          }
        });
    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/Add_products_shopkeeper/:item", function(req, res){
  var id=req.params.item;
  if (req.isAuthenticated()){
    if(req.user.Role=="Shop Owner"){
        Product_shopkeeper.find({ _id: id}, function (err, product) {
          if (err){
            console.log(err);
          }
          else{
            address=id;
            array.push(product[0].ProductName);
            array.push(product[0].UnitOfMeasure);
            array.push(product[0].UnitOfPrice);
            array.push(product[0].Description);
            array.push(product[0].Picture);
            array.push(product[0].category);
            res.redirect("/Add_products_shopkeeper");
          }
        });
    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
});

app.get("/register", function(req, res){
  if (!(req.isAuthenticated())){
    res.render("register", {loggedIn: 0, page: 4});
  } 
});

app.get("/checkout", function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
    farmCart.find({ID1:ID},(err,list1)=>{
      if(err){
        console.log(err)
      }
      else{
        shopCart.find({ID1:ID},(err,list2)=>{
          if(err){
            console.log(err)
          }
          else{
            console.log(list1)
            var cost=0;
            for(var i=0;i<list1.length;i++)
              {
                cost+=list1[i].price*list1[i].quantity;
              }
            for(var i=0;i<list2.length;i++)
              {
                cost+=list2[i].price*list2[i].quantity;

              }
              if(noPartner===false)
              res.render("checkout", {noPartner:noPartner,loggedIn: 1, page: 7,cart1: list1,cart2:list2,cost});
              else{
                noPartner=false;
                res.render("checkout", {noPartner:true,loggedIn: 1, page: 7,cart1: list1,cart2:list2,cost});
              }

          }
        })
        
      }
    })
  }
  else{
    res.redirect("/");
  }
}
else {
res.redirect("/login");
}
});

app.post("/Review", async function(req, res){
  var desc=req.body.Description;
  var i=req.body.address;
  var types=req.body.types;
  var r;
  if(types==1){

    var newReview = new Review({
      ID2:i,
      review:desc
    })
    await newReview.save();
    res.redirect("/Review/"+i); 
  }
  else{
    var newReview = new Review({
      ID1:i,
      review:desc
    })
    await newReview.save();
    res.redirect("/Review/"+i);
  }
});

app.get("/Review/:id", function(req, res){
  id_product = req.params.id;
  res.redirect("/Review");
});

app.get("/Review", async function(req, res){

    var product = await Product_shopkeeper.find({_id: id_product})
    if(product.length!=0){
      var review = await Review.find({ ID1: id_product});
      
        res.render("Review", {review: review, product: product[0], i: 2, page: 13, loggedIn: 1});
      
    }

    product = await Product_farmer.find({_id: id_product})
    if(product.length!=0){
      review = await Review.find({ ID2: id_product});
     
        res.render("Review", {review: review, product: product[0], i: 1, page: 13, loggedIn: 1});
      
    }
  
 
});

app.post("/checkout",(req,res)=>{
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
    
    farmCart.find({ID1:ID},(err,list1)=>{
      if(err){
        console.log(err)
      }
      else{
        shopCart.find({ID1:ID},async (err,list2)=>{
          if(err){
            console.log(err)
          }
          else{
            console.log(list1)
            var cost=0;
            for(var i=0;i<list1.length;i++)
              {
                cost+=list1[i].price*list1[i].quantity;

              }
            for(var i=0;i<list2.length;i++)
              {
                cost+=list2[i].price*list2[i].quantity;

              }

                var result=await information_delivery.find({Address:req.body.address})
                var no=Math.floor(Math.random() * result.length);
                if(result.length==0){
                  noPartner=true;
                  res.redirect("/checkout");
                }
                else{ 
                  result=result[no];
                var d=new Date();
                var d1=new Date();
                d.setDate(d.getDate() + 3)
                var date=d.getDate();
                var month=d.getMonth()+1;
                var yr=d.getFullYear();
                var product = new orderTable({
                  ID: ID,
                  orderDate:d1,
                  deliveryDate:d,
                  Name:req.body.name,
                  Address:req.body.address,
                  Phone:req.body.phone,
                  Amount:cost+50,
                  assign:true
              });

              var int = await product.save();
              var identifier=product._id;
              console.log(identifier);
              for(var i=0;i<list1.length;i++)
              {
                var details=new orderDetails({
                  ID2: list1[i].ID2,
                  ID3: identifier,
                  quantity: list1[i].quantity,
                  status:false
                });
                details.save();
              }
            for(var i=0;i<list2.length;i++)
              {
                var details=new orderDetails({
                  ID1: list2[i].ID2,
                  ID3: identifier,
                  quantity: list2[i].quantity,
                  status:false
                });
                details.save();
              }

              var latest = await orderTable.find({}).sort({_id:-1}).limit(1);
              var assignOrder = new assignTable({
                ID1:result.ID,
                ID2:latest[0]._id,
                status:"0"
              })

              assignOrder.save();

              var farm = await farmCart.deleteMany({ID1:ID});
              var shop = await shopCart.deleteMany({ID1:ID});
              startGenesisBlock(latest[0]._id);
              res.render("order_success",{date:date,month:month,yr:yr});
                }
            }
        })
        
      }
    })
  }
  else{
    res.redirect("/");
  }

  }else {
    res.redirect("/login");
}
})


app.post("/orderRedirect",(req,res)=>{
    res.redirect("/");
})
  

app.get("/cart", function(req, res){
  if (req.isAuthenticated()){
        if(req.user.Role=="User"){
        farmCart.find({ID1:ID},(err,list1)=>{
          if(err){
            console.log(err)
          }
          else{
            shopCart.find({ID1:ID},(err,list2)=>{
              if(err){
                console.log(err)
              }
              else{
                console.log(list1)
                var cost=0;
                for(var i=0;i<list1.length;i++)
                  {
                    cost+=list1[i].price*list1[i].quantity;
                  }
                for(var i=0;i<list2.length;i++)
                  {
                    cost+=list2[i].price*list2[i].quantity;

                  }
                res.render("cart", {loggedIn: 1, page: 6, cart1: list1,cart2:list2,cost});
              }
            })
            
          }
        })
      }
      else{
        res.redirect("/");
      }
    }
  else {
    res.redirect("/login");
  }
});

app.post('/saveCart',async (req,res)=>{
  if(req.isAuthenticated()){
    if(req.user.Role=="User"){
    farmCart.find({ID1:ID},(err,list1)=>{
      if(err){
        console.log(err)
      }
      else{
        shopCart.find({ID1:ID},async(err,list2)=>{
          if(err){
            console.log(err)
          }
          else{
            var i=0;
            console.log(req.body);
            var obj = Object.entries(req.body);
            for(;i<obj.length-1;i++){
              const farm = await farmCart.findOne({ ID2: obj[i][0] });
              if(farm){
                if(obj[i][1]==0){
                  var farmupdate = await farmCart.deleteOne({ID2: obj[i][0]})
                }
                else
                var farmupdate = await farmCart.findOneAndUpdate({ID2: obj[i][0]}, {quantity:obj[i][1]});
                continue;
              }
              const shop = await shopCart.findOne({ ID2: obj[i][0] });
              if(shop){
                if(obj[i][1]==0){
                  var shopupdate = await shopCart.deleteOne({ID2: obj[i][0]})
                }
                else
                var shopupdate = await shopCart.findOneAndUpdate({ID2: obj[i][0]}, {quantity:obj[i][1]});
              }
            

            }
            if(obj[i][1]=="1")
            res.redirect("/shop");
            else{
              res.redirect("/checkout");
            }
          }
        })
        
      }
    })
  }
  else{
    res.redirect("/");
  }
  }
  else{
    res.redirect("/login");
  }
})

app.get("/cart/deletefarm/:id",function(req,res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
    var id = req.params.id
    //find product 
    farmCart.deleteOne({ID2:id},(err)=>{
      if(err){
        console.log(err);
      }
    })
    res.redirect("/cart");
  }
  else{
    res.redirect("/");
  }
  }else {
    res.redirect("/login");
  } 
});



app.get("/cart/deleteshop/:id",function(req,res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
    var id = req.params.id
    //find product 
    shopCart.deleteOne({ID2:id},(err)=>{
      if(err){
        console.log(err);
      }
    })
    res.redirect("/cart");
  }
  else{
    res.redirect("/");
  }
  }else {
    res.redirect("/login");
  } 
});

app.get("/cart/addfarm/:id",function(req,res){
  if (req.isAuthenticated()){
    if(req.user.Role=="User"){
    var id = req.params.id

    Product_farmer.find({ _id: id}, function (err, product) {
      if (err){
        console.log(err);
      }
      else{
        //
        var product = new farmCart({
          ID1: ID,
          ID2: product[0]._id,
          name:product[0].ProductName,
          price:product[0].UnitOfPrice,
          quantity:1,
          picture:product[0].Picture,
          Category:product[0].Category
        });
        product.save();
        res.redirect("/shop");
      }});
    }
    else{
      res.redirect("/");
    }

    }else {
      res.redirect("/login");
    } 
});

app.get("/cart/addshop/:id",function(req,res){
  if (req.isAuthenticated()){
    var id = req.params.id
    Product_shopkeeper.find({ _id: id}, function (err, product) {
      if (err){
        console.log(err);
      }
      else{

        //
        var product = new shopCart({
          ID1: ID,
          ID2: id,
          name:product[0].ProductName,
          price:product[0].UnitOfPrice,
          quantity:1,
          picture:product[0].Picture,
          Category:product[0].Category
        });
        product.save();
        res.redirect("/shop");
      }});

    }else {
      res.redirect("/login");
    } 
});


app.post("/delivered",async (req,res)=>{
  if (req.isAuthenticated()){
    if(req.user.Role=="Delivery Partner"){
    // console.log(req.body)
    var obj = Object.entries(req.body);
    let value=obj[0][1];
    let status
    if(value==1){
      status = await assignTable.findOneAndUpdate({_id: obj[0][0]}, {status:"2"});
      let order=await assignTable.find({_id: obj[0][0]});
      addNewBlock(2, order[0].ID2);
    }
    else{
      let order=await assignTable.find({_id: obj[0][0]});
      addNewBlock(3, order[0].ID2);
      status = await assignTable.findOneAndUpdate({_id: obj[0][0]}, {status:"3"});
    }
    res.redirect('/deliveryList') 
    }
    else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
})

app.post("/pickedUp",async (req,res)=>{
  if (req.isAuthenticated()){
    if(req.user.Role=="Shop Owner"||req.user.Role=="Farmer"){
      await orderDetails.findOneAndUpdate({_id: req.body.Status}, {status:true});
      let details = await orderDetails.find({_id: req.body.Status});
      let ordDetails = await orderDetails.find({ID3: details[0].ID3});
      let Myorders = await assignTable.find({ID2: details[0].ID3});
      let count=0;
      for(let j=0;j<ordDetails.length;j++){
        if(ordDetails[j].status==true) count++;
        if((count===ordDetails.length)&&Myorders[0].status=="0"){
          await assignTable.findOneAndUpdate({_id: Myorders[0]._id}, {status:"1"});
          console.log(details[0].ID3);
          addNewBlock(1, details[0].ID3);
        }
      }
      res.redirect('/OrderList');
    }
    else{
      res.redirect("/");
    }
  }else{
    res.redirect("/login");
  }
})

app.get("/deliveryList",async (req,res)=>{
  if (req.isAuthenticated()){
    if(req.user.Role=="Delivery Partner"){
    //fetch from table
        var orders=[];
        var ordDetails=[];
        var products=[];
        let Myorders = await assignTable.find({ID1:ID});

        for(var j=0;j<Myorders.length;j++){
          let order = await orderTable.find({_id:Myorders[j].ID2});
          let orderDetail = await orderDetails.find({ID3:Myorders[j].ID2});
          orders[j] = order[0];
          ordDetails[j] = orderDetail;
        }
        var k=0,count=0;

        Myorders = await assignTable.find({ID1:ID});
        
        for(let i=0;i<ordDetails.length;i++){
          for(let j=0;j<ordDetails[i].length;j++){
            Product_farmer.find({_id: ordDetails[i][j].ID2}, function (err, product1) {
            if (err){
              console.log(err);
            }
            else{
              if(product1[0]!=null){
                information_farmer.find({ID: product1[0].ID}, function(err, farmer){
                  if (err){
                    console.log(err);
                  }
                  else{
                    if(farmer[0]!=null)
                    products[k++]=[product1[0].ProductName, farmer[0].Name, farmer[0].Address, ordDetails[i][j].ID3];
                  }
                  if(i==ordDetails.length-1&&j==ordDetails[i].length-1){
                    console.log(products);
                    res.render("delivery",{orders:orders,Myorders:Myorders, ordDetails: ordDetails, loggedIn: 4, page: 11, products: products});
                  }
                });
              }
              }
            });
            Product_shopkeeper.find({_id: ordDetails[i][j].ID1}, function (err, product2) {
            if (err){
              console.log(err);
            }
            else{
              if(product2[0]!=null){
                information_shopkeeper.find({ID: product2[0].ID}, function (err, shop){
                  if (err){
                    console.log(err);
                  }
                  else{
                    if(shop[0]!=null)
                    products[k++]=[product2[0].ProductName, shop[0].Name, shop[0].Address, ordDetails[i][j].ID3];
                  }
                  if(i==ordDetails.length-1&&j==ordDetails[i].length-1){
                    console.log(products)
                    res.render("delivery",{orders:orders,Myorders:Myorders, ordDetails: ordDetails, loggedIn: 4, page: 11, products: products}); 
                  } 
                });
              } 
               }
            });
          }
        }
      }
      else{
        res.redirect("/");
      }
  }
  else{
    res.redirect("/login");
  }
});

app.get("/OrderList",async (req,res)=>{
  if (req.isAuthenticated()){
    if(req.user.Role=="Shop Owner"||req.user.Role=="Farmer"){
    //fetch from table
        var ordDetails=[];
        var products=[];
        var ordDetails = await orderDetails.find({});

        var k=0;
        for(let i=0;i<ordDetails.length;i++){
            if(ordDetails[i].ID2!=null){
              await Product_farmer.find({_id: ordDetails[i].ID2}, function (err, product1) {
              if (err){
                console.log(err);
              }
              else{
                if(product1[0]!=null){
                  if(ID==product1[0].ID){
                    products[k++]=[product1[0]._id, ordDetails[i].ID3];
                  }
                }
                if(i==ordDetails.length-1){
                  console.log("Hello");
                  Product_farmer.find({}, function (err, product1) {
                    if (err){
                      console.log(err);
                    }
                    else{
                      Product_shopkeeper.find({}, function (err, product2) {
                        if (err){
                          console.log(err);
                        }
                        else{
                          console.log(ordDetails);
                          if(req.user.Role=="Farmer")
                            res.render("Order", {ordDetails: ordDetails, loggedIn: 2, page: 12, products: products, product1: product1, product2: product2});
                          else
                            res.render("Order", {ordDetails: ordDetails, loggedIn: 3, page: 12, products: products, product1: product1, product2: product2});
                        }
                      });
                    }
                  });
                }
              }
            });
          }
          if(ordDetails[i].ID1!=null){
            await Product_shopkeeper.find({_id: ordDetails[i].ID1}, function (err, product2) {
            if (err){
              console.log(err);
            }
            else{
              if(product2[0]!=null){
                if(ID==product2[0].ID){
                  products[k++]=[product2[0]._id, ordDetails[i].ID3];
                }              
              }
              if(i==ordDetails.length-1){
                console.log("Hello");
                Product_farmer.find({}, function (err, product1) {
                  if (err){
                    console.log(err);
                  }
                  else{
                    Product_shopkeeper.find({}, function (err, product2) {
                      if (err){
                        console.log(err);
                      }
                      else{
                        console.log(ordDetails);
                        if(req.user.Role=="Farmer")
                          res.render("Order", {ordDetails: ordDetails, loggedIn: 2, page: 12, products: products, product1: product1, product2: product2});
                        else
                          res.render("Order", {ordDetails: ordDetails, loggedIn: 3, page: 12, products: products, product1: product1, product2: product2});
                      }
                    });
                  }
                });
              }
            }
          });
        }
      }

      if(ordDetails.length==0){
        res.redirect("/");
      }
    }
    else{
      res.redirect("/");
    }
  }
  else{
    res.redirect("/login");
  }
});


app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    ID=req.user.id;
    User.findById(req.user.id, function(err, foundUser){
        if (err){console.log(err);}
        else{
          if(foundUser){
              res.redirect("/");
          }
        }
    });
  }else{
    res.redirect("/login");
  }
});


app.post("/gmail", function(req, res){
    var mail = req.body.email;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'usersqueries@gmail.com',
        pass: 'Thanos12#'
      }
    });

    var mailOptions = {
      from: 'usersqueries@gmail.com',
      to: 'ballalshrinidhi@gmail.com',
      subject: 'Query',
      text: mail
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
});




app.post("/details", upload, function(req, res){
  if (req.isAuthenticated()){
    if(req.user.Role=="Farmer"){
      var name, update;
      if(req.file!=null){
        name=req.file.filename;
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
            imagename: name 
          }};
      }
      else{
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
          }};
      }

      var query = { ID: ID};

      var options = { upsert: true };

      information_farmer.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
      res.redirect("/");
  }
  else if(req.user.Role=="Shop Owner"){
    var name, update;
      if(req.file!=null){
        name=req.file.filename;
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
            imagename: name 
          }};
      }
      else{
        update = { $set: 
          { 
            ID: ID,
            Name: req.body.username,
            Address: req.body.Address,
            tin: req.body.TIN,
            gmail: req.body.email, 
            adhaarNumber: req.body.Adhaar,
            about: req.body.self,
          }};
      }

      var query = { ID: ID};

      var options = { upsert: true };

      information_shopkeeper.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
      res.redirect("/");
    }
    else if(req.user.Role=="Delivery Partner"){
      var name, update;

        if(req.file!=null){
          name=req.file.filename;
          update = { $set: 
            { 
              ID: ID,
              Name: req.body.username,
              Address: req.body.Address,
              tin: req.body.TIN,
              gmail: req.body.email, 
              adhaarNumber: req.body.Adhaar,
              about: req.body.self,
              imagename: name 
            }};
        }
        else{
          update = { $set: 
            { 
              ID: ID,
              Name: req.body.username,
              Address: req.body.Address,
              tin: req.body.TIN,
              gmail: req.body.email, 
              adhaarNumber: req.body.Adhaar,
              about: req.body.self,
            }};
        }
  
        var query = { ID: ID};
  
        var options = { upsert: true };
  
        information_delivery.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
        res.redirect("/");
      }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login");
  }
});

app.post("/Add_products_farmer", upload, function(req, res){
  if (req.isAuthenticated()){
    var name, update;
    if(req.file!=null){
      name="images/"+req.file.filename;
      update = { $set: 
        { 
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Picture: name,
          Category:req.body.category
        }};
    }
    else{
      update = { $set: 
        { 
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Category:req.body.category
        }};
    }
    var add=req.body.address;
    console.log(add+"-add");
    if(add!=0){
      var query = { _id: add};
      var options = { upsert: true };
      Product_farmer.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated"); res.redirect("/Products_farmer");};});
    }
    else{
        var product = new Product_farmer({
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Picture: name,
          Category:req.body.category
        });
        Product_farmer.create(product, function(err){
          if(err){
            console.log(err);
          }
          else{
            res.redirect("/Products_farmer");
          }
        });
    }
  }
  else{
    res.redirect("/login");
  }

});

app.post("/Add_products_shopkeeper", upload, function(req, res){
  if (req.isAuthenticated()){
    var name, update;
    if(req.file!=null){
      name="images/"+req.file.filename;
      update = { $set: 
        { 
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Picture: name,
          Category:req.body.category
        }};
    }
    else{
      update = { $set: 
        { 
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Category:req.body.category
        }};
    }
    var add=req.body.address;
    console.log(add+"-add");
    if(add!=0){
      var query = { _id: add};
      
      var options = { upsert: true };
      Product_shopkeeper.updateOne(query, update, options, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated"); res.redirect("/Products_shopkeeper");};});
    }
    else{
      var product = new Product_shopkeeper({
          ID: ID,
          ProductName: req.body.name,
          UnitOfMeasure: req.body.unit,
          UnitOfPrice: req.body.Price,
          Description: req.body.Description,
          Picture: name,
          Category:req.body.category
        });
        Product_shopkeeper.create(product, function(err){
          if(err){
            console.log(err);
          }
          else{
            res.redirect("/Products_shopkeeper");
          }
        });
    }
  }
  else{
    res.redirect("/login");
  }

});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/delete/:item", function(req, res){
  var id=req.params.item;
  if(req.user.Role=="Farmer"){
    Product_farmer.deleteOne({_id: id}, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
    Review.deleteMany({ID2: id}, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
    res.redirect("/Products_farmer");
  }
  else if(req.user.Role=="Shop Owner"){
    Product_shopkeeper.deleteOne({_id: id}, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
    Review.deleteMany({ID1: id}, function(error){if(error){console.log(error);}else{console.log("Sucessfully updated");};});
    res.redirect("/Products_shopkeeper");
  }  
});

app.post("/register", function(req, res){
  console.log(req.body.Role);
  User.register({username: req.body.username, Role: req.body.Role}, req.body.password, function(err, user){
      if (err) {console.log(err);res.redirect("/register");}
      else{passport.authenticate("local")(req, res, function(){res.redirect("/secrets");});
    }
  });

});

app.post('/login', function(req, res, next) {
    /*This creates a new user or tuples in the table, 
    this is called the document in this case. */
    /*This creates the js object for the authentication.*/
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/secrets');
    });
  })(req, res, next);

});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
