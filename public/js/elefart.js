/** 
 * @namespace 
 * @fileoverview main game object for Elefart application. Contains
 * initialization code and some factory functions for common objects
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 * JSDOC reference:
 * @link http://www.2ality.com/2011/08/jsdoc-intro.html
 */
window.elefart = (function () {

	var screens = []
	TRUE = "true",
	FALSE = "false",
	UNKNOWN = -1,
	DEBUG = true,
	firstTime = true;

/* 
 * ============================
 * UTILITIES
 * ============================
 */

	/** 
	 * @method showError
	 * show the error, try to trace caller function
	 * @param {String} msg the error message to display
	 * @returns {String} error string, which may have the caller function name attached
	 */
	function showError (msg) {
		if(showError.caller || arguments.callee.caller.name) {
			var c = (showError.caller || arguments.callee.caller.name);
		}
		console.log("ERROR:" + c + "," + msg);
	}


/* 
 * ============================
 * PLATFORM FIXES
 * ============================
 */

	/** 
	 * @method isStandalone
	 * determine if in standalone mode
	 * HTML5 Games Listing 3-19, p. 65
	 * IE pinning
	 * @link http://msdn.microsoft.com/en-us/library/ie/gg618530(v=vs.85).aspx
	 * @link http://msdn.microsoft.com/en-us/library/ie/gg491729%28v=vs.85%29.aspx
	 * @param {Enum} os
	 * @return {Boolean|UNKNOWN} if true or false, return, else return UNKNOWN (-1)
	 */
	function isStandalone (type) {
		if(window.navigator.standalone === undefined) {
			return false; //we don't want desktop bringing up an install screen!
		}
		else {
			if(type) {
				switch(type) {
					case 'ios': //also includes android
						return !!(window.navigator.standalone);
						break;
					case 'windows':
						//TODO: detect if we can pin site
						break;
					default:
						break;
				}
			}

		}
		return UNKNOWN;
	}

	/** 
	 * @method fixScreen
	 * initial fixes of Android and iOS so they 
	 * behave more like native apps and less like a 
	 * browser window
	 * HTML5 Games BOOK: Listing 3-26, p. 71
	 */
	function fixScreen () {
		
		console.log("in fixScreen");
		
		//disable touchmove
		elefart.dom.bind(document, "touchmove", function (e) {
			console.log("touchmove disabled");
		});
		
		//hide the address bar on Android devices
		if(/Android/.test(navigator.userAgent)) {
			document.getElementsByTagName('html')[0].style.height = "200%";
			setTimeout(function () {
				window.scrollTo(0, 1);
			}, 0);
		}
		
	} //end of fixScreen

/* 
 * ============================
 * GAME SCREEN MANAGEMENT
 * ============================
 */

	function showScreen (screenId) {
		if(isStandalone('ios') || isStandalone('windows')) {
			console.log("standalone mode");
		}
		else {
			console.log("browser mode");
		}
		
	}
/* 
 * ============================
 * INIT AND RUN
 * ============================
 */

	/** 
	 * @method init
	 */
	function init () {
		fixScreen();
	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
		showScreen();
	}

	//returned object
	return {
		screens:screens,
		TRUE:TRUE,
		FALSE:FALSE,
		UNKNOWN:UNKNOWN,
		DEBUG:DEBUG,
		showError:showError,
		init:init,
		run:run
	};

})();