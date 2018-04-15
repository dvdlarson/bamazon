var inquirer = require("inquirer");
var moment=require("moment");
require('dotenv').config();
var mysql      = require('mysql');
var Table = require('cli-table');

//var db_name=process.env.db_name;
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_name
});
 

 var loginUser;
 var loginUserRole;
 var loginPW;
 var userList=[];//used when adding new user(s)
 var usersArray=[];
 var badAttempts=0;
 var activeUser={};

//get all the users from the users table for login, etc


 getInformationFromDB = function(callback) {
    usersArray=[];
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
   return usersArray;
   
});

};
//run this code to get all the users when the app loads

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
 console.log("user id:"+user);
 

 var newValue=value;
 var attribute=attr;
 var sql ='UPDATE BAMAZON_DB.USERS SET ??=?  WHERE ??=?'

    connection.query(sql,[attribute,newValue,'USER_ID',user], function (error, results, fields) {
        if (error){ 
            throw error;
            console.log("dumb db error that probably will never happen again");
            process.exit(99);
            }
        //console.log(results[0]);
        console.log("User "+user+" updated successfully.\nUpdated attribute: "+attribute+"\nNew Value: "+newValue);
        if(loginUserRole=="ADMIN")
        {getAdminAction();}
        else if(loginUserRole=="SUP"){getSupAction();}
        else if(loginUserRole=="MGR"){getMgrAction();}
        else {
            console.log("It appears you have no user role assigned. Please contact the help desk.");
            process.exit(99);
            };
    });
}
function addUser(valuesArray){
   //
   // connection.connect();
  //  var newUserValues=valuesArray;
   // console.log("\nXXXXXXXXXXXXXXXXXXXXXXXXXXX:"+valuesArray[0]);
   
    var sql="INSERT INTO bamazon_db.users (EMP_ID, USER_ID, USER_NAME, USER_ROLE, PW,LAST_LOGIN_DT) VALUES ?";
    connection.query(sql,[valuesArray], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
   // getInformationfromDB();
    console.log(usersArray);
    getAdminAction();
    });
    
   
}

function login(){
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
        var name=toTitleCase(activeUser.USER_NAME);
        loginUserRole=activeUser.USER_ROLE;
        console.log(loginUserRole);
        name=name.substr(0,name.indexOf(' '));
        
        if (storedPW!==inputPW) {
            console.log("That password does not match our records")
            login();
        }
        else {
            var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
            var usernm=activeUser.USER_ID;
            console.log("Welcome, "+name+".");
            updateUser("LAST_LOGIN_DT",timestamp,usernm);
            
        }
    }
    });
    }//end login function
 
function toTitleCase(str)
    {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }   
 
function getAdminAction(){
 //   console.log("made it to admin action homeboy");
    var now = 0;
    now=moment().format("MMMM D, YYYY hh:mm a");
    console.log("\n===============================\nAdministrator Action Menu\n===============================\n");
    inquirer.prompt({
        type: "list",
      message: "Current date and time: "+now+".\nWhat would you like to do?",
      choices: ["Add User","Delete User", "Edit User","View All Users","View User Activity","Supervisor Actions","Manager Actions","Log Out"],
      name: "action"
    }).then(function(response){
        if(response.action=='Log Out'){
            logOut();
        }
        else if (response.action=='Add User'){
            getUserDetails();
        }
        else if (response.action=='Reset User Password'){
            console.log("\n Not quite ready yet.");
            //editUser();
        }
        else if (response.action=='View All Users'){
            viewAllUsers();
        }
        else {
            console.log("That isn't functional yet.");
            getAdminAction();
        }
    });
}
function getMgrAction(){
    //   console.log("made it to admin action homeboy");
       console.log("\n===============================\nManager Action Menu\n===============================\n");
       var now = 0;
       now=moment().format("MMMM D, YYYY hh:mm a");
       inquirer.prompt({
           type: "list",
         message: "Current date and time: "+now+".\nWhat would you like to do?",
         choices: ["Add Product","Update Inventory","View All Products","Low Inventory Report","Log Out"],
         name: "action"
       }).then(function(response){
           if(response.action=='Log Out'){
               logOut();
           }
           else if (response.action=='Add Product'){
               getProductDetails();
           }
           else if (response.action=='Update Inventory'){
               updateInventory();
           }
           else if (response.action=='View All Products'){
               mgrShowProducts();
           }
           else if (response.action=='Low Inventory Report'){
                lowInventoryReport();
           }
           else {
               console.log("That isn't functional yet.");
               getMgrAction();
           }
       });
   }
function getSupAction(){
    //   console.log("made it to admin action homeboy");
       console.log("\n===============================\nSupervisor Action Menu\n===============================\n");
       var now = 0;
       now=moment().format("MMMM D, YYYY hh:mm a");
       inquirer.prompt({
           type: "list",
         message: "Current date and time: "+now+".\nWhat would you like to do?",
         choices: ["View Sales by Department","Create New Department","View All Products","Low Inventory Report","Manager Actions","Log Out"],
         name: "action"
       }).then(function(response){
           if(response.action=='Log Out'){
               logOut();
           }
           else if (response.action=='View Sales by Department'){
               getProductDetails();
           }
           else if (response.action=='Update Inventory'){
               updateInventory();
           }
           else if (response.action=='View All Products'){
               mgrShowProducts();
           }
           else if (response.action=='Low Inventory Report'){
                lowInventoryReport();
           }
           else if (response.action=='Supervisor Actions'){
                getSupAction();
           }
           else {
               console.log("That isn't functional yet.");
               getMgrAction();
           }
       });
   }
