var express = require('express');
// var https = require("https");
var bodyParser = require("body-parser");
var request = require("request");
var fs = require("fs");

var app = express();
var pos = require("./geolocation/far_pos.json");
var all_pos = require("./data.json")

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

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
    // res.send(body.location);
    res.render("cellid",tmp)
  })
})

app.get("/form",function(req,res,next){
  res.render("form");
})

app.post("/send",function(req,res,next){
  var tmp = req.body;
  var temp = fs.readFileSync("./data.json");
  var json = JSON.parse(temp);
  json[tmp.ID] = {lat: tmp.lat, lng: tmp.lng};
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
  var obj = JSON.stringify(json);
  fs.writeFileSync("./data.json",obj);
  console.log(json);
  res.end();
})

app.get("/getdata",function(req,res,next){
  var temp = fs.readFileSync("./data.json");
  var json = JSON.parse(temp);
  res.send(json);
  // res.render("all",json)
  // res.send("<div> lat: " + json.position[0].lat +"</div>" + "<div> lng: " + json.position[0].lng + "</div>");
})

app.get("/marker",function(req,res,next){
  res.render("marker");
})

app.get("/current",function(req,res,next){
  res.render("current_pos");
})

app.listen(8080,function(){
  console.log("server on port 8080");
})