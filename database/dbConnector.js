var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : process.env.CONNECTION_LIMIT,
  host: process.env.HOST,
  user: process.env.USER,
  password : process.env.PASSWSORD,
  port  : process.env.DB_PORT,
  database : process.env.DB_NAME
});



module.exports = pool;