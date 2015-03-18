/** 
 * @namespace
 * @fileoverview CommonJS object available on client and on server
 * common file between client and server provding
 * a dictionary for decoding messages between user programs
 * each message may be associated with additional data, shown
 * to the right of the message
 * 
 * NOTE: the function is 'wrapped' in an 'exports' object whose 
 * configuration is compatible with what NodeJS needs, and can 
 * also be used by your client. On the browser, the 'common' object
 * is created. On the server, it already exists. Format follows 
 * CommonJS format.
 * 
 * @link http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
 */

(function(exports){

	exports.portNum = 3000,

	exports.NEWS = "NEWS",

	/* 
	 * types of Persons playing the game (Sprite rows)
	 * row is row in spriteboard
	 * frames are number of frames used in the spriteboard, 
	 * going from left to right
	 */
	exports.PERSON_TYPES = {
		MALE_SQUATTING: {row:0, frames:3},
		MALE_STANDING: {row:1, frames:1},
		MALE_RUNNING: {row:2, frames:3},
		MALE_FALLING: {row:3, frames:3},
		FEMALE_SQUATTING: {row:4, frames:3},
		FEMALE_STANDING: {row:5, frames:1},
		FEMALE_RUNNING: {row:6, frames:1},
		FEMALE_FALLING: {row:7, frames:1}
	},

	exports.GOODIE_TYPES = {
		ROSE_RED: {row:0, col:0, score:0.1},
		ROSE_BLUE: {row:0, col:1, score:0.2},
		ROSE_GREEN: {row:0, col:2, score:0.05},
		ROSE_BROWN: {row:0, col:3, score:0.02},
		TULIP: {row:0, col:4, score:0.2},
		DAISY: {row:0, col:5, score:0.1},
		GAS_MASK: {row:0, col:6, score:0.8},
		BEAN_CAN: {row:0, col:7, score:1.0},
		PERFUME: {row:0, col:8, score:1.0},
		FAN: {row:0, col:9, score:0.8}
	},

	//the type of users in the game
	exports.USER_TYPES = {
		LOCAL:"LOCAL",
		REMOTE:"REMOTE",
		BOT:"BOT"
	},

	//types of gas emitted in Elevators
	exports.GAS_TYPES = {
		SHUTTERBLAST: "SHUTTERBLAST",
		SPUTTERBLAST: "SPUTTERBLAST",
		TRILLBLOW: "TRILLBLOW"
	},

	exports.USER_MESSAGE = {
		USER_JOINED: "USER_JOINED",
		USER_MOVED: "USER_MOVED",
		USER_LEFT: "USER_LEFT"
	},

	exports.ELEVATOR_MESSAGE = {
		ELEVATOR_MOVED: "ELEVATOR_MOVED"
	};

	//the line below is required to export for the web browser

}(typeof exports === 'undefined' ? this.common = {} : exports));