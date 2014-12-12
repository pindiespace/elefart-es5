/** 
 * Server.js - basic web server for Elefart
 */

//constants
var portNum = 8000;

//common client and server object (variables, methods)
var common = require('./public/js/NetMessage.js');

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

/** 
 * IMPORTANT
 * we have to 'require' and 'listen' in one line for socket.io to work
 * any attempt to split them up may result in errors!
 */
var io   = require('socket.io').listen(http);

// SOCKET.IO CALLBACKS

io.sockets.on('connection', function (socket) {

	socket.on('disconnect', function () {
		console.log("client disconnected");
  	});


}


//set up the server to listen

var server = http.listen(portNum, function(e) {
	if(e) {
		console.log("Failed to load HTTP server, error:" + e);
	}
	else {
		console.log("HTTP server running at port:" + portNum);
	}

});