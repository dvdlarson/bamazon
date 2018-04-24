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
 
var activeUser=[];
var loginUser;
var loginUserRole;
var loginPW;
var userList=[];//used when adding new user(s)
var usersArray=[];
var badAttempts=0;
var activeUser={};
var productArray=[];
var newCustID;
var salesDetails=[];
var currentOrder=[];
var itemDetail=[];

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

function deleteUser(empid){
//    connection.connect();
 var user=empid;
    connection.query(
    'DELETE FROM  BAMAZON_DB.USERS  WHERE ??=?',['EMP_ID',user], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
    console.log("Employee ID: "+user+" has been deleted.");
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
   
    var sql="INSERT INTO bamazon_db.users (EMP_ID, USER_ID, USER_NAME, USER_ROLE, PW,LAST_LOGIN_DT) VALUES ?";
    connection.query(sql,[valuesArray], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
   // getInformationfromDB();
   // console.log(usersArray);
   console.log("\n=============================\nNew user: "+valuesArray[2]+" has been added successfully.\n=============================\n")
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
        pageSize:"9",
      message: "Current date and time: "+now+".\nWhat would you like to do?",
      choices: ["Add User","Delete User", "Edit User","View All Users","View User Activity","Supervisor Actions","Manager Actions","Buy Something","Log Out"],
      name: "action"
    }).then(function(response){
        if(response.action=='Log Out'){
            logOut();
        }
        else if (response.action=='Add User'){
            getUserDetails("add");
        }
        else if (response.action=='Delete User'){
            getUserDetails("delete");
        }
        else if (response.action=='Reset User Password'){
            console.log("\n Not quite ready yet.");
            getAdminAction();
            //editUser();
        }
        else if (response.action=='View All Users'){
            viewAllUsers();
        }
        else if (response.action=='Supervisor Actions'){
            getSupAction();
        }
        else if (response.action=='Manager Actions'){
            getMgrAction();
        }
        else if (response.action=='Buy Something'){
            buySomething();
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
               salesByDept();
           }
           else if (response.action=='Update Inventory'){
               updateInventory();
           }
           else if (response.action=='View All Products'){
               mgrShowProducts("Sup");
           }
           else if (response.action=='Low Inventory Report'){
                lowInventoryReport("Sup");
           }
           else if (response.action=='Manager Actions'){
                getMgrAction();
           }else if (response.action=='Create New Department'){
            addNewDepartment();
           }
           else {
               console.log("That isn't functional yet.");
               getSupAction();
           }
       });
   }

function logOut(){
    console.log("Thank you for using the Bamazon Admin Portal.\nHave a great day.")
    connection.end();
    process.exit(0);
}

