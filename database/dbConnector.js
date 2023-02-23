var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 50,
  host: "sql12.freemysqlhosting.net",
  user: "sql12600308",
  password : "rysWCnxEmq",
  port  : 3306,
  database : "sql12600308"
});



module.exports = pool;