function logOut(){
    console.log("Thank you for using the Bamazon Admin Portal.\nHave a great day.")
    connection.end();
    process.exit(0);
}

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

function getUserNames(fnName){
        var sql="SELECT USER_NAME FROM BAMAZON_DB.USERS";
        connection.query(sql,function (error, results, fields) {
            if (error) {
                throw error;
                process.exit(99);
                console.log("getuserNames error");
            }
            //console.log(results[0]);
            console.log("query results"+results);
            fnName(results);
        });
}

function editUser(data) {
    var nameList=[];
    if(!data)
    {getUserNames(editUser);}
    else
    {
        for(var i=0;i<data.length;i++){
            console.log(data[i].USER_NAME);
            nameList.push(data[i].USER_NAME)
        }
        
        userChooser(nameList);
        console.log("targetuser:"+targetUser);

        var sql="SELECT * FROM BAMAZON_DB.USERS WHERE USER_NAME=?";//get user data
        connection.query(sql,[targetUser], function (error, results, fields) {
            if (error) throw error;
            //console.log(results[0]);
           var empid=results.EMP_ID;
           var userid=results.USER_ID;
           var name=results.USER_NAME;
           var role=results.USER_ROLE;
           var pw = results.PW;
           
            console.log(usersArray);
            getAdminAction();
            });

        sql="INSERT INTO bamazon_db.users (EMP_ID, USER_ID, USER_NAME, USER_ROLE, PW,LAST_LOGIN_DT) VALUES ?";
        connection.query(sql,[valuesArray], function (error, results, fields) {
        if (error) throw error;
        //console.log(results[0]);
        getInformationfromDB();
        console.log(usersArray);
        getAdminAction();
        });
        
        //get user 

       // console.log("editUser results: "+JSON.stringify(data));
    //getAdminAction();};

}}

function userChooser(array){
    inquirer.prompt({
        type: "list",
      message: "Please choose a user.",
      choices: array,
      name: "user"
    }).then(function(response,err){
        if (err) {
            throw err;
            console.log("error in userchooser");
            process.exit(99);
        }
        else { 
            return response.user;
        }
    })
}

function addProduct(valuesArray){
    //
    // connection.connect();
   //  var newUserValues=valuesArray;
    // console.log("\nXXXXXXXXXXXXXXXXXXXXXXXXXXX:"+valuesArray[0]);
    
     var sql="INSERT INTO bamazon_db.products (ITEM_CD, PROD_NM, PROD_DESC, DEPT_ID, PRICE,COST,ON_HAND_QTY,FEATURE_FLAG) VALUES ?";
     connection.query(sql,[valuesArray], function (error, results, fields) {
     if (error){ 
         throw error;
         process.exit(99);
        }
     //console.log(results[0]);
   //  getInformationfromDB();
     console.log("Product added successfully.");
     getSupAction();
     });
 }

function getProductDetails(){
    var detailsArray=[];
    inquirer.prompt(
        [{
        name:"itemcd",
        type:"input",
        message:"Item Code:"
            },
        {
        name:"prodnm",
        type:"input",
        message:"Product Name:"   
        },
        {
        name:"desc",
        type:"input",
        message:"Product Description:"   
        },
        {
        name:"deptid",
        type:"list",
        choices:["001","002"],
        message:"Choose Department"   
        },
        {
        name:"price",
        type:"input",
        message:"Price:"   
        },
        {
        name:"cost",
        type:"input",
        message:"Cost:"   
        },
        {
        name:"onhand",
        type:"input",
        message:"Inventory Quantity:"   
        },
        {
        name:"feature",
        type:"list",
        choices:["Y","N"],
        message:"Featured:"   
        }               
       //(ITEM_CD, PROD_NM, PROD_DESC, DEPT_ID, PRICE,COST,ON_HAND_QTY,FEATURED_FLAG)
    ],
        (err)=>{
            console.log("It appears you are having difficulty. Please contact the help desk.");
            process.exit(99);
        }
    ).then(function(response,error){//create array of arrays for insert statement

        var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
        var detailsArray= [[response.itemcd,response.prodnm,response.desc,response.deptid,response.price,response.cost,response.onhand,response.feature]];
       // detailsArray[4].push(timestamp);
        console.log("details array: "+detailsArray);
        addProduct(detailsArray);
    })
    }

function updateInventory(){
        inquirer.prompt(
            [{
            name:"itemcd",
            type:"input",
            message:"Item Code:"
                },
            {
            name:"onhand",
            type:"input",
            message:"New Inventory Quantity:"   
            }
        ],
            (err)=>{
                console.log("It appears you are having difficulty. Please contact the help desk.");
                process.exit(99);
            }
        ).then(function(response,error){//create array of arrays for insert statement
    
            var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
            var detailsArray= [response.itemcd,response.onhand];
            updateProduct(detailsArray);
        })
    }
