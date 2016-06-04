<<<<<<< HEAD
/** 
 * @namespace
 * @fileoverview methods for loading screen when initial JS and 
 * asset loads are complete
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
 window.elefart.screens['screen-splash'] = (function () {

	var dom,
	id = 'screen-splash',
	panel,
	firstTime = true;

	/** 
	 * @method init splash-screen
	 * @description bind mouseclick to elefart.screens['screen-splash']
	 */
	function init () {
		dom = elefart.dom;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run splash-screen
	 * @description show the splash screen captured by elefart.screens['screen-splash']
	 */
	function run () {
		if(firstTime) {
			init();
		}

		//a mouseclick takes you to the game menu options

		dom.bind(panel, "click", function (e) { //needs the closure
			e.stopPropagation();
			e.preventDefault();
			dom.showScreenById("screen-menu");
			elefart.screens["screen-menu"].run();
		});
	}

	//returned object
	return {
		init:init,
		run:run
	};
	
=======
/** @namespace */
elefart.screens['screen-splash'] = (function () {
	
	var dom = elefart.dom,
		$ = dom.$,
		panel = document.getElementById('screen-splash');
		firstRun = true;

	/** 
	 * @method setup
	 */
	function setup () {
		dom.bind("#screen-splash", "click", function () {
			elefart.showScreen("screen-main-menu");
		});
	}

	/** 
	 * @method run
	 * BOOK: Listing 3-8, p. 52
	 */
	function run () {
		//ADDED
		console.log("elefart.screens['screen-splash']::run()");
		if(firstRun) {
			setup();
			firstRun = false;
		}
	}

	return {
		run:run //BOOK: Listing 3-8, p. 53
	};

>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
})();