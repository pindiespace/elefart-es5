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
	 * going from left to right. Objects "left", "center", 
	 * "right", "up", "down", refer to sub-sets of frames in 
	 * the row for a particular direction of animation, e.g. 
	 * running left instead of running right.
	 */
	exports.PERSON_TYPES = {
		MALE_SQUATTING: {row:0, cols:15, left:[0,2], center:[], right:[], speed:2},
		MALE_STANDING: {row:1, cols:15, left:[0,1], center:[0,1], right:[], speed:2},
		MALE_RUNNING: {row:2, cols:15, left:[0,5], center:[], right:[6,11], speed:6},
		MALE_FALLING: {row:3, cols:15, left:[0,2], center:[], right:[], speed:4},
		FEMALE_SQUATTING: {row:4, cols:15, left:[0,2], center:[], right:[],speed:2},
		FEMALE_STANDING: {row:5, cols:15, left:[0,1], center:[], right:[], speed:2},
		FEMALE_RUNNING: {row:6, cols:15, left:[0,5], center:[], right:[], speed:4},
		FEMALE_FALLING: {row:7, cols:15, left:[0,2], center:[], right:[], speed:3}
	},

	exports.GOODIE_TYPES = {
		ROSE_RED: {name:"red rose", row:0, col:0, score:0.1},
		ROSE_BLUE: {name:"blue rose", row:0, col:1, score:0.2},
		ROSE_GREEN: {name:"green rose", row:0, col:2, score:0.05},
		ROSE_BROWN: {name:"brown rose", row:0, col:3, score:0.02},
		BEAN_CAN: {name:"bean can", row:0, col:4, score:1.0},
		DAISY: {name:"daisy", row:0, col:5, score:0.1},
		TULIP: {name:"tulip", row:0, col:6, score:0.2},
		GAS_MASK: {name:"gas mask", row:0, col:7, score:0.8},
		PERFUME: {name:"perfume", row:0, col:8, score:1.0},
		FAN: {name:"fan", row:0, col:9, score:0.8}
	},

	//types of gas emitted in Elevators
	exports.GAS_TYPES = {
		SHUTTERBLAST: {name:"shutterblast", row:0, col:0, score:0.1},
		SPUTTERBLAST: {name:"sputterblast", row:1, col:0, score:0.3},
		TRILLBLOW: {name:"trillblow", row:2, col:0, score:0.5},
        ZEEPER: {name:"zeeper", row:3, col:0, score:0.04}
	},

	//the type of users in the game
	exports.USER_TYPES = {
		LOCAL:"LOCAL",
		REMOTE:"REMOTE",
		BOT:"BOT"
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