function updateProduct(array){
     var itemcd=array[0];
     var onhand=array[1];
     console.log(itemcd+"\nonhand:"+onhand);
     var sql ='UPDATE BAMAZON_DB.PRODUCTS SET ??=?  WHERE ??=?'
    
        connection.query(sql,['ON_HAND_QTY',onhand,'ITEM_CD',itemcd], function (error, results, fields) {
            if (error){ 
                throw error;
                console.log("dumb db error that probably will never happen again");
                process.exit(99);
                }
            //console.log(results[0]);
            console.log("Inventory updated successfully.\nUpdated attribute: ON_HAND_QTY\nNew Value: "+onhand);
            getSupAction();
        });
    }

function showProducts(){
    var table = new Table({
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
               , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
               , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
               , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
        head:['Department','Item Code','Description','Price']
      });
    var sql="SELECT d.DEPT_DESC,p.ITEM_CD,p.PROD_DESC,p.PRICE FROM  BAMAZON_DB.PRODUCTS AS p JOIN BAMAZON_DB.DEPARTMENTS as d ON p.DEPT_ID=d.DEPT_ID WHERE ON_HAND_QTY > 0 ORDER BY 1,3"
        connection.query(sql,function (error, results, fields) {
        if (error){ 
            throw error;
            process.exit(99);
           }
           console.log(results[0]);
           var rows=JSON.stringify(results);
           console.log(rows);
           for(var i=0;i<results.length;i++){
            table.push(
                [results[i].DEPT_DESC,results[i].ITEM_CD,results[i].PROD_DESC,results[i].PRICE]
            );
           }
        //    table.push(rows);

           console.log(table.toString());
           getMgrAction();
        });
      }
      
function mgrShowProducts(){
        var table = new Table({
            chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                   , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                   , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                   , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
            head:['Department','Item Code','Description','Price','Stock Level']
          });
        var sql="SELECT d.DEPT_DESC,p.ITEM_CD,p.PROD_DESC,p.PRICE,p.ON_HAND_QTY FROM  BAMAZON_DB.PRODUCTS AS p JOIN BAMAZON_DB.DEPARTMENTS as d ON p.DEPT_ID=d.DEPT_ID ORDER BY 1,3"
            connection.query(sql,function (error, results, fields) {
            if (error){ 
                throw error;
                process.exit(99);
               }
               for(var i=0;i<results.length;i++){
                table.push(
                    [results[i].DEPT_DESC,results[i].ITEM_CD,results[i].PROD_DESC,results[i].PRICE,results[i].ON_HAND_QTY]
                );
               }
            //    table.push(rows);
                var date=moment().format("dddd MMMM DD,YYYY hh:mm a");
                console.log("\n======================================================\nAll Items Report as of "+date+"\n======================================================\n");
                console.log(table.toString());
                getMgrAction();
            });
          }

function lowInventoryReport(){
            var table = new Table({
                chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                       , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                       , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                       , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
                head:['Department','Item Code','Description','Price','Stock Level']
              });
            var sql="SELECT d.DEPT_DESC,p.ITEM_CD,p.PROD_DESC,p.PRICE,p.ON_HAND_QTY FROM  BAMAZON_DB.PRODUCTS AS p JOIN BAMAZON_DB.DEPARTMENTS as d ON p.DEPT_ID=d.DEPT_ID WHERE ON_HAND_QTY <= 5 ORDER BY 1,3"
                connection.query(sql,function (error, results, fields) {
                if (error){ 
                    throw error;
                    process.exit(99);
                   }
                   for(var i=0;i<results.length;i++){
                    table.push(
                        [results[i].DEPT_DESC,results[i].ITEM_CD,results[i].PROD_DESC,results[i].PRICE,results[i].ON_HAND_QTY]
                    );
                   }
                //    table.push(rows);
                var date=moment().format("dddd MMMM DD,YYYY hh:mm a");
                console.log("\n========================================================\nLow Inventory Report as of "+date+"\n========================================================\n");
                   console.log(table.toString());
                   getMgrAction();
                });
              }

function buySomething(){
console.log("you bought something");
}
function viewAllUsers(){
    var table = new Table({
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
               , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
               , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
               , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
        head:['Employee ID','User ID','User Name','User Role','Last Login Date']
      });
    var sql="SELECT  * FROM BAMAZON_DB.USERS ORDER BY 4";
        connection.query(sql,function (error, results, fields) {
        if (error){ 
            throw error;
            process.exit(99);
           }
           for(var i=0;i<results.length;i++){
            table.push(
                [results[i].EMP_ID,results[i].USER_ID,results[i].USER_NAME,results[i].USER_ROLE,results[i].LAST_LOGIN_DT]
            );
           }
        //    table.push(rows);
    var date=moment().format("dddd MMMM DD,YYYY");
        console.log("\n========================================================\nAll Active Employees Report as of "+date+"\n========================================================\n");
        console.log(table.toString());
        getMgrAction();
        });
      }