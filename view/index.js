// อันนี้ของเก่า Backup สำรองใว้

const express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
// Constants
const PORT = 8080;
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'kmutt_student'
});


// App
const app = express();
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');

getCheckedIn = (callback)=>{
  connection.query('SELECT * FROM student WHERE Checkin=1 order by Time',function(err, rows, field){
    if(!err)
      callback(rows,field)
    else {
      console.log('Error while performing Query');
    }
  })

}
doCheckIn = (rfid,callback)=>{
  connection.query('UPDATE student SET Checkin=1,Time=CURTIME() WHERE rfid='+rfid,function(err, rows, field){
    if(!err)
      callback(rows,field)
    else
      console.log("Error while performing Query");
  })
}
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

app.get('/',(req, res)=> {
  var rfid = req.query.rfid;
  if (rfid){
    doCheckIn(rfid,(rows,field)=>{
      var success = false
      if(rows.affectedRows==1)
        success = true;
        getCheckedIn((rows,field)=>{
          res.render('index', {
            title: 'Welcome',
            rows: rows,
            field: field,
            checkinCount: rows.length,
            success: success,
            notfound: !success,
          });
        })
    });
  } else {
    getCheckedIn((rows,field)=>{
      res.render('index', {
        title: 'Welcome',
        rows: rows,
        field: field,
        checkinCount: rows.length,
        success: false,
        notfound: false,
      });
    })
  }
});
