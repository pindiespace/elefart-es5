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
	
})();