function getUserDetails(action){
    var detailsArray=[];
    var questions=[];
    var addQuestions = [{
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
    ];
    var deleteQuestions=[{
        name:"empid",
        type:"input",
        message:"Enter Employee ID of the user you would like to delete."
            }];
        //determine which questions to ask
        if(action=="add"){
            questions=addQuestions;
        }
        else {questions=deleteQuestions;}
    inquirer.prompt(
        questions,
        (err)=>{
            console.log("It appears you are having difficulty. Please contact the help desk.");
            process.exit(99);
        }
    ).then(function(response,error){//create array of arrays for insert statement

        var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
        var detailsArray= [[response.empid,response.userid,response.name,response.role,response.password,timestamp]];
       // detailsArray[4].push(timestamp);
        console.log("details array: "+detailsArray);
        if(action=="add")
        {addUser(detailsArray);}
        else {deleteUser(response.empid);}
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
     getMgrAction();
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
        choices:["100","200","300"],
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
            updateProduct(detailsArray,"mgrMenu");
        })
    }

function updateProduct(array,source){
     var itemcd=array[0];
     var onhand=array[1];
     console.log(itemcd+"\nonhand:"+onhand);
     var sql ='UPDATE BAMAZON_DB.PRODUCTS SET ??=?  WHERE ??=?'
    // there is no error generated when trying to update a non-existent product 
        connection.query(sql,['ON_HAND_QTY',onhand,'ITEM_CD',itemcd], function (error, results, fields) {
            if(error) {
                throw error;
            }

            else if (results.affectedRows==0){ 
                console.log("There was an error updating the database. No rows were updated. Please check your item information and try again.");
                getMgrAction();
                }
            //console.log(results[0]);
           // console.log(JSON.stringify(results));
           else  {console.log("Inventory updated successfully.\nUpdated attribute: ON_HAND_QTY\nNew Value: "+onhand);
            if(source=="mgrMenu"){getMgrAction();}
            else {
                addSalesRecord(salesDetails);
            }};
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
    var sql="SELECT d.DEPT_DESC,p.ITEM_CD,p.PROD_DESC,p.PRICE,p.ON_HAND_QTY,p.COST FROM  BAMAZON_DB.PRODUCTS AS p JOIN BAMAZON_DB.DEPARTMENTS as d ON p.DEPT_ID=d.DEPT_ID WHERE ON_HAND_QTY > 0 ORDER BY 1,3"
        connection.query(sql,function (error, results, fields) {
        if (error){ 
            throw error;
            process.exit(99);
           } //add items to array to push to table as well as global productArray for reference later
           for(var i=0;i<results.length;i++){
            table.push(
                [results[i].DEPT_DESC,results[i].ITEM_CD,results[i].PROD_DESC,results[i].PRICE]
            );
            productArray.push(
                [{["DEPT_DESC"]:results[i].DEPT_DESC},{["ITEM_CD"]:results[i].ITEM_CD},{["PROD_DESC"]:results[i].PROD_DESC},{["PRICE"]:results[i].PRICE},{["ON_HAND_QTY"]:results[i].ON_HAND_QTY},{["COST"]:results[i].COST}]
            );
           }
        //    table.push(rows);

           console.log(table.toString());
         //  console.log("PROD ARRAY"+productArray);
           buySomething("success");
        });
      }
      
function mgrShowProducts(source){
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
                if (source=="Sup"){
                    getSupAction();
                }
                else {getMgrAction();}
            });
          }

function lowInventoryReport(source){
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
                   if (source=="Sup"){
                    getSupAction();
                }
                else {getMgrAction();}
                });
              }

function salesByDept(){

    //not sure why the table here does not show the total_profit figures. The query returns them just fine.

                var table = new Table({
                    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                           , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                           , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                           , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
                    head:['Department Id','Dept. Description','Gross Sales','Total Cost','Total Profit']
                  });
                var sql="SELECT p.DEPT_ID,d.DEPT_DESC,SUM(s.GRAND_TOTAL) AS GROSS_SALES,SUM(s.COST) AS TOTAL_COST,SUM(s.GRAND_TOTAL)-SUM(s.COST) AS TOTAL_PROFIT FROM BAMAZON_DB.SALES AS s JOIN BAMAZON_DB.PRODUCTS as p ON s.ITEM_CD=p.ITEM_CD JOIN BAMAZON_DB.DEPARTMENTS AS d ON p.DEPT_ID=d.DEPT_ID GROUP BY 1,2"
                    connection.query(sql,function (error, results, fields) {
                    if (error){ 
                        throw error;
                        process.exit(99);
                       }
                       for(var i=0;i<results.length;i++){
                        table.push(
                            [results[i].DEPT_ID,results[i].DEPT_DESC,results[i].GROSS_SALES,results[i].TOTAL_COST,results[i].TOTAL_PROFIT]
                        );
                       }
                    //    table.push(rows);
                    var date=moment().format("dddd MMMM DD,YYYY hh:mm a");
                    console.log("\n========================================================\nSales by Department as of "+date+"\n========================================================\n");
                       console.log(table.toString());
                       getSupAction();
                    });
                  }
