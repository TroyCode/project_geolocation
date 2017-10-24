var request = require("request");
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/users";

exports.getHomepage = function(req,res,next){
  res.render("index");
}
exports.getCalendar = function(req,res,next){
  res.render("calendar");
}

exports.sendevent = function(req,res,next){
  var tmp=req.body;
  console.log(tmp);
  var myobj = {
    "event_id":tmp.id,
    "attendees":tmp.attendees,
    "destination":tmp.location,
    "time":{"start":tmp.start.dateTime,"end":tmp.end.dateTime},
    "summary":tmp.summary
  };
  var temp_me = "";
  var temp_disname="";
  for(let key in tmp.attendees){
    if(tmp.attendees[key].self){
      temp_me = tmp.attendees[key].email;
      temp_disname = tmp.attendees[key].displayName;
      break;
    }
  }
  var myobj_p = {
    "event_id":tmp.id,      
    "name"    : temp_me,
    "displayname":temp_disname,      
    "position":[]
  }
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    db.collection("events").findOne({"event_id": tmp.id }, function (err, result) {
      if (err) throw err;
      if (!result) {
        db.collection("events").insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("1 event inserted");
        });
      }
    });
    db.collection("position").findOne({"event_id": tmp.id,"name": temp_me}, function (err, result) {
      if (err) throw err;
      if (!result) {
        db.collection("position").insertOne(myobj_p,function(err,res){
          if (err) throw err;
          console.log("1 position inserted");
        })
      }     
    db.close();
    });
  });
  res.end();
}

exports.sendposition = function(req,res,next){
  console.log("enter send position")
  var tmp = req.body;
  var temp_me;
  var temp_disname;
  for(let key in tmp.attendees){
    if(tmp.attendees[key].self){
      temp_me = tmp.attendees[key].email;
      temp_disname = tmp.attendees[key].displayName;
      break;
    }
  }

  var myquery = {"event_id":tmp.id,"name": temp_me};

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("position").findOne(myquery,function(err,res){
      if (err) throw err;

      var tmp_p = res.position;
      tmp.position.lat = Number(tmp.position.lat);
      tmp.position.lng = Number(tmp.position.lng);
      tmp_p.push(tmp.position);

      var newvalues = {$set:{"position":tmp_p}};

      db.collection("position").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
    })
  });
  res.end();
}

exports.getdata = function(req,res,next){
  var tmp=req.body;
  // attendees key self exist?  true = temp_me (email)
  var temp_me = "";
  for(let key in tmp.attendees){
    if(tmp.attendees[key].self){
      temp_me = tmp.attendees[key].email;
      break;
    }
  }

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("position").find({"event_id":tmp.event_id,"name":{ $ne:temp_me }}).toArray(function(err, result) {
      if (err) throw err;
      console.log("mongoDB result")
      console.log(result);

      db.close();
      res.send(result);
    });
  });
}

exports.getDestination = function(req,res,next){
  var tmp = req.body;
  const options = {
    url: "https://maps.googleapis.com/maps/api/geocode/json?address="+ tmp.location +"&key=AIzaSyBUVMPkDskVQlUsdw92-Ygv9qhIB0UOQH4",
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: '',
    json: true
  };
  request(options,function(err,response,body){
    var tmp2 = {
      "position":body.results[0].geometry.location
    };

    res.send(tmp2);
  })
}