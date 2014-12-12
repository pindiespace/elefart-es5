/** 
 * server.js
 * v 1.0
 * basic web and websockets server
 * - expressJS
 * - websockets 
 *
 * Use modules specified for 4.x (unlike many tutorials)
 * http://expressjs.com/migrating-4.html
 *
 * 
 */


//INCLUDES

var path    = require('path');           //define paths to files and folders
var express = require('express');        //express server augments basic Node
//var io      = require('socket.io');      //CAN'T DO IT HERE!!!!
//var morgan  = require('morgan');         //standard access logs for the server
var favicon = require('serve-favicon');  //serve out favicon

//JS FILES SHARED BETWEEN CLIENT AND SERVER

var common = require('./public/js/elefart-netmessage.js');

//test common JS file
console.log('commonJS object test: news:' + common.NEWS);

//SPECIFY PORT NUMBER FOR SERVER
var portNum = common.portNum;

//CREATE THE APP USING ExpressJS

var app = express();

//NO VIEWS (not using Jade)

//NO SPECIAL PATHS USED

//SET THE STATIC DIRECTORY FOR WEB PAGES

app.use(express.static(path.join(__dirname, '/public')));

//CREATE THE HTTP SERVER

//add our Express app to the default Node HTTP server

var http = require('http').Server(app);

/** 
 * IMPORTANT
 * we have to 'require' and 'listen' in one line for socket.io to work
 * with express. any attempt to split them up may result in errors!
 */
var io   = require('socket.io').listen(http);

//SOCKET.IO CALLBACKS

io.sockets.on('connection', function (socket) {

	console.log('HEY! - **SOMEBODY JUST CONNECTED TO US**');

	//send them back a 'server ready' message

	//socket.emit(common.NET_MESSAGE.NEWS, { hello: 'server ready' });

	//callbacks for client messages

	socket.on('disconnect', function () {
		console.log("client disconnected");
  	});

	socket.on(common.NEWS, function(data) {
		console.log("server recieved NEWS: " + data);
	});

	//send a message to everyone BUT the original sender
	//@link http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/

	//users
	socket.on(common.USER_MESSAGE.USER_JOINED, function(data) {
		console.log("server recieved USER_JOINED: " + data.uName);
		//send everyone else the connect object from a new user
		socket.broadcast.emit(common.USER_MESSAGE.USER_JOINED, data);
	});

	socket.on(common.USER_MESSAGE.USER_MOVED, function(data) {
		console.log("server recieved USER_MOVED: " + data.uName);
		//send everyone else the connect object from a new user
		socket.broadcast.emit(common.USER_MESSAGE.USER_MOVED, data);
	});

	socket.on(common.USER_MESSAGE.USER_LEFT, function(data) {
		console.log("server received USER_LEFT: " + data.uName);
		socket.broadcast.emit(common.USER_MESSAGE.PLAYER_LEFT, data);
	});	

	//elevators
	socket.on(common.ELEVATOR_MESSAGE.ELEVATOR_MOVED, function(data) {
		console.log("server recieved ELEVATOR_MOVED: " + data.elev.shaft);
		socket.broadcast.emit(common.ELEVATOR_MESSAGE.PLAYER_MOVED, data);		
	});


}); //end of io.sockets.on('connect')

/* FIRE UP THE SERVER */

//http is the server 'decorated' earlier by require('http').server(app)

var server = http.listen(portNum, function (err) {
	if(err) {
		console.log('failed to load http server');
	}
	else {
		console.log('Elefart http and websocke (socketio) server listening on port:' + portNum);
		console.log('CTL-C to shut down server');
	}
});