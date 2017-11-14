
function getDateTime(time) {
  var date = new Date(time);
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

function checkTime(st){
  var des = new Date(st).getTime()
  var now = Date.now()
  var diff = des - now
  return diff
}

module.exports = {
  getDateTime,
  checkTime
}