var inquirer = require("inquirer");

var mysql      = require('mysql');
var cliTable = require("cli-table");
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'Bk2=~%pqbV=ECC58',
  database : 'bamazon_db'
});
 
connection.connect();
 var user="DAVEWIL"
connection.query(
    'SELECT * FROM  BAMAZON_DB.USERS  WHERE ??=?',['USER_ID',user], function (error, results, fields) {
  if (error) throw error;
  //console.log(results[0]);
   console.log("user:",results[0].NAME);
   console.log("userid:",results[0].USER_ID);
   console.log("pw:",results[0].PW);
});
 
connection.end();