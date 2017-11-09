const request = require("request");
const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/users";

exports.getHomepage = function(req,res,next){
  res.render("index");
}

exports.getCalendar = function(req,res,next){
  res.render("calendar");
}

exports.sendevent = function(req,res,next){
  var tmp = req.body;
  var myEmail = tmp.attendees[findMe(tmp.attendees)].email;
  var myName = tmp.attendees[findMe(tmp.attendees)].displayName;

  var evt = {
    "evtID": tmp.id,
    "attendees": tmp.attendees,
    "destination": tmp.location
  }
  var pos = {
    "evtID": tmp.id,      
    "email": myEmail,
    "name": myName,      
    "position":[]
  }

  insert(url,"event",{"evtID": tmp.id},evt);
  insert(url,"position",{"evtID": tmp.id,"email": myEmail},pos);
  res.end();
}

exports.sendposition = function(req,res,next){
  var tmp = req.body;
  var myEmail = tmp.attendees[findMe(tmp.attendees)].email;
  var myName = tmp.attendees[findMe(tmp.attendees)].displayName;
  
  updatePos(url,{"evtID":tmp.id,"email": myEmail},tmp.position)
  res.end();
}

exports.getdata = function(req,res,next){
  var tmp = req.body;
  var myEmail = tmp.attendees[findMe(tmp.attendees)].email;

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("position").find({"evtID":tmp.event_id,"email":{ $ne:myEmail }}).toArray(function(err, result) {
      if (err) throw err;
      db.close();
      res.send(result);
    });
  });
}

exports.getDestination = function(req,res,next){
  if(req.body.location){
    const options = {
      url: "https://maps.googleapis.com/maps/api/geocode/json?address="+ req.body.location +"&key=AIzaSyBUVMPkDskVQlUsdw92-Ygv9qhIB0UOQH4",
      method: "POST",
      body: "",
      json: true
    };
    request(options,function(err,response,body){
      var tmp = {
        "position":body.results[0].geometry.location
      };
      res.send(tmp);
    })
  }
  else{
    res.send({errMsg:"Calendar Destination is illegal"})
  }
}

function insert(url,table,filter,data){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection(table).findOne(filter, function (err, result) {
      if (err) throw err;
      if (!result) {
        db.collection(table).insertOne(data,function(err,res){
          if (err) throw err;
          console.log(`1 ${table} inserted`);
          db.close();
        })
      }   
    });
  })
}

function updatePos(url,filter,data){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("position").findOne(filter, function(err, result) {
        if (err) throw err;

        var pos = result.position;
        data.lat = Number(data.lat)
        data.lng = Number(data.lng)
        pos.push(data)

        var newpos = {$set:{"position":pos}};

        db.collection("position").updateOne(filter, newpos, function(err, res) {
          if (err) throw err;
          console.log(`${result.name}'s position updated`);
          db.close();
        });
    });
  })
}

function findMe(arr){
  for(let i = 0;i < arr.length;i++){
    if(arr[i].self){
      return i
    }
  }
  return false
}
exports.findMe = findMe