function buySomething(status){
 var loggedInQuestions=   [{name:"itemcd",type:"input",message:"What is the item code you would like to purchase?"},
        {name:"qty",type:"input",message:"How many would you like?"}];
 var newUserQuestions=[{name:"itemcd",type:"input",filter: function(val) {return val.toUpperCase();},message:"What is the item code you would like to purchase?"},
    {name:"qty",type:"input",message:"How many would you like?"},
    {name:"name",type:"input",message:"Who should we ship it to? (Your name)"},
    {name:"city",type:"input",message:"What city are we sending to?"},
    {name:"state",type:"input",message:"What state are we sending to?"}];
var questionSet=newUserQuestions;


if(status==null){
    showProducts();
        }
    else 
    {
        console.log("\n");
        inquirer.prompt(questionSet,
        (err)=>{
            console.log("It appears you are having difficulty. Please contact the help desk.");
            process.exit(99);
        }
    ).then(function(response,error){//create array of arrays for insert statement
        if(error) {
            //throw error;
            console.log("There was an error in the buy item process.");
            process.exit(99);
        }
        var timestamp=moment().format("MM/DD/YYYY");
        var stockLevel;
        var price; 
        var totalCost,itemcost;
        var grandTotal;
        
       
        
        var orderQTY = response.qty  //get current on_hand
        console.log("orig orderqty: "+orderQTY);
        for(var i=0;i<productArray.length;i++){
            if(productArray[i][1].ITEM_CD==response.itemcd){
                
                stockLevel=productArray[i][4].ON_HAND_QTY;
                itemcost = productArray[i][5].COST;
                price = productArray[i][3].PRICE;
                description = productArray[i][2].PROD_DESC;
                console.log("stockLevel:",stockLevel);
                if(stockLevel==0){
                    console.log("Sorry, we are currently out of that item.");
                    buySomething();
                }
                else if(stockLevel < orderQTY){
                    console.log("We only have "+stockLevel+" of those in stock. Your order quantity has been adjusted.");
                    orderQTY=stockLevel;
                };
            }
        }
       // console.log("itemcost:"+itemcost);
       // console.log("new order qty:"+orderQTY);
        totalCost = orderQTY * itemcost;
       // console.log("total cost:"+totalCost);
        var depleteQTY = stockLevel-orderQTY;
      //  console.log("new inventory level:"+depleteQTY);
        grandTotal=orderQTY*price;
      //  console.log("grand total: "+ grandTotal)
        var detailsArray= [response.itemcd,depleteQTY];
        var custDetails = [[response.name,response.city,response.state,'bamazon1',timestamp]];
        activeUser=[{"NAME":response.name},{"CITY":response.city},{"STATE":response.state}]
        addCustomer(custDetails);
     //   console.log("newCustID: "+newCustID);
        //var custid  //rownumber from customer insert
        itemDetail.push({"QTY":orderQTY},{"DESC":description},{"TOTAL":totalCost});
     //   currentOrder.push(itemDetail);
        salesDetails=[[timestamp,activeUser.CUST_ID,response.itemcd,orderQTY,totalCost,'0',grandTotal]];
        console.log("Your order is complete.\nItems ordered:"+orderQTY+"\nProduct Description: "+description+"\nItem Total:"+totalCost);
        //prompt for additional products
        updateProduct(detailsArray,"cust");
        

      //  
    })
}
}

function buySomethingElse(){
    var loggedInQuestions=   [{name:"itemcd",type:"input",message:"What is the item code you would like to purchase?"},
           {name:"qty",type:"input",message:"How many would you like?"}];
    
   var questionSet=loggedInQuestions;
   
   
   if(status==null){
       showProducts();
           }
       else 
       {
           console.log("\n");
           inquirer.prompt(questionSet,
           (err)=>{
               console.log("It appears you are having difficulty. Please contact the help desk.");
               process.exit(99);
           }
       ).then(function(response,error){//create array of arrays for insert statement
           if(error) {
               //throw error;
               console.log("There was an error in the buy item process.");
               process.exit(99);
           }
           var timestamp=moment().format("MM/DD/YYYY");
           var stockLevel;
           var price; 
           var totalCost,itemcost;
           var grandTotal;
           
          
           
           var orderQTY = response.qty  //get current on_hand
           console.log("orig orderqty: "+orderQTY);
           for(var i=0;i<productArray.length;i++){
               if(productArray[i][1].ITEM_CD==response.itemcd){
                   
                   stockLevel=productArray[i][4].ON_HAND_QTY;
                   itemcost = productArray[i][5].COST;
                   price = productArray[i][3].PRICE;
                   description = productArray[i][2].PROD_DESC;
                   console.log("stockLevel:",stockLevel);
                   if(stockLevel==0){
                       console.log("Sorry, we are currently out of that item.");
                       buySomething();
                   }
                   else if(stockLevel < orderQTY){
                       console.log("We only have "+stockLevel+" of those in stock. Your order quantity has been adjusted.");
                       orderQTY=stockLevel;
                   };
               }
           }
          // console.log("itemcost:"+itemcost);
          // console.log("new order qty:"+orderQTY);
           totalCost = orderQTY * itemcost;
          // console.log("total cost:"+totalCost);
           var depleteQTY = stockLevel-orderQTY;
         //  console.log("new inventory level:"+depleteQTY);
           grandTotal=orderQTY*price;
         //  console.log("grand total: "+ grandTotal)
           var detailsArray= [response.itemcd,depleteQTY];
         //  var custDetails = [[activeUser.NAME,activeUser.city,activeUser.state,'bamazon1',timestamp]];
         //  activeUser=[{"NAME":response.name},{"CITY":response.city},{"STATE":response.state}]
         //  addCustomer(custDetails);
        //   console.log("newCustID: "+newCustID);
           //var custid  //rownumber from customer insert
           var itemDetail=[{"QTY":orderQTY},{"DESC":description},{"TOTAL":totalCost}];
           currentOrder.push(itemDetail);
           salesDetails=[[timestamp,newCustID,response.itemcd,orderQTY,totalCost,'0',grandTotal]];
           //prompt for additional products
           updateProduct(detailsArray,"cust");
           
   
         //  
       })
   }
   }

