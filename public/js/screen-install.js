<<<<<<< HEAD
/** 
 * @namespace
 * @fileoverview option to install the game to desktop, on devices (e.g. iOS)  
 * which have an "install to desktop" option for web apps.
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-install'] = (function () {

	var dom,
	id = 'screen-install',
	panel,
	firstTime = true;

	/** 
	 * @method init install-screen
	 * @description initialize the installation screen for iOS and other 
	 * platforms so that an icon can be copied to a desktop.
	 */
	function init () {
		dom = elefart.dom;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run install-screen
	 * @description show the install screen for adding the game icon to the 
	 * desktop.
	 */
	function run () {
		if(firstTime) {
			init();
		}
	}

	//returned object
	return {
		init:init,
		run:run
=======
/** @namespace */
elefart.screens['screen-install'] = (function () {
	
	var dom = elefart.dom,
		panel = document.getElementById('screen-install');
		firstRun = true;

	/** 
	 * @method run
	 * BOOK: Listing 3-20, p. 65
	 */
	function run () {
		//ADDED
		console.log("elefart.screens['screen-install']::run()");
	}

	return {
		run:run //BOOK: Listing 3-20, p. 65
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
	};

})();