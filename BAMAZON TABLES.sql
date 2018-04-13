-- DROP DATABASE IF EXISTS BAMAZON_DB;
-- Creates the database --
-- CREATE DATABASE BAMAZON_DB;


CREATE TABLE favorite_db.favorite_movies (
  -- Create a numeric column called "id" which automatically increments and cannot be null --
  id INTEGER(11) NOT NULL AUTO_INCREMENT
  -- Create a string column called "movie" which cannot be null --
  ,movie VARCHAR(50) NOT NULL
  -- Create a boolean column called "five_times" that sets the default value to false if nothing is entered --
  ,five_times tinyint(1) DEFAULT '0'
  -- Make an integer column called "score" --
  ,score INTEGER(5)
  -- Set the primary key of the table to id --
  ,PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE BAMAZON_DB.USERS_T (
 ID INTEGER(11) NOT NULL AUTO_INCREMENT
,EMP_ID VARCHAR(10)
,USER_ID VARCHAR(10)
,NAME VARCHAR(50)
,USER_ROLE VARCHAR(20)
,PASSWORD VARCHAR(20)
,LAST_LOGIN_DT TIMESTAMP
,PRIMARY KEY(EMP_ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE BAMAZON_DB.CUSTOMERS (
 CUST_ID INTEGER(11) NOT NULL AUTO_INCREMENT
,CUST_NAME VARCHAR(50)
,CITY VARCHAR(30)
,STATE VARCHAR(5)
,PASSWORD VARCHAR(30)
,PRIMARY KEY(CUST_ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE BAMAZON_DB.PRODUCTS (
ITEM_ID INTEGER(11) NOT NULL AUTO_INCREMENT
,ITEM_CD VARCHAR(20)
,PROD_NM VARCHAR(40)
,PROD_DESC VARCHAR(500)
,DEPT_ID VARCHAR(20)
,PRICE DECIMAL(10,2)
,COST DECIMAL(10,2)
,ON_HAND_QTY INTEGER
,FEATURED_FLAG BOOLEAN DEFAULT FALSE
,PRIMARY KEY(ITEM_CD)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE BAMAZON_DB.DEPARTMENTS (
DEPT_CD VARCHAR(10)
,DEPT_DESC VARCHAR(20)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE BAMAZON_DB.SALES (
SALES_DT DATE
,CUST_ID INTEGER(11)
,ITEM_CD VARCHAR(20)
,QTY DECIMAL(10,2)
,COST DECIMAL(10,2)
,PRICE DECIMAL(10,2)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;;