function addCustomer(valuesArray){

     var sql="INSERT INTO bamazon_db.customers (CUST_NAME, CITY, STATE, PW,LAST_ORDER_DT) VALUES ?";
     connection.query(sql,[valuesArray], function (error, results, fields) {
     if (error) throw error;
     //console.log(results[0]);
    // getInformationfromDB();
    console.log("XXXXXXXXX===---added customer successfully---===XXXXXXXXX");
     console.log("NEW CUSTOMER ID: "+results.insertId);
     sql="SELECT * FROM bamazon_db.customers WHERE CUST_ID="+results.insertId
     connection.query(sql,[valuesArray], function (error, results, fields) {
        if (error) throw error;
     newCustID=results.insertId;
     activeUser.push({"CUST_ID":newCustID})
     });
     });
     
    
 }
 
function addSalesRecord(valuesArray){

    var sql="INSERT INTO bamazon_db.sales (SALES_DT, CUST_ID, ITEM_CD, QTY,COST,PROMO_DISC,GRAND_TOTAL) VALUES ?";
    connection.query(sql,[valuesArray], function (error, results, fields) {
    if (error) throw error;
    //console.log(results[0]);
   // getInformationfromDB();
  // console.log("XXXXXXXXX===---added sales record successfully---===XXXXXXXXX");
   
   nextCustomerAction();
    //console.log("INSERT RESULTS: "+JSON.stringify(results));
    });
    
   
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
        getAdminAction();
        });
      }

function nextCustomerAction(){
            console.log("\n");
            inquirer.prompt(
            [{
            name:"action",
            type:"list",
            choices:["Buy something else","Log Out"],
            message:"What would you like to do next?"
                }            
        ],
            (err)=>{
                console.log("It appears you are having difficulty. Please contact the help desk.");
                process.exit(99);
            }
        ).then(function(response,error){//create array of arrays for insert statement
            if(error) {
                //throw error;
                console.log("There was an error in the next customer action process.");
                process.exit(99);
            }
            else if(response.action=="Log Out") {
                logOut();
            }
            else {buySomethingElse();}
        })
    }

function addNewDepartment(){
        var detailsArray=[];
        inquirer.prompt(
            [{
            name:"deptid",
            type:"input",
            message:"New Department ID:"
                },
            {
            name:"desc",
            type:"input",
            message:"Department Description:"   
            }            
           
        ],
            (err)=>{
                console.log("It appears you are having difficulty. Please contact the help desk.");
                process.exit(99);
            }
        ).then(function(response,error){//create array of arrays for insert statement
    
            var timestamp=moment().format("YYYY-MM-DD HH:MM:SS");
            var detailsArray= [[response.deptid,response.desc]];
           // detailsArray[4].push(timestamp);
            console.log("details array: "+detailsArray);
            var sql="INSERT INTO bamazon_db.departments (DEPT_ID, DEPT_DESC) VALUES ?";
            connection.query(sql,[detailsArray], function (error, results, fields) {
            if (error){ 
                throw error;
                process.exit(99);
                }
            //console.log(results[0]);
        //  getInformationfromDB();
            console.log("Department added successfully.");
            getSupAction();
            });
        })
        }
