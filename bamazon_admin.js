var inquirer = require("inquirer");
var moment=require("moment");
require('dotenv').config();
var mysql      = require('mysql');
var cliTable = require("cli-table");

//var db_name=process.env.db_name;
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_name
});
 

 var loginUser;
 var loginPW;
 var userList=[];//used when adding new user(s)
 var usersArray=[];
 var badAttempts=0;
 var activeUser={};

//get all the users from the users table for login, etc


var  getInformationFromDB = function(callback) {
   // usersArray=[];
    connection.connect();
    connection.query('SELECT * FROM USERS', function(err, res, fields)
{
    if (err)  return callback(err);
     if(res.length){
    for(var i = 0; i<res.length; i++ ){     //add each result item into the users array
        usersArray.push(res[i]);
        }
     }
   callback(null, usersArray);
   
});

};
//run this code when the app loads

getInformationFromDB(function (err, result) {
  if (err) {
      console.log("There was a problem connecting to the database.");
      process.exit(99);
    }
  else {
    login();
    }
  
  
});

//lets get this party started

//in case the user is clever and tries to give the application an extra argument 

var command = process.argv[2];

if(command=="whatup"){
    console.log("Hey homie, how's it going?\nYou're pretty awesome you know.\nHave a great day.")
    process.exit(0);
}
else if(command){
    console.log("\n=======================================================================\nThis is the Admin Portal application for Bamazon.\nAccess is limited to authorized Bamazon personnel only.\nRun the app and login at the prompts provided.\nYou will be presented with a series of options based on your user role.\nIf you have any issues using the system, please contact the help desk.\n=======================================================================\n");
    process.exit(0);
}

//functions

function deleteUser(userid){
//    connection.connect();
 var user=userid;
    connection.query(
    'DELETE FROM  BAMAZON_DB.USERS  WHERE ??=?',['USER_ID',user], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
    console.log(user+" has been deleted.");
    getAdminAction();
});

}
function updateUser(attr,value,userid){
    //connection.connect();
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

}
function addUser(valuesArray){
   //
   // connection.connect();
  //  var newUserValues=valuesArray;
    console.log("\nXXXXXXXXXXXXXXXXXXXXXXXXXXX:"+valuesArray[0]);
    var sql="INSERT INTO bamazon_db.users (EMP_ID, USER_ID, NAME, USER_ROLE, PW,LAST_LOGIN_DT) VALUES ?";
    connection.query(sql,[valuesArray], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
    console.log("New User added successfully.");
    getAdminAction();
    });
    
   
}

function login(){
    
   // console.log("login userarray:\n"+usersArray);
  //  console.log(usersArray[1].NAME);
    console.log("Welcome to the Bamazon Admin Portal.");
    inquirer.prompt(
        [{
        name:"username",
        type:"input",
        message:"User Name:"
            },
        {
        name:"password",
        type:"password",
        mask:"*",
        message:"Password:"   
        }],
        (err)=>{
            console.log("It appears you are having difficulty. Please contact the help desk.");
            process.exit(99);
        }
    ).then(function(response,error){
        var inputName=response.username.toLowerCase();//change user name input to lower case
       // console.log("username input:"+inputName);
        var inputPW=response.password;
        var check=false;
        for (var i=0;i<usersArray.length;i++){
           // console.log("inputName:"+inputName+" checkName: "+usersArray[i].USER_ID);
            var userLower=usersArray[i].USER_ID.toLowerCase();//change user table value to lowercase
            if (userLower==inputName){
                check=true;
                activeUser=usersArray[i];
            }
        }
        // var filterObj = usersArray.filter(function(x) {
        //     return x.NAME == inputName;
        //   });
        // console.log(filterObj);
        // activeUser=filterObj;
       // console.log(i);
       // console.log(check);
       // console.log(activeUser.NAME);
       // console.log(usersArray);
        if (error) throw error;
        if (!check){

            if (badAttempts==2){
                console.log("It appears you are having difficulty. Please contact the help desk.");
                process.exit(99);
            }
            else{
                console.log("That username does not match our records.");
                badAttempts++;
                login();}
        }
        else {
        
        var storedPW=activeUser.PW;
        var name=toTitleCase(activeUser.NAME);
        name=name.substr(0,name.indexOf(' '));
        
        if (storedPW!==inputPW) {
            console.log("That password does not match our records")
            login();
        }
        else {
            console.log("Welcome, "+name+".");
            getAdminAction();
        }
    }
    });
    }//end login function
 
function toTitleCase(str)
    {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }   
    


function getAdminAction(){
    console.log("made it to admin action homeboy");
    var now = 0;
    now=moment().format("MMMM D, YYYY hh:mm a");
    inquirer.prompt({
        type: "list",
      message: "Current date and time: "+now+".\nWhat would you like to do?",
      choices: ["Add User","Delete User", "Edit User","View User Activity","Supervisor Actions","Manager Actions","Log Out"],
      name: "action"
    }).then(function(response){
        if(response.action=='Log Out'){
            logOut();
        }
        else if (response.action=='Add User'){
            getUserDetails();
        }
        else {
            console.log("That isn't functional yet.");
            getAdminAction();
        }
    });
}

function logOut(){
    console.log("Thank you for using the Bamazon Admin Portal, "+user+".\nHave a great day.")
    connection.end();
    process.exit(0);
}
//EMP_ID, USER_ID, NAME, USER_ROLE, PW
function getUserDetails(){
    var detailsArray=[];
    inquirer.prompt(
        [{
        name:"empid",
        type:"input",
        message:"6-Digit Employee ID:"
            },
        {
        name:"userid",
        type:"input",
        message:"System User ID:"   
        },
        {
        name:"name",
        type:"input",
        message:"Full Name:"   
        },
        {
        name:"role",
        type:"list",
        choices:["MGR","SUP","ADMIN"],
        message:"User Role"   
        },
        {
        name:"password",
        type:"input",
        message:"Password:"   
        }
    ],
        (err)=>{
            console.log("It appears you are having difficulty. Please contact the help desk.");
            process.exit(99);
        }
    ).then(function(response,error){//create array of arrays for insert statement

        var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
        var detailsArray= [[response.empid,response.userid,response.name,response.role,response.password,timestamp]];
       // detailsArray[4].push(timestamp);
        console.log("details array: "+detailsArray);
        addUser(detailsArray);
    })
    }


