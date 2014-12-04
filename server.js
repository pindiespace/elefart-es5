/** 
 * Server.js - basic web server for Elefart
 */

//constants
var portNum = 8000;

//common core files

var path = require('path');             //filesystem
var express = require('express');       //base HTTP server
var favicon = require('serve-favicon'); //favicon

//create the server app

var app = express();

//give it the default web directory

app.use(express.static(path.join(__dirname, '/public')));

//add the express app to the default Node HTTP server

var http = require('http').Server(app);

//set up the server to listen

var server = http.listen(portNum, function(e) {
	if(e) {
		console.log("Failed to load HTTP server, error:" + e);
	}
	else {
		console.log("HTTP server running at port:" + portNum);
	}

});