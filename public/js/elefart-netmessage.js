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

	//the type of users in the game
	exports.USER_TYPES = {
		REAL:"LOCAL",
		REMOTE:"REMOTE",
		BOT:"BOT"
	},

	//types of goodies in the game
	exports.GOODIE_TYPES = {
		GAS_MASK: "GAS_MASK",
		PERFUME: "PERFUME"
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
	};

	exports.ELEVATOR_MESSAGE = {
		ELEVATOR_MOVED: "ELEVATOR_MOVED"
	};

	//the line below is required to export for the web browser

}(typeof exports === 'undefined' ? this.common = {} : exports));