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

	var screens = {}, //game screens
	mobile = {},      //mobile params
	device = {},      //game params
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
	 * @param {Boolean} fnFlag if true, display the calling function
	 * @returns {String} error string, which may have the caller function name attached
	 */
	function showError (msg, fnFlag) {
		if(fnFlag && (arguments.callee.caller.name)) {
			var c = (arguments.callee.caller.name) + "()";
		}
		console.log("ERROR::" + c + " - " + msg);
	}

/* 
 * ============================
 * PLATFORM FIXES
 * ============================
 */


	/** 
	 * @method screenParams
	 * determine 
	 * determine if in standalone mode
	 * HTML5 Games Listing 3-19, p. 65
	 * IE pinning
	 * @link http://msdn.microsoft.com/en-us/library/ie/gg618530(v=vs.85).aspx
	 * @link http://msdn.microsoft.com/en-us/library/ie/gg491729%28v=vs.85%29.aspx
	 * @param {Enum} os
	 * @return {Boolean|UNKNOWN} if true or false, return, else return UNKNOWN (-1)

	 */
	function screenParams () {
		if(window.navigator.standalone === undefined) {
			mobile.standalone = false; //we don"t want desktop bringing up an install screen!
		}
		else {
			switch(mobile.type) {
				case "ios": //also includes android
					mobile.standalone = !!(window.navigator.standalone);
					break;
				case "android":
				case "chromeandroid":
					//detect standalone state in mobile chrome
					break;
				case "windowsphone":
					//TODO: detect if we can pin site
					break;
				case "blackberry":
					break;
				default:
					break;
				} //end of switch
			} //end of else
		//TODO: screen width and height and orientation
		if(window.devicePixelRatio && window.devicePixelRatio > 1) {
			device.retina = true;
		}
		else {
			device.retina = false;
		}
	}

	/** 
	 * @method isMobile
	 */
	function mobileParams () {

		//general mobile test
		mobile.test = (typeof window.orientation !== "undefined") || 
			(navigator.userAgent.indexOf('IEMobile') !== -1);

		//specific mobile types
		if(navigator.userAgent) {
			var ua = navigator.userAgent;
			if((/iphone|ipod|ipad/i).test(ua)) 
				mobile.type = "ios";
			else if(ua.indexOf('Android') > -1 ) {
				mobile.type ="android";
				if((/Chrome\/[.0-9]*/).test(ua)) 
					mobile.type = "chromeandroid";
			}
			else if(ua.indexOf("blackberry") > -1)
				mobile.type = 'blackberry';
			else if(ua.indexOf('Windows Phone') > -1)
				mobile.type = 'windowsphone';
			else
				mobile.type = "undefined"
		}
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
			document.getElementsByTagName("html")[0].style.height = "200%";
			setTimeout(function () {
				window.scrollTo(0, 1);
			}, 0);
		}
		
	} //end of fixScreen


	/**
	 * @method canRun
	 * determine if the device can run the app
	 * use feature detection, with device detection on as necessary
	 * Required features
	 * - HTML5 Canvas API
	 * - HTML5 Canvas Text API
	 * @link http://diveintohtml5.info/detect.html#canvas
	 * @returns {Boolean} if can run, return true, else false
	 */
	function canRun () {
		if(document.createElement) {
			var c = document.createElement('canvas');
			if(c && c.getContext) {
				var ctx = c.getContext('2d');
				if(ctx) {
					var txt = typeof ctx.fillText == "function";
					if(txt) {
						return true;
					}
					else {
						showError("HTML5 Canvas Text not supported");
					}
				}
				else {
					showError("Could not create HTML5 Canvas context");
				}
			}
			else {
				showError("HTML5 Canvas API not supported");
			}
		}
		return false;
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
		dom = elefart.dom;

		mobileParams(); //is this a mobile
		screenParams(); //screen features

		/*
		 * if .classList isn't defined, add polyfill functions 
		 * to the elements where classList is used
		 */
		if(!document.documentElement.classList) {
			dom.addClassList(document.getElementsByTagName("article"));
		}

		if(!canRun()) {
			//TODO: show error screen 
			console.log("browser can't support game, showing error screen");
			dom.showScreenById("screen-cantrun");
			return;
		}


		fixScreen();    //fix screens for some mobiles


		/** 
		 * Display a startup screen as files loaded, 
		 * or an install screen for adding a desktop link on ios 
		 * and Android mobiles
		 * 
		 */
		if(mobile.standalone) {
			console.log("standalone mode");
			dom.showScreenById("screen-install")
		}
		else {
			console.log("browser mode");
			dom.showScreenById("screen-splash");
		}
	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
		console.log("running elefart, about to run first screen")
		//TODO: NEED THE ACTIVE SCREEN HERE, NOT SCREEN-SPLASH
		elefart.screens['screen-splash'].run();
	}

	//returned object
	return {
		screens:screens,
		mobile:mobile,
		device:device,
		TRUE:TRUE,
		FALSE:FALSE,
		UNKNOWN:UNKNOWN,
		DEBUG:DEBUG,
		showError:showError,
		init:init,
		run:run
	};

})();