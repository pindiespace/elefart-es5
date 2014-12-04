/** @namespace */
var elefart = (function() {
	var screen,
		screens = {},
		activeScreen;

	/** 
	 * @method showScreen
	 * BOOK: Listing 2-11, p. 34
	 * displays the screen based on its id

	 * @param {String} screenId the id of the element we want to show
	 */
	function showScreen(screenId) {
		var dom = elefart.dom;
		var $ = dom.$;

		//grab any screen (if one is active) into activeScreen
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
			console.log("elefart.showScreen() "+ screenId+" - Screen module not implemented yet");
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

		//ADDED
		console.log("in elefart.load()");
		console.log("srcArr is:" + srcArr);

		/* 
		 * example of direct load
		 * @link http://stackoverflow.com/questions/8909862/loading-scripts-using-modernizr-not-working
		 */
		head.load(srcArr, callback);
		scrArr = []; //HeadJS appears to add the callback to srcArr, so clear
		
		//ADDED

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
	 * @method setup
	 * BOOK: Listing 2-6, p. 28, augmented in 
	 * Listin 3-18, p. 64
	 */
	function setup () {
		//ADDED
		console.log("yay we are in elefart.setup()");
		console.log("isStandalone returned:" + isStandalone());
		if(isStandalone()) {
			console.log("in setup(), about to show splash screen");
			elefart.showScreen("splash-screen"); //desktops and iOS in standalone	
		}
		else {
			console.log("in setup(), about to show install screen");
			elefart.showScreen("install-screen"); //iOS not in standalone (inside Mobile Safari)
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
       screens:screens //BOOK: p 52
    };
    
})();