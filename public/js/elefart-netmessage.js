/** 
 * @namespace
 * common (JS object available on client and on server)
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
 * http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
 */

(function(exports){

	exports.portNum = 3000,

	exports.NEWS = "NEWS",

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