/** 
 * @namespace elefart
 * @fileoverview main game object for elefart application. Contains
 * initialization code and some factory functions for common objects. 
 * Also does feature detection and loading of individual game screen 
 * objects.
 * @requires index.html (screens defined as <article> tags)
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart = (function () {

	var screens = {}, //game screens
	mobile = {},      //mobile params
	device = {},      //hardware params
	features = {},     //web browser feature tests
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
	 * @description show the error, try to trace caller function
	 * @param {String} msg the error message to display
	 * @param {Boolean} fnFlag if true, display the calling function
	 * @returns {String} error string, which may have the caller function name attached
	 */
	function showError (msg, fnFlag) {
		var c = "";
		if(fnFlag && (arguments.callee.caller.name)) {
			c = (arguments.callee.caller.name) + "() - ";
		}
		console.log("ERROR::" + c + msg);
	}

/* 
 * ============================
 * PLATFORM FIXES
 * ============================
 */


	/** 
	 * @method screenParams
	 * @description determine if in standalone mode. 
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
	 * @method mobileParams
	 * @description test for the mobile device and OS being used. Creates 
	 * an object which the device type listing. 
	 * This requies some user-agent sniffing, and should be compliemented 
	 * by feature detection in the browser.
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
	 * @description initial fixes of Android and iOS so they 
	 * behave more like native apps and less like a 
	 * browser window
	 * HTML5 Games BOOK: Listing 3-26, p. 71
	 */
	function fixScreen () {

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
	 * @method CSSBreak
	 * @description tests in (mostly) cross-compatible way for screen size, 
	 * https://gist.github.com/nzakas/08602e7d2ee448be834c
	 */

	/**
	 * @method canRun
	 * @description determine if the web browser can run the app
	 * use feature detection, with device detection on as necessary
	 * Required features
	 * - HTML5 Canvas API
	 * - HTML5 Canvas Text API
	 * @link http://diveintohtml5.info/detect.html#canvas
	 * @returns {Boolean} if can run, return true, else false
	 */
	function canRun () {
		features.ok = false;
		if(window.JSON && document.createElement) {
			features.createelement = true;
			features.json = true;
			var c = document.createElement('canvas');
			if(c && c.getContext) {
				features.canvas = true;
				var ctx = c.getContext('2d');
				if(ctx) {
					features.canvascontext = true;
					var txt = typeof ctx.fillText == "function";
					if(txt) {
						features.canvastext = true;
						features.ok = true; //ok to run game
						return true;
					}
					else {
						showError("HTML5 Canvas Text not supported");
						features.canvastext = false;
					}
				}
				else {
					showError("Could not create HTML5 Canvas context");
					features.canvascontext = false;
				}
			}
			else {
				showError("HTML5 Canvas API not supported");
				features.canvas = false;
			}
		}
		else {
			features.createelement = false;
			features.json = false;
		}
		return false;
	}

/* 
 * ============================
 * INIT AND RUN
 * ============================
 */

	/** 
	 * @method init elefart
	 * @description initialize the entire game app
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


		fixScreen(); //fix screens for some mobiles


		/** 
		 * Display a startup screen as files loaded, 
		 * or an install screen for adding a desktop link on ios 
		 * and Android mobiles
		 * 
		 */
		if(mobile.standalone) {
			console.log("Elefart:standalone mode");
			dom.showScreenById("screen-install")
		}
		else {
			console.log("Elefart:browser mode");
			dom.showScreenById("screen-splash");
		}

		firstTime = false;
	}

	/** 
	 * @method run elefart
	 * @description run the Elefart application
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
		features:features,
		TRUE:TRUE,
		FALSE:FALSE,
		UNKNOWN:UNKNOWN,
		DEBUG:DEBUG,
		showError:showError,
		init:init,
		run:run
	};

})();