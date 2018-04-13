var inquirer = require("inquirer");
require('dotenv').config();
var mysql      = require('mysql');
var cliTable = require("cli-table");
var userList=[];//used when adding new user(s)
//var db_name=process.env.db_name;
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_name
});
 //sample db query code
connection.connect();
 var user="HOMESIM"
connection.query(
    'SELECT * FROM  BAMAZON_DB.USERS  WHERE ??=?',['USER_ID',user], function (error, results, fields) {
  if (error) throw error;
  //console.log(results[0]);
   console.log("user:",results[0].NAME);
   console.log("userid:",results[0].USER_ID);
   console.log("pw:",results[0].PW);
});
 
connection.end();
//lets get this party started
var command = process.argv[2];

if(command){
    console.log("\n=======================================================================\nThis is the Admin Portal application for Bamazon.\nAccess is limited to authorized Bamazon personnel only.\nRun the app and login at the prompts provided.\nYou will be presented with a series of options based on your user role.\nIf you have any issues using the system, please contact the help desk.\n=======================================================================\n");
    return;
}
function deleteUser(userid){
    connection.connect();
 var user=userid;
    connection.query(
    'DELETE FROM  BAMAZON_DB.USERS  WHERE ??=?',['USER_ID',user], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
    console.log(user+" has been deleted.");
    getAdminAction();
});
connection.end();
}
function updateUser(attr,value,userid){
    connection.connect();
 var user=userid;
 var newValue=value;
 var attribute=attr;
    connection.query(
    'UPDATE BAMAZON_DB.USERS SET ??=?  WHERE ??=?',[attribute,newValue,'USER_ID',user], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
    console.log("User "+user+" updated successfully.\nNew Role: "+role);
    getAdminAction();
});
connection.end();
}
function addUser(valuesArray){
    connection.connect();
 var newUserValues=valuesArray;
 var sql="INSERT INTO bamazon_db.users (EMP_ID, USER_ID, NAME, USER_ROLE, PW) VALUES ?"
 connection.query(sql,[userList], function (error, results, fields) {
  if (error) throw error;
  //console.log(results[0]);
   console.log("New User "+name+" added successfully.");
   getAdminAction();
});
 
connection.end();
}
