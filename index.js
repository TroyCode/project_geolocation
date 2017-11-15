var express = require("express");
var https = require("https");
var bodyParser = require("body-parser");
var request = require("request");
var fs = require("fs");
var mongo = require("mongodb");
var PORT = process.env.PORT || 8080;
const path = require("path")

// var privateKey = fs.readFileSync('./private.pem', 'utf8');
// var certificate = fs.readFileSync('./file.crt', 'utf8');
// var credentials = {key: privateKey, cert: certificate};

var app = express();
// var httpsServer = https.createServer(credentials,app);
var router = require("./router.js");

var event_id;
var name;

app.set("view engine","ejs");
// app.set("views","./project_geolocation/views");
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.get("/",router.getHomepage);

app.get("/calendar",router.getCalendar);

app.post("/sendevent",router.sendevent);

app.post("/sendposition",router.sendposition);

app.post("/getdata",router.getdata);

app.post("/getDestination",router.getDestination);

// httpsServer.listen(8081,function(){
//   console.log("https server on port 8081");
// })

app.listen(PORT,function(){
  console.log(`server on port ${PORT}`);
})

module.exports = app
