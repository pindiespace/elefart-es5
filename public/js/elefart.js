<<<<<<< HEAD
/** 
 * @namespace
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

=======
/** @namespace */
var elefart = (function() {
	var screen,
		screens = {},     //stores screen JS objects
		dom,              //link to .dom
		$,                //link to .dom querySelector
		activeScreen,     // DOM refence to currently visible screen
		gameStates = {
			LOAD:1,
			INTRO:2,
			RUN:3,
			HIGH_SCORES:4,
			HELP:5,
			EXIT:6
		},
		state = gameStates.LOAD; //set a default state

		DEBUG = false;     // debug line

	/** 
	 * @method errorScreen
	 * display error message to user
	 * @param {String} msg the error message
	 */	
	function errorScreen(msg) {
		//TODO: write error
		console.log("ERROR: " + msg);
	}

	/** 
	 * @method showScreen
	 * BOOK: Listing 2-11, p. 34
	 * displays the screen based on its id

	 * @param {String} screenId the id of the element we want to show
	 */
	function showScreen(screenId) {
		/* 
		 * <main id="game"> contains all the screens
		 * grab any screen (if one is active) into activeScreen
		 */
		activeScreen = $("#game .screen.active")[0];
		
		/** 
		 * NOTE: we changed the 'screen' to 'currentScreen' because 
		 * 'screen is a keyword' in many JavaScript implementations
		 * determine the incoming screen we want to make active
		 * the '$' is a function in our elefart.dom object wrapping 
		 * our CSS querselector() function
		 */
		currentScreen = $("#" + screenId)[0];

		//BOOK: Listing 3-10, pp.54-55
		if(!elefart.screens[screenId]) {
			console.log("elefart.showScreen() " + screenId + " - Screen module not implemented yet");
			return;
		}

		//remove the class 'active' from the currently active DOM element, making it invisible
		if(activeScreen) {
			dom.removeClass(activeScreen, "active");
		}

		//add the 'active' class to the screen with screenId, making it visible
		dom.addClass(currentScreen, "active");

		/** 
		 * Now we actually convert and configure the 
		 * newly loaded screeen, using the associated run() function
		 * that most objects have
		 * BOOK: Listing 3-10, pp. 54-55
		 */
		elefart.screens[screenId].run();
	}
	

	/** 
	 * @method load
	 * BOOK: Listing 2-6, p. 28
	 * NOTE: we changed this from the default loader 
	 * code in the book Chap. 2, to Modernizr, which 
	 * we are loading anyways to support HTML5 shivs in 
	 * old IE. It simplifies our code and eliminates a redundant loader function.
	 * @param {Array[String]} srcArr list of files to load
	 * @param {Function} callback the function to execute when done
	 */
	function load (srcArr, callback) {

		if(DEBUG) console.log("elefart::load(), srcArr:" + srcArr);

		/* 
		 * example of direct load
		 * @link http://stackoverflow.com/questions/8909862/loading-scripts-using-modernizr-not-working
		 */
		head.load(srcArr, callback);
		scrArr = []; //HeadJS appears to add the callback to srcArr, so clear
	}

	/** 
	 * @method isStandalone
	 * BOOK: Listing 3-17, p. 64
	 */
	function isStandalone () {
		/* 
		 * determine if we are running independently, or we 
		 * are a page inside the Mobile Safari window.
		 * function logic: 'does .standone equal false?'
		 * (return true or false to this assertion')
		 * if .standalone === undefined (non-iOS) devices 
		 * the function returns true. 
		 * the function only returns false 
		 * when we are on iOS, and NOT in standalone mode
		 * NOTE: we also use isStandalone() in index.html, 
		 * Listing 3-19, p. 65
		 * 
		 * Head.js also defines
		 * head.desktop true/false
		 */
		if(window.navigator.standalone === undefined) {
			return true; //we don't want desktop bringing up an install screen!
		}
		else {
			return !!(window.navigator.standalone)
		}
		
	}
	
	/** 
	 * @method fixScreen
	 * initial fixes of Android and iOS so they 
	 * behave more like native apps and less like a 
	 * browser window
	 * BOOK: Listing 3-26, p. 71
	 */
	function fixScreen () {
		
		if(DEBUG) console.log("elefart::fixScreen()");
		
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
		//disable touchmove
		elefart.dom.bind(document, "touchmove", function (e) {
			console.log("touchmove disabled");
		});
		
		//hide the address bar on Android devices
		if(/Android/.test(navigator.userAgent)) {
<<<<<<< HEAD
			document.getElementsByTagName("html")[0].style.height = "200%";
=======
			document.getElementsByTagName('html')[0].style.height = "200%";
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
			setTimeout(function () {
				window.scrollTo(0, 1);
			}, 0);
		}
		
	} //end of fixScreen

<<<<<<< HEAD
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

=======

	/** 
	 * @method setup
	 * BOOK: Listing 2-6, p. 28, augmented in 
	 * Listin 3-18, p. 64
	 */
	function setup () {
		dom = elefart.dom,
		$ = dom.$;
		//ADDED
		fixScreen(); //fix quirks in mobile platforms
		if(isStandalone()) {
			console.log("elefart::setup(), show splash screen");
			elefart.showScreen("screen-splash"); //desktops and iOS in standalone	
		}
		else {
			console.log("elefart::setup(), show install screen");
			elefart.showScreen("screen-install"); //iOS not in standalone (inside Mobile Safari)
		}

		//BOOK: listing 3-20, p. 71
		

	}

	/** 
	 * export our public methods following the 
	 * 'revealing module' design pattern
	 */
    return {
       load:load, //p.28
       setup:setup, //p. 28
       isStandalone:isStandalone, //BOOK: p. 64 
       showScreen:showScreen, //BOOK: p. 34
       screens:screens, //BOOK: p 52
       gameStates:gameStates, //Game states (loading, running)
       state:state, //current game states
       DEBUG:DEBUG
    };
    
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
})();