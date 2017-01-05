const express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
// Constants
const PORT = 8080;
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'kmutt_student'
});


// App
const app = express();
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);


// getCheckedIn อันนี้เอาใว้ใช้เรียกรายชื่อคนที่เข้าร่วมทั้งหมด ทั้ง late และไม่ late และเรียงตามเวลาที่เข้า checkd in
getCheckedIn = (callback)=>{
  connection.query('SELECT * FROM student WHERE Checkin>0 order by Time desc',function(err, rows, field){
    if(!err)
      callback(rows,field)
    else {
      console.log('Error while performing Query');
    }
  })
}
//getCheckedIn2 เอาใว้ใช้ เรียกรายชื่อ คนที่เข้าร่วม แบบไม่ late เพราะตอนทำระบบสัมนา มันจะมีคนที่มา late อะ จะไม่่ได้รับการสุ่มรับของรางวัล
// โดยจะเช็คว่า 0 = ยังไม่มา check in , 1 = checked in ตามเวลาปกติ , 2 = chekd in late
getCheckedIn2 = (callback)=>{
  connection.query('SELECT * FROM student WHERE Checkin=1',function(err, rows, field){
    if(!err)
      callback(rows,field)
    else {
      console.log('Error while performing Query');
    }
  })
}
//doCheckIn คือการสั่ง checked in นั่นแหละ โดยส่ง rfid (รหัสนักศึกษา) เข้ามาแล้วจะทำการ query ไปที่ database ว่าเช็คอินแล้ว
doCheckIn = (rfid,callback)=>{
  connection.query('UPDATE student SET Checkin=1,Time=CURTIME() WHERE rfid='+rfid,function(err, rows, field){
    if(!err)
      callback(rows,field)
    else
      console.log("Error while performing Query");
  })
}


randomPerson = ()=>{

}

// Route
// ส่ง รายชื่อผู้เข้าร่วมทั้งหมดที่ไม่ late ไปหน้า random
app.get('/random',(req,res)=>{
  getCheckedIn2((rows,field)=>{
    res.render('random', {
      title: 'Random Page',
      rows: rows,
      checkinCount: rows.length
    });
  })
})

// ถ้าเข้ามาหน้าปกติพร้อม parameter เป็นรหัสนักศึกษา ระบบจะ
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
