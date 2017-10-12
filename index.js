var express = require('express');
var https = require("https");
var bodyParser = require("body-parser");
var request = require("request");
var fs = require("fs");
var mongo = require("mongodb");
// var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
// var passport = require("passport")

// var privateKey = fs.readFileSync('./private.pem', 'utf8');
// var certificate = fs.readFileSync('./file.crt', 'utf8');
// var credentials = {key: privateKey, cert: certificate};

var app = express();
var MongoClient = require('mongodb').MongoClient;
// var httpsServer = https.createServer(credentials,app);
var pos = require("./geolocation/far_pos.json");
var all_pos = require("./data.json");

var url = "mongodb://localhost:27017/users";
// var url = "mongodb://10.102.250.102:27017/position";

var event_id;
var name;


app.set("view engine","ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/",function(req,res,next){
  res.render("index");
})
app.get("/geolocation",function(req,res,next){
  var tmp = "";
  const options = {
    url: "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBtLdMhgwM1UN5bRNt7OT1y5rvUQmhpbPM",
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: pos,
    json: true
  };
  request(options,function(err,response,body){
    tmp = body.location;
    console.log(body);
    res.render("cellid",tmp)
  })
})

app.get("/form",function(req,res,next){
  res.render("form");
})

app.post("/send",function(req,res,next){
  var tmp = req.body;
  // console.log(tmp)
  // var myobj = {"name":tmp.ID,"position":{"lat":tmp.lat,"lng":tmp.lng}};
  var myquery = {"event_id":event_id,"name": name};
  var newvalues = {$set:{"position":{"lat":tmp.lat,"lng":tmp.lng}}};

  // var temp = fs.readFileSync("./data.json");
  // var json = JSON.parse(temp);
  // json[tmp.ID] = {lat: tmp.lat, lng: tmp.lng};
  // console.log(json);
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    // db.collection("position").findOne({"event_id":tmp.event,"name": tmp.ID}, function(err, result) {
      // if (err) throw err;
      // if(!result){
      //   db.collection("users").insertOne(myobj, function(err, res) {
      //     if (err) throw err;
      //     console.log("1 document inserted");
      //   });
      // }
      // else{
        db.collection("position").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
      // }
    // });
  });

  // if(json.hasOwnProperty(tmp.ID)){
  //   console.log(json);
  //   json[ID].lat = tmp.lat;
  //   json.ID.lng = tmp.lng;
  // }
  // else{
  //   json[tmp.ID] = [{lat: tmp.lat, lng: tmp.lng}];
  // }
  // json.position.push({
  //   ID: tmp.ID,
  //   lat: tmp.lat,
  //   lng: tmp.lng
  // });
  
  // var obj = JSON.stringify(json);
  // fs.writeFileSync("./data.json",obj);
  // console.log(json);
  res.end('123');
})

app.get("/getdata",function(req,res,next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("position").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.send(result);
    });
  });

  // var temp = fs.readFileSync("./data.json");
  // var json = JSON.parse(temp);
  // res.send(json);

  // res.send("<div> lat: " + json.position[0].lat +"</div>" + "<div> lng: " + json.position[0].lng + "</div>");
})

app.get("/marker",function(req,res,next){
  res.render("marker");
})
app.get("/calendar",function(req,res,next){
  res.render("calendar");
})

app.post("/current",function(req,res,next){
  var tmp = JSON.parse(req.body.data)
  console.log(tmp);

  var myobj = {
    "event_id":tmp.id,
    "attendees":tmp.attendees,
    "destination":tmp.location,
    "time":{"start":tmp.start.dateTime,"end":tmp.end.dateTime},
    "summary":tmp.summary};
 
        // console.log(tmp.attendees)
    var temp_n = "";
    for(let key in tmp.attendees){
      if(tmp.attendees[key].self){
        temp_n = tmp.attendees[key].email;
        break;
      }
    }
    var myobj_p = {
      "event_id":tmp.id,      
      "name"    : temp_n,      
      "position":{"lat":0,"lng":0}
    };
    // console.log(myobj_p)
    event_id = tmp.id;
    name = temp_n;
    
  // var myquery = {"name":tmp.ID};
  // var newvalues = {$set:{"position":{"lat":tmp.lat,"lng":tmp.lng}}};

  // var temp = fs.readFileSync("./data.json");
  // var json = JSON.parse(temp);
  // json[tmp.ID] = {lat: tmp.lat, lng: tmp.lng};
  // console.log(json);
  
  var filter = {"event_id": myobj_p.event_id,"name": myobj_p.name};
  var updata_t = {$set:{"position":{"lat":0,"lng":0}}};


  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("events").findOne({"event_id": tmp.id}, function(err, result) {
      if (err) throw err;
      if(!result){
        db.collection("events").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
      }
      // else{
      //   db.collection("position").updateOne(myquery, newvalues, function(err, res) {
      //     if (err) throw err;
      //     console.log("1 document updated");
      //   });
      // }     
    });
    db.collection("position").findOne({"event_id": myobj_p.event_id,"name": myobj_p.name}, function(err, result) {
      if (err) throw err;
      if(!result){
        db.collection("position").insertOne(myobj_p, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
      }
      // else{
      //   db.collection("position").updateOne(filter,updata_t, function(err, res) {
      //     if (err) throw err;
      //     console.log("1 document updated");
      //   });
      // }
      db.close();        
    });
  });




  const options = {
    url: "https://maps.googleapis.com/maps/api/geocode/json?address="+ tmp.location +"&key=AIzaSyBUVMPkDskVQlUsdw92-Ygv9qhIB0UOQH4",
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: '',
    json: true
  };
  request(options,function(err,response,body){
    var tmp2 = {
      "event_id":tmp.id,
      "name":temp_n,
      "position":body.results[0].geometry.location
    };

    res.render("position",tmp2);
  })
  // res.end();
})

// httpsServer.listen(8081,function(){
//   console.log("https server on port 8081");
// })

app.listen(8080,function(){
  console.log("server on port 8